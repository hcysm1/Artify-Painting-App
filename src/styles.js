//PEN
export const pen = (e, ctx) => {
  ctx.setLineDash([]);
  ctx.lineTo(e.offsetX, e.offsetY); // creating line according to the mouse pointer
  ctx.stroke();
};

//Draw Line
export const drawLine = (e, ctx, prevMouseX, prevMouseY) => {
  ctx.setLineDash([]);
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

//dashed stroke
export const gradientLine = (e, ctx) => {
  ctx.setLineDash([]);
  const gradient = ctx.createLinearGradient(0, 0, 500, 0);
  gradient.addColorStop(0, "red");
  gradient.addColorStop(0.5, "green");
  gradient.addColorStop(1, "blue");
  ctx.strokeStyle = gradient;
  ctx.lineTo(e.offsetX, e.offsetY); // creating line according to the mouse pointer
  ctx.stroke();
};
