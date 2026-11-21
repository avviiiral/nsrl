import {
  BackSide,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Fog,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  PMREMGenerator,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Texture,
  Vector3,
  WebGLRenderer,
} from 'three';
import { horizonLightsTexture } from './textures';

/**
 * Dusk on an open highway: a graded sky with a low sun ahead, hills on the
 * horizon, town lights, fog, and the lights that model the truck.
 */
export const PALETTE = {
  zenith: new Color('#0a0f1c'),
  upper: new Color('#1d2440'),
  horizon: new Color('#c9683f'),
  haze: new Color('#3b2f36'),
  sun: new Color('#ffb27a'),
};

export interface Environment {
  group: Group;
  envMap: Texture;
  dispose(): void;
}

const SUN_DIR = new Vector3(-0.35, 0.06, -1).normalize();

function skyMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    side: BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      zenith: { value: PALETTE.zenith },
      upper: { value: PALETTE.upper },
      horizon: { value: PALETTE.horizon },
      haze: { value: PALETTE.haze },
      sun: { value: PALETTE.sun },
      sunDir: { value: SUN_DIR },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize((modelMatrix * vec4(position, 1.0)).xyz - cameraPosition);
        vec4 p = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
        gl_Position = p.xyww;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 zenith, upper, horizon, haze, sun, sunDir;
      varying vec3 vDir;
      void main() {
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 col = mix(haze, horizon, smoothstep(-0.02, 0.035, h));
        col = mix(col, upper, smoothstep(0.03, 0.28, h));
        col = mix(col, zenith, smoothstep(0.25, 0.85, h));
        float s = max(dot(d, sunDir), 0.0);
        col += sun * (pow(s, 380.0) * 2.4 + pow(s, 24.0) * 0.35 + pow(s, 4.0) * 0.12) * smoothstep(-0.05, 0.02, h);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
}

/** A ring of low hills, built as a jagged cylinder wall well inside the fog. */
function hills(radius: number, height: number, seed: number, color: string): Mesh {
  const seg = 160;
  const geo = new CylinderGeometry(radius, radius, height, seg, 1, true);
  const pos = geo.attributes['position'];
  let s = seed;
  const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const peaks = Array.from({ length: seg + 1 }, () => rand());
  for (let i = 0; i < pos.count; i++) {
    if (pos.getY(i) > 0) {
      const a = Math.atan2(pos.getZ(i), pos.getX(i));
      const k = Math.round(((a + Math.PI) / (Math.PI * 2)) * seg);
      const ridge = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(a * 5 + seed)) * (0.6 + 0.4 * peaks[k]);
      pos.setY(i, -height / 2 + height * ridge);
    }
  }
  geo.computeVertexNormals();
  const mesh = new Mesh(geo, new MeshBasicMaterial({ color, side: BackSide, fog: true }));
  mesh.position.y = height / 2 - 0.5;
  return mesh;
}

export function buildEnvironment(renderer: WebGLRenderer, scene: Scene): Environment {
  const group = new Group();

  const sky = new Mesh(new SphereGeometry(480, 32, 16), skyMaterial());
  sky.renderOrder = -1;
  group.add(sky);

  scene.fog = new Fog(PALETTE.haze, 45, 300);
  scene.background = PALETTE.haze;

  group.add(hills(330, 40, 3, '#241f29'));
  group.add(hills(250, 22, 11, '#1b1820'));

  // Distant town lights, just above the horizon line.
  const townTex = horizonLightsTexture();
  townTex.repeat.set(3, 1);
  const town = new Mesh(
    new CylinderGeometry(240, 240, 6, 96, 1, true),
    new MeshBasicMaterial({ map: townTex, transparent: true, side: BackSide, depthWrite: false, blending: 2, fog: false, opacity: 0.8 }),
  );
  town.position.y = 1.4;
  group.add(town);

  // Lights: dusk sky fill, a low warm sun from ahead, a cool kicker from behind.
  group.add(new HemisphereLight('#a497ad', '#2e2420', 0.85));
  const sun = new DirectionalLight('#ffb07e', 2.8);
  sun.position.copy(SUN_DIR).multiplyScalar(60).setY(9);
  group.add(sun);
  const kicker = new DirectionalLight('#a9bcff', 0.9);
  kicker.position.set(14, 10, 18);
  group.add(kicker);

  // Reflections for paint and glass come from the same sky, prefiltered once.
  const pmrem = new PMREMGenerator(renderer);
  const envScene = new Scene();
  envScene.add(new Mesh(new SphereGeometry(10, 32, 16), skyMaterial()));
  const envMap = pmrem.fromScene(envScene, 0.02).texture;
  envScene.traverse((o) => {
    if (o instanceof Mesh) {
      o.geometry.dispose();
      (o.material as ShaderMaterial).dispose();
    }
  });
  pmrem.dispose();
  scene.environment = envMap;

  return {
    group,
    envMap,
    dispose() {
      envMap.dispose();
      townTex.dispose();
    },
  };
}
