/**
 * Decides whether this device should render the real-time 3D scene.
 * Anything that fails here gets the static poster instead, which carries the
 * same content. Browser-only: call from afterNextRender.
 */
export type RenderTier = 'full' | 'lite' | 'none';

interface NavigatorHints extends Navigator {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
}

export function renderTier(win: Window): RenderTier {
  const nav = win.navigator as NavigatorHints;
  if (win.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'none';
  if (nav.connection?.saveData) return 'none';
  if (!webglAvailable(win.document)) return 'none';

  const smallScreen = win.matchMedia('(max-width: 47.99rem)').matches;
  const coarse = win.matchMedia('(pointer: coarse)').matches;
  const lowMemory = (nav.deviceMemory ?? 8) <= 2;
  const fewCores = (nav.hardwareConcurrency ?? 8) <= 2;
  if (lowMemory && fewCores) return 'none';
  return smallScreen || coarse || lowMemory ? 'lite' : 'full';
}

function webglAvailable(doc: Document): boolean {
  try {
    const canvas = doc.createElement('canvas');
    const gl = (canvas.getContext('webgl2') ?? canvas.getContext('webgl')) as WebGLRenderingContext | null;
    if (!gl) return false;
    // Release the probe context immediately so it does not count against the page's limit.
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}
