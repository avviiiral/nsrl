import {
  ACESFilmicToneMapping,
  CatmullRomCurve3,
  Material,
  Mesh,
  PerspectiveCamera,
  SRGBColorSpace,
  Scene,
  Texture,
  Vector3,
  WebGLRenderer,
} from 'three';
import { buildEnvironment, Environment } from './environment';
import { buildRoad, Road } from './road';
import { buildTruck, Truck } from './truck';

export interface HighwaySceneOptions {
  canvas: HTMLCanvasElement;
  quality: 'full' | 'lite';
  logoUrl: string;
  /** Called once the first frame is on screen, so the poster can fade out. */
  onReady?: () => void;
  /** Called if the GPU drops the context; the host should fall back to the poster. */
  onLost?: () => void;
}

/** Truck sits in the left lane: India keeps left. */
const LANE_X = -1.8;

/**
 * Camera keyframes along the hero's scroll: a low front three-quarter view,
 * a sweep round to the livery side, then up and behind to look down the
 * highway toward the sunset.
 */
const SHOTS = [
  { pos: [4.4, 1.0, -15.5], look: [-1.6, 2.2, -1.2], fov: 32 },
  { pos: [12.5, 1.5, -10.5], look: [-1.8, 2.15, -0.8], fov: 32 },
  { pos: [17.5, 2.6, -0.6], look: [-1.8, 2.05, 0.2], fov: 32 },
  { pos: [1.6, 5.8, 17], look: [-2.9, 1.2, -42], fov: 44 },
] as const;

/** How far the subject is pushed off-centre: right on desktop, up on phones. */
const SIDE_SHIFT = 0.46;
const MIN_DPR = 0.6;
const UP_SHIFT = 0.62;

export class HighwayScene {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(SHOTS[0].fov, 1, 0.1, 900);
  private readonly path = new CatmullRomCurve3(SHOTS.map((s) => new Vector3(...s.pos)), false, 'centripetal');
  private readonly aim = new CatmullRomCurve3(SHOTS.map((s) => new Vector3(...s.look)), false, 'centripetal');
  private env!: Environment;
  private road!: Road;
  private truck!: Truck;

  private target = 0;
  private progress = 0;
  private pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  private framing: 'side' | 'center' = 'side';
  private width = 1;
  private height = 1;
  private dpr: number;
  private raf = 0;
  private running = false;
  private last = 0;
  private time = 0;
  private distance = 0;
  private sampleTime = 0;
  private sampleFrames = 0;
  private struggling = 0;
  /** Set when the GPU cannot keep up even at the lowest resolution: frames are drawn on scroll only. */
  private stillMode = false;
  private readied = false;
  private disposed = false;
  private readonly look = new Vector3();
  private readonly pos = new Vector3();

  private constructor(private readonly opts: HighwaySceneOptions) {
    const full = opts.quality === 'full';
    this.dpr = Math.min(window.devicePixelRatio || 1, full ? 1.75 : 1.25);
    this.renderer = new WebGLRenderer({
      canvas: opts.canvas,
      antialias: full,
      alpha: false,
      powerPreference: full ? 'high-performance' : 'low-power',
      stencil: false,
    });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.setPixelRatio(this.dpr);
    opts.canvas.addEventListener('webglcontextlost', this.onLost, false);
    document.addEventListener('visibilitychange', this.onVisibility);
  }

  static async create(opts: HighwaySceneOptions): Promise<HighwayScene> {
    const scene = new HighwayScene(opts);
    const logo = await loadImage(opts.logoUrl);
    // The livery is lettered in the site's typeface; wait for it so the canvas does not fall back.
    await document.fonts?.load("780 104px 'Archivo Variable'").catch(() => undefined);
    if (scene.disposed) return scene;
    try {
      await scene.build(logo);
    } catch {
      // Disposed mid-build or the GPU refused a shader: the poster simply stays.
    }
    return scene;
  }

  /**
   * Built in steps that hand the main thread back between them, and with
   * shaders compiled asynchronously, so taps and scrolling stay responsive
   * while the scene is being prepared.
   */
  private async build(logo: HTMLImageElement | null): Promise<void> {
    const anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    this.env = buildEnvironment(this.renderer, this.scene);
    await yieldToMain();
    this.road = buildRoad({ quality: this.opts.quality, anisotropy });
    await yieldToMain();
    this.truck = buildTruck({ logo, quality: this.opts.quality, anisotropy });
    this.truck.group.position.x = LANE_X;
    this.scene.add(this.env.group, this.road.group, this.truck.group);
    this.road.update(0, 0);
    this.place(0);
    await yieldToMain();
    await this.renderer.compileAsync(this.scene, this.camera);
  }

  /** Scroll progress through the hero, 0 → 1. The camera eases toward it. */
  setProgress(p: number): void {
    this.target = Math.min(1, Math.max(0, p));
    if (!this.running) this.renderOnce();
  }

  /** True once the scene has given up continuous animation on a slow GPU. */
  get still(): boolean {
    return this.stillMode;
  }

  /** Pointer position over the hero, each axis −1 → 1. */
  setPointer(x: number, y: number): void {
    this.pointer.tx = x;
    this.pointer.ty = y;
  }

  /** `side` keeps the truck clear of a left-hand text column; `center` suits phones. */
  setFraming(f: 'side' | 'center'): void {
    this.framing = f;
  }

  resize(width: number, height: number): void {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.renderer.setSize(this.width, this.height, false);
    this.camera.aspect = this.width / this.height;
    if (!this.running) this.renderOnce();
  }

  play(): void {
    if (this.running || this.disposed || !this.truck || this.stillMode) return;
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  pause(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  /** Render a single frame (static mode, or while paused after a resize). */
  renderOnce(): void {
    if (!this.truck || this.disposed) return;
    this.progress = this.target;
    this.place(0);
    this.renderer.render(this.scene, this.camera);
    this.ready();
  }

  dispose(): void {
    this.disposed = true;
    this.pause();
    this.opts.canvas.removeEventListener('webglcontextlost', this.onLost, false);
    document.removeEventListener('visibilitychange', this.onVisibility);
    const textures = new Set<Texture>();
    this.scene.traverse((o) => {
      if (!(o instanceof Mesh)) return;
      o.geometry.dispose();
      const mats: Material[] = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of mats) {
        for (const v of Object.values(m)) if (v instanceof Texture) textures.add(v);
        m.dispose();
      }
    });
    textures.forEach((t) => t.dispose());
    this.env?.dispose();
    this.scene.clear();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }

  private readonly tick = (now: number): void => {
    if (!this.running) return;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.time += dt;
    if (!this.adapt(now)) return;

    // Ease toward the scroll position: the camera glides, it never jumps.
    this.progress += (this.target - this.progress) * (1 - Math.exp(-dt * 4.5));
    this.pointer.x += (this.pointer.tx - this.pointer.x) * (1 - Math.exp(-dt * 3));
    this.pointer.y += (this.pointer.ty - this.pointer.y) * (1 - Math.exp(-dt * 3));

    const speed = 15 + this.progress * 6; // m/s
    this.distance += speed * dt;
    this.road.update(dt, speed);
    this.truck.update(this.time, this.distance);
    this.place(dt);

    this.renderer.render(this.scene, this.camera);
    this.ready();
    this.raf = requestAnimationFrame(this.tick);
  };

  private place(_dt: number): void {
    const p = this.progress;
    this.path.getPoint(p, this.pos);
    this.aim.getPoint(p, this.look);
    this.pos.x += this.pointer.x * 0.6;
    this.pos.y += -this.pointer.y * 0.3;
    this.camera.position.copy(this.pos);
    this.camera.lookAt(this.look);

    const seg = Math.min(SHOTS.length - 2, Math.floor(p * (SHOTS.length - 1)));
    const local = p * (SHOTS.length - 1) - seg;
    const fov = SHOTS[seg].fov + (SHOTS[seg + 1].fov - SHOTS[seg].fov) * smooth(local);
    // Shots are composed for a landscape screen; on a portrait screen widen the
    // view (moderately, to avoid distortion) so the whole truck stays in frame.
    const aspect = this.width / this.height;
    let widen = Math.max(1, Math.pow(1.6 / aspect, 0.62));
    // A taller virtual frame (used to lift the subject) also magnifies it; undo that.
    if (this.framing === 'center') widen *= 1 + UP_SHIFT;
    this.camera.fov = (2 * Math.atan(Math.tan((fov * Math.PI) / 360) * widen) * 180) / Math.PI;

    // Off-centre framing: render a wider (or taller) frustum and show part of it,
    // so the truck sits beside the copy instead of behind it.
    if (this.framing === 'side') {
      this.camera.setViewOffset(this.width * (1 + SIDE_SHIFT), this.height, 0, 0, this.width, this.height);
    } else {
      this.camera.setViewOffset(this.width, this.height * (1 + UP_SHIFT), 0, this.height * UP_SHIFT, this.width, this.height);
    }
    this.camera.updateProjectionMatrix();
  }

  /**
   * Keeps the page responsive on weak GPUs. Every second, look at the frame
   * rate: below 30 fps, render fewer pixels; still below 20 fps at the lowest
   * resolution, stop the loop and draw only when the reader scrolls.
   * Returns false when the loop has been stopped.
   */
  private adapt(now: number): boolean {
    if (!this.sampleTime) this.sampleTime = now;
    this.sampleFrames++;
    const elapsed = now - this.sampleTime;
    if (elapsed < 1000) return true;
    const fps = (this.sampleFrames * 1000) / elapsed;
    this.sampleTime = now;
    this.sampleFrames = 0;
    if (fps >= 30) {
      this.struggling = 0;
      return true;
    }
    if (this.dpr > MIN_DPR) {
      this.dpr = Math.max(MIN_DPR, this.dpr - 0.35);
      this.renderer.setPixelRatio(this.dpr);
      this.renderer.setSize(this.width, this.height, false);
      return true;
    }
    if (fps < 20 && ++this.struggling >= 2) {
      this.stillMode = true;
      this.pause();
      this.renderOnce();
      return false;
    }
    return true;
  }

  private ready(): void {
    if (this.readied) return;
    this.readied = true;
    this.opts.onReady?.();
  }

  private readonly onLost = (e: Event): void => {
    e.preventDefault();
    this.pause();
    this.opts.onLost?.();
  };

  private resumeOnShow = false;
  private readonly onVisibility = (): void => {
    if (document.hidden) {
      this.resumeOnShow = this.running;
      this.pause();
    } else if (this.resumeOnShow) {
      this.play();
    }
  };
}

function yieldToMain(): Promise<void> {
  const sched = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
  return sched?.yield ? sched.yield() : new Promise((r) => setTimeout(r, 0));
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

async function loadImage(url: string): Promise<HTMLImageElement | null> {
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    return img;
  } catch {
    return null; // the livery is still drawn, just without the logo
  }
}
