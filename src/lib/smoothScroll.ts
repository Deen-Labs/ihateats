/**
 * Smoothly scrolls to a target element or Y-position using a requestAnimationFrame VSync loop.
 * Automatically adapts to the display's native refresh rate (60Hz, 90Hz, 120Hz, 144Hz, 240Hz)
 * on both mobile (iOS/Android ProMotion) and desktop.
 */
export function smoothScrollTo(elementOrIdOrPosition: string | HTMLElement | number, duration = 650) {
  if (typeof window === "undefined") return;

  let targetPosition = 0;
  const startPosition = window.pageYOffset || document.documentElement.scrollTop;

  if (typeof elementOrIdOrPosition === "number") {
    targetPosition = elementOrIdOrPosition;
  } else {
    const target =
      typeof elementOrIdOrPosition === "string"
        ? document.getElementById(elementOrIdOrPosition)
        : elementOrIdOrPosition;

    if (!target) return;
    targetPosition = target.getBoundingClientRect().top + startPosition - 16;
  }

  const distance = targetPosition - startPosition;
  if (Math.abs(distance) < 5) return;

  let startTime: number | null = null;

  // Butter-smooth cubic-bezier deceleration curve (120Hz VSync friendly)
  const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);

  function step(currentTime: number) {
    if (startTime === null) startTime = currentTime;
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutQuart(progress);

    window.scrollTo({
      top: startPosition + distance * easedProgress,
      behavior: "instant" as ScrollBehavior, // Avoid interference with native browser smooth scroll
    });

    if (elapsed < duration) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}
