export const startFpsTracker = (id: string): void => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Element not found: ${id}`);

  const moveTo = (xCoord: number) => {
    element.style.transform = `translateX(${xCoord}px)`;
  };

  let xCoord = 0;
  const delta = 7;

  const slideRight = () => {
    moveTo(xCoord);
    xCoord += delta;

    if (xCoord > 100) {
      requestAnimationFrame(slideLeft);
    } else {
      requestAnimationFrame(slideRight);
    }
  };

  const slideLeft = () => {
    moveTo(xCoord);
    xCoord -= delta;

    if (xCoord < -100) {
      requestAnimationFrame(slideRight);
    } else {
      requestAnimationFrame(slideLeft);
    }
  };

  requestAnimationFrame(slideRight);
};
