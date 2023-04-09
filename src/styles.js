//PEN
export const pen = (e, ctx) => {
  ctx.lineTo(e.offsetX, e.offsetY); // creating line according to the mouse pointer
  ctx.stroke();
};

//Draw Line
export const drawLine = (e, ctx, prevMouseX, prevMouseY) => {
  ctx.beginPath();
  ctx.moveTo(prevMouseX, prevMouseY); // moving polygon to the mouse pointer
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
};

// Draw spray effect that follows the movement of the mouse pointer
export const spray = (e, ctx, hex) => {
  const radius = 20; // radius of the spray
  const density = 80; // number of particles in the spray

  for (let i = 0; i < density; i++) {
    const offsetX = (Math.random() - 0.5) * radius * 2;
    const offsetY = (Math.random() - 0.5) * radius * 2;
    const distanceFromCenter = Math.sqrt(offsetX ** 2 + offsetY ** 2);

    if (distanceFromCenter < radius) {
      ctx.fillStyle = hex;
      const particleX = e.offsetX + offsetX;
      const particleY = e.offsetY + offsetY;
      ctx.fillRect(particleX, particleY, 1, 1);
    }
  }
};
