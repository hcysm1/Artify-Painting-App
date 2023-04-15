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

//dashed stroke
export const dashedLline = (e, ctx) => {
  ctx.setLineDash([10, 10]);
  ctx.lineTo(e.offsetX, e.offsetY); // creating line according to the mouse pointer
  ctx.stroke();
};

//gradient line
export const gradientLine = (e, ctx, hex) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 500);
  gradient.addColorStop(0.5, "blue");
  gradient.addColorStop(1, "green");
  gradient.addColorStop(0, hex);
  ctx.strokeStyle = gradient;
  ctx.lineTo(e.offsetX, e.offsetY); // creating line according to the mouse pointer
  ctx.stroke();
};
