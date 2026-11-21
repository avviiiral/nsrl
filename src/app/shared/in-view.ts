/**
 * Watches an element for scroll-triggered effects without forcing layout.
 *
 * The observer's first report says whether the element started on screen;
 * `arm` decides from that whether to prepare an entrance (it is never called
 * for elements already visible, so nothing on screen blinks out and back in).
 * `enter` then runs once, when the element scrolls far enough into view.
 * Returns a function that stops watching.
 */
export function watchEntrance(el: Element, arm: () => boolean | void, enter: () => void, threshold = 0.15): () => void {
  let first = true;
  const io = new IntersectionObserver(
    ([e]) => {
      if (first) {
        first = false;
        if (e.isIntersecting || arm() === false) {
          io.disconnect();
          return;
        }
      }
      if (e.isIntersecting && e.intersectionRatio >= threshold) {
        enter();
        io.disconnect();
      }
    },
    { threshold: [0, threshold] },
  );
  io.observe(el);
  return () => io.disconnect();
}
