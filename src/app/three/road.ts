import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  Quaternion,
  Vector3,
} from 'three';
import { ROAD, radialTexture, roadTexture } from './textures';

/**
 * The carriageway and everything that streams past the truck.
 *
 * The truck never moves; the world does. The road surface scrolls its
 * texture, and roadside furniture is instanced and recycled as it passes the
 * camera, so the cost is fixed no matter how long the page stays open.
 */
export interface Road {
  group: Group;
  update(dt: number, speed: number): void;
}

const NEAR = 40; // props are recycled once they pass this far behind the truck
const FAR = -260;
const SPAN = NEAR - FAR;

interface Stream {
  mesh: InstancedMesh;
  z: Float32Array;
  place: (i: number, z: number, m: Matrix4) => void;
}

export function buildRoad(opts: { quality: 'full' | 'lite'; anisotropy: number }): Road {
  const group = new Group();
  const full = opts.quality === 'full';

  // --- Surface ----------------------------------------------------------------
  const tex = roadTexture(opts.anisotropy);
  const length = SPAN + 40;
  tex.repeat.set(1, length / ROAD.tile);
  const surface = new Mesh(new PlaneGeometry(ROAD.width, length), new MeshStandardMaterial({ map: tex, roughness: 0.92, metalness: 0 }));
  surface.rotation.x = -Math.PI / 2;
  surface.position.set(0, 0, (NEAR + FAR) / 2);
  group.add(surface);

  // Verge and fields either side, fading into fog.
  const verge = new Mesh(new PlaneGeometry(400, length), new MeshStandardMaterial({ color: '#1c1a17', roughness: 1 }));
  verge.rotation.x = -Math.PI / 2;
  verge.position.set(0, -0.03, (NEAR + FAR) / 2);
  group.add(verge);

  // --- Street furniture ----------------------------------------------------------
  const streams: Stream[] = [];
  const stream = (mesh: InstancedMesh, spacing: number, offset: number, place: Stream['place']) => {
    const z = new Float32Array(mesh.count);
    const m = new Matrix4();
    for (let i = 0; i < mesh.count; i++) {
      z[i] = NEAR - offset - i * spacing;
      place(i, z[i], m);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.frustumCulled = false;
    group.add(mesh);
    streams.push({ mesh, z, place });
  };
  const at = (x: number, y: number, z: number, sx = 1, sy = 1, sz = 1) =>
    new Matrix4().compose(new Vector3(x, y, z), new Quaternion(), new Vector3(sx, sy, sz));

  // Kilometre stones on the left verge: white body, yellow national-highway cap.
  const stoneGap = 40;
  const stoneCount = Math.ceil(SPAN / stoneGap);
  const stoneBody = new InstancedMesh(new BoxGeometry(0.42, 0.62, 0.18), new MeshStandardMaterial({ color: '#e9e7e1', roughness: 0.8 }), stoneCount);
  const capGeo = new CylinderGeometry(0.21, 0.21, 0.18, 16, 1, false, 0, Math.PI);
  capGeo.rotateZ(Math.PI / 2);
  capGeo.rotateY(Math.PI / 2);
  const stoneCap = new InstancedMesh(capGeo, new MeshStandardMaterial({ color: '#f6b900', roughness: 0.6 }), stoneCount);
  const stoneX = -ROAD.width / 2 - 0.8;
  stream(stoneBody, stoneGap, 6, (i, z, m) => stoneBody.setMatrixAt(i, m.copy(at(stoneX, 0.31, z))));
  stream(stoneCap, stoneGap, 6, (i, z, m) => stoneCap.setMatrixAt(i, m.copy(at(stoneX, 0.62, z))));

  // Delineator posts on both verges, with a reflector that catches the headlamps.
  const postGap = full ? 16 : 24;
  const postCount = Math.ceil(SPAN / postGap) * 2;
  const posts = new InstancedMesh(new BoxGeometry(0.1, 0.9, 0.1), new MeshStandardMaterial({ color: '#d8d6cf', roughness: 0.7 }), postCount);
  const reflectors = new InstancedMesh(new BoxGeometry(0.11, 0.12, 0.11), new MeshBasicMaterial({ color: '#ffb02e' }), postCount);
  const postX = (i: number) => (i % 2 ? 1 : -1) * (ROAD.width / 2 + 0.25);
  stream(posts, postGap / 2, 0, (i, z, m) => posts.setMatrixAt(i, m.copy(at(postX(i), 0.45, z))));
  stream(reflectors, postGap / 2, 0, (i, z, m) => reflectors.setMatrixAt(i, m.copy(at(postX(i), 0.78, z))));

  // Street lights on the far (left) verge, arms reaching over the carriageway.
  // Every camera shot sits on the near side, so no pole ever crosses the lens.
  const lampGap = full ? 46 : 64;
  const lampCount = Math.ceil(SPAN / lampGap);
  const poleMat = new MeshStandardMaterial({ color: '#4a4f53', roughness: 0.6, metalness: 0.5 });
  const poles = new InstancedMesh(new CylinderGeometry(0.09, 0.13, 9, 8), poleMat, lampCount);
  const arms = new InstancedMesh(new BoxGeometry(2.4, 0.1, 0.12), poleMat, lampCount);
  const heads = new InstancedMesh(new BoxGeometry(0.7, 0.14, 0.32), new MeshBasicMaterial({ color: '#ffe2b0' }), lampCount);
  const glowMat = new MeshBasicMaterial({
    map: radialTexture('rgba(255,200,130,0.9)', 'rgba(255,200,130,0)'),
    transparent: true,
    depthWrite: false,
    blending: 2,
  });
  const glows = new InstancedMesh(new PlaneGeometry(2.3, 2.3), glowMat, lampCount);
  const poolMat = new MeshBasicMaterial({
    map: radialTexture('rgba(255,190,120,0.28)', 'rgba(255,190,120,0)'),
    transparent: true,
    depthWrite: false,
    blending: 2,
  });
  const poolGeo = new PlaneGeometry(9, 9);
  poolGeo.rotateX(-Math.PI / 2);
  const pools = new InstancedMesh(poolGeo, poolMat, lampCount);
  const poleX = -(ROAD.width / 2 + 1.1);
  stream(poles, lampGap, 20, (i, z, m) => poles.setMatrixAt(i, m.copy(at(poleX, 4.5, z))));
  stream(arms, lampGap, 20, (i, z, m) => arms.setMatrixAt(i, m.copy(at(poleX + 1.15, 8.95, z))));
  stream(heads, lampGap, 20, (i, z, m) => heads.setMatrixAt(i, m.copy(at(poleX + 2.2, 8.85, z))));
  stream(glows, lampGap, 20, (i, z, m) => glows.setMatrixAt(i, m.copy(at(poleX + 2.2, 8.7, z))));
  stream(pools, lampGap, 20, (i, z, m) => pools.setMatrixAt(i, m.copy(at(poleX + 3.2, 0.015, z))));

  // Oncoming traffic in the right-hand lane (India drives on the left): just
  // headlamp pairs, which is all you see of a lorry at dusk. They appear far
  // off and dip away (shrink) before they reach the cameras, as if over a crest.
  const carCount = full ? 3 : 2;
  const carLamps = new InstancedMesh(new PlaneGeometry(1.6, 1.6), glowMat.clone(), carCount * 2);
  (carLamps.material as MeshBasicMaterial).map = radialTexture('rgba(255,248,230,1)', 'rgba(255,248,230,0)');
  const carGap = SPAN / carCount;
  stream(carLamps, carGap / 2, 30, (i, z, m) => {
    const car = Math.floor(i / 2);
    const side = i % 2 ? 0.8 : -0.8;
    carLamps.setMatrixAt(i, m.copy(at(1.8 + side, 0.9, NEAR - 30 - car * carGap)));
  });
  const CAR_GONE = -55;
  const carZ = new Float32Array(carCount).map((_, c) => CAR_GONE - 10 - c * ((CAR_GONE - FAR) / carCount));

  // Glow sprites face the camera by facing +Z; good enough for a chase camera,
  // and they are additive, so seen edge-on they simply vanish.
  const scratch = new Matrix4();
  const pos = new Vector3();
  const quat = new Quaternion();
  const scl = new Vector3();
  const dummy = new Object3D();

  return {
    group,
    update(dt: number, speed: number) {
      const move = speed * dt;
      tex.offset.y = (tex.offset.y + move / ROAD.tile) % 1;

      for (const s of streams) {
        if (s.mesh === carLamps) continue;
        for (let i = 0; i < s.z.length; i++) {
          s.z[i] += move;
          if (s.z[i] > NEAR) s.z[i] -= SPAN;
          s.mesh.getMatrixAt(i, scratch);
          scratch.decompose(pos, quat, scl);
          pos.z = s.z[i];
          scratch.compose(pos, quat, scl);
          s.mesh.setMatrixAt(i, scratch);
        }
        s.mesh.instanceMatrix.needsUpdate = true;
      }

      // Oncoming vehicles close at their own speed plus ours.
      for (let c = 0; c < carZ.length; c++) {
        carZ[c] += move + 22 * dt;
        if (carZ[c] > CAR_GONE) carZ[c] -= CAR_GONE - FAR;
        const fade = Math.min(1, Math.max(0, (CAR_GONE - carZ[c]) / 40));
        for (const side of [-0.8, 0.8]) {
          dummy.position.set(1.8 + side, 0.9, carZ[c]);
          dummy.scale.setScalar(fade);
          dummy.updateMatrix();
          carLamps.setMatrixAt(c * 2 + (side > 0 ? 1 : 0), dummy.matrix);
        }
      }
      carLamps.instanceMatrix.needsUpdate = true;
    },
  };
}
