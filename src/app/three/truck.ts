import {
  BoxGeometry,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  Group,
  InstancedMesh,
  Material,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Texture,
  Vector3,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { beamTexture, liveryTexture, radialTexture, rearDoorTexture } from './textures';

/**
 * A medium-duty box truck, in the spirit of the NSRL Eicher in the company's
 * own photograph: a red cab and a white container carrying the NSRL logo.
 *
 * Built from primitives so it costs nothing to download. Origin is on the
 * ground at the centre of the wheelbase; the cab faces -Z.
 */
export interface Truck {
  group: Group;
  update(time: number, distance: number): void;
}

export const TRUCK = {
  wheelRadius: 0.52,
  width: 2.42,
};

export function buildTruck(opts: { logo: HTMLImageElement | null; quality: 'full' | 'lite'; anisotropy: number }): Truck {
  const group = new Group();
  const body = new Group(); // sprung mass: everything above the axles
  group.add(body);

  const full = opts.quality === 'full';
  const paint = full
    ? new MeshPhysicalMaterial({ color: new Color('#c9261a'), roughness: 0.32, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.12 })
    : new MeshStandardMaterial({ color: new Color('#c9261a'), roughness: 0.35, metalness: 0.15 });
  const darkTrim = new MeshStandardMaterial({ color: '#16191b', roughness: 0.65, metalness: 0.2 });
  const chrome = new MeshStandardMaterial({ color: '#c7ccd0', roughness: 0.18, metalness: 1 });
  const glass = new MeshStandardMaterial({ color: '#2a3d47', roughness: 0.08, metalness: 0.55, envMapIntensity: 1.8 });
  const rubber = new MeshStandardMaterial({ color: '#141516', roughness: 0.92, metalness: 0 });
  const rim = new MeshStandardMaterial({ color: '#9aa0a4', roughness: 0.35, metalness: 0.85 });
  const headlamp = new MeshBasicMaterial({ color: '#fff4dd' });
  const taillamp = new MeshBasicMaterial({ color: '#ff2a1a' });
  const amber = new MeshBasicMaterial({ color: '#ffae2a' });

  const add = (geo: BoxGeometry | RoundedBoxGeometry | CylinderGeometry | PlaneGeometry | CircleGeometry, mat: Material, x: number, y: number, z: number, parent: Group = body) => {
    const m = new Mesh(geo, mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };

  // --- Chassis -------------------------------------------------------------
  add(new BoxGeometry(1.05, 0.28, 8.6), darkTrim, 0, 0.82, -0.05);
  // Fuel tank and battery box between the axles, on the near side.
  const tank = add(new CylinderGeometry(0.3, 0.3, 1.1, 20), chrome, 0.82, 0.78, -1.6);
  tank.rotation.x = Math.PI / 2;
  add(new BoxGeometry(0.45, 0.5, 0.7), darkTrim, -0.8, 0.8, -1.5);

  // --- Cab -------------------------------------------------------------------
  const cabZ = -3.35;
  add(new RoundedBoxGeometry(2.34, 1.95, 2.0, 4, 0.14), paint, 0, 2.0, cabZ);
  // Roof deflector toward the taller container.
  const deflector = add(new RoundedBoxGeometry(2.2, 0.55, 1.2, 3, 0.12), paint, 0, 3.1, cabZ + 0.35);
  deflector.rotation.x = -0.28;
  // Windscreen, side windows.
  const screen = add(new PlaneGeometry(2.02, 0.92), glass, 0, 2.42, cabZ - 1.006);
  screen.rotation.y = Math.PI;
  for (const s of [-1, 1]) {
    const win = add(new PlaneGeometry(0.95, 0.72), glass, s * 1.172, 2.48, cabZ - 0.3);
    win.rotation.y = s * (Math.PI / 2);
  }
  // Grille: horizontal slats, the same rhythm as the stripes in the NSRL logo.
  add(new BoxGeometry(1.5, 0.62, 0.06), darkTrim, 0, 1.55, cabZ - 1.02);
  for (let i = 0; i < 5; i++) add(new BoxGeometry(1.46, 0.045, 0.04), chrome, 0, 1.3 + i * 0.12, cabZ - 1.06);
  // Bumper and headlamps.
  add(new RoundedBoxGeometry(2.4, 0.34, 0.3, 2, 0.06), darkTrim, 0, 1.0, cabZ - 1.02);
  for (const s of [-1, 1]) {
    add(new RoundedBoxGeometry(0.42, 0.2, 0.06, 2, 0.04), headlamp, s * 0.86, 1.56, cabZ - 1.03);
    add(new BoxGeometry(0.16, 0.08, 0.04), amber, s * 1.08, 1.56, cabZ - 1.03);
    // Mirrors on outriggers.
    add(new BoxGeometry(0.42, 0.04, 0.04), darkTrim, s * 1.33, 2.55, cabZ - 0.75);
    add(new RoundedBoxGeometry(0.1, 0.44, 0.22, 2, 0.03), darkTrim, s * 1.55, 2.4, cabZ - 0.75);
    // Cab step.
    add(new BoxGeometry(0.3, 0.06, 0.5), chrome, s * 1.1, 0.95, cabZ + 0.2);
  }

  // --- Container -----------------------------------------------------------
  const boxLen = 6.4;
  const boxZ = 0.95;
  const right = liveryTexture(opts.logo, 'right', opts.anisotropy); // +X face reads rear → cab
  const left = liveryTexture(opts.logo, 'left', opts.anisotropy);
  const panel = (map?: Texture) => new MeshStandardMaterial({ color: '#ffffff', map, roughness: 0.55, metalness: 0.05 });
  const roof = new MeshStandardMaterial({ color: '#d9d8d3', roughness: 0.6 });
  const container = new Mesh(new BoxGeometry(2.46, 2.8, boxLen), [
    panel(right),
    panel(left),
    roof,
    darkTrim,
    panel(rearDoorTexture()),
    roof,
  ]);
  container.position.set(0, 2.62, boxZ);
  body.add(container);
  // Corner posts.
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(new BoxGeometry(0.08, 2.84, 0.08), roof, sx * 1.24, 2.62, boxZ + sz * (boxLen / 2));

  // Rear: under-run bar, tail lamps, reflectors.
  const rearZ = boxZ + boxLen / 2;
  add(new BoxGeometry(2.3, 0.14, 0.1), darkTrim, 0, 0.72, rearZ - 0.05);
  for (const s of [-1, 1]) {
    add(new BoxGeometry(0.34, 0.16, 0.05), taillamp, s * 0.95, 1.1, rearZ + 0.01);
    add(new BoxGeometry(0.12, 0.16, 0.05), amber, s * 0.68, 1.1, rearZ + 0.01);
  }

  // --- Wheels --------------------------------------------------------------
  const r = TRUCK.wheelRadius;
  const tyreGeo = new CylinderGeometry(r, r, 0.34, full ? 28 : 18);
  tyreGeo.rotateZ(Math.PI / 2);
  const rimGeo = new CylinderGeometry(r * 0.58, r * 0.58, 0.36, full ? 20 : 12);
  rimGeo.rotateZ(Math.PI / 2);
  const hubGeo = new CylinderGeometry(r * 0.16, r * 0.16, 0.4, 10);
  hubGeo.rotateZ(Math.PI / 2);

  const wheels: Group[] = [];
  const axles: [number, boolean][] = [
    [cabZ - 0.2, false],
    [2.15, true],
    [3.32, true],
  ];
  for (const [z, dual] of axles) {
    for (const s of [-1, 1]) {
      const offsets = dual ? [0.86, 1.2] : [1.03];
      for (const o of offsets) {
        const w = new Group();
        w.position.set(s * o, r, z);
        w.add(new Mesh(tyreGeo, rubber));
        w.add(new Mesh(rimGeo, rim));
        w.add(new Mesh(hubGeo, chrome));
        group.add(w);
        wheels.push(w);
      }
    }
  }
  // Mudguards over the tandem.
  for (const s of [-1, 1]) add(new BoxGeometry(0.5, 0.06, 2.4), darkTrim, s * 1.03, 1.13, 2.74);

  // --- Light: contact shadow, headlamp glow and beams on the road ------------
  const shadow = new Mesh(
    new PlaneGeometry(3.6, 10.5),
    new MeshBasicMaterial({ map: radialTexture('rgba(0,0,0,0.75)', 'rgba(0,0,0,0)'), transparent: true, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, 0.012, -0.1);
  group.add(shadow);

  const beam = new Mesh(
    new PlaneGeometry(7, 26),
    new MeshBasicMaterial({ map: beamTexture(), transparent: true, depthWrite: false, blending: 2 /* Additive */ }),
  );
  beam.rotation.x = -Math.PI / 2;
  beam.rotation.z = Math.PI;
  beam.position.set(0, 0.02, cabZ - 1.1 - 13);
  group.add(beam);

  const glowMat = new MeshBasicMaterial({
    map: radialTexture('rgba(255,240,210,0.95)', 'rgba(255,240,210,0)'),
    transparent: true,
    depthWrite: false,
    blending: 2,
    side: DoubleSide,
  });
  const glows = new InstancedMesh(new PlaneGeometry(1, 1), glowMat, 2);
  const m4 = new Matrix4();
  [-0.86, 0.86].forEach((x, i) => {
    m4.compose(new Vector3(x, 1.56, cabZ - 1.12), group.quaternion, new Vector3(1.1, 0.7, 1));
    glows.setMatrixAt(i, m4);
  });
  group.add(glows);

  const tailGlowMat = glowMat.clone();
  tailGlowMat.map = radialTexture('rgba(255,60,40,0.9)', 'rgba(255,60,40,0)');
  for (const s of [-1, 1]) {
    const tg = add(new PlaneGeometry(0.9, 0.55), tailGlowMat, s * 0.95, 1.1, rearZ + 0.06, group);
    tg.renderOrder = 2;
  }

  return {
    group,
    update(time: number, distance: number) {
      const spin = -distance / r;
      for (const w of wheels) w.rotation.x = spin;
      // Suspension: a slow heave with a quicker road-texture shimmer, and a little roll.
      body.position.y = Math.sin(time * 1.7) * 0.012 + Math.sin(time * 9.3) * 0.004;
      body.rotation.z = Math.sin(time * 0.9) * 0.004;
      body.rotation.x = Math.sin(time * 1.3 + 1) * 0.0025;
    },
  };
}
