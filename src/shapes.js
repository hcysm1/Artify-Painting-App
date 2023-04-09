//Draw Circle
export const drawCircle = (e, ctx, prevMouseX, prevMouseY) => {
  ctx.setLineDash([]);
  ctx.beginPath();
  let radius = Math.sqrt(
    Math.pow(prevMouseX - e.offsetX, 2) + Math.pow(prevMouseY - e.offsetY, 2)
  );
  ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI); // creating circle according to the mouse pointer
  ctx.stroke();
};

//Draw Triangle
export const drawTriangle = (e, ctx, prevMouseX, prevMouseY) => {
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(prevMouseX, prevMouseY); // moving triangle to the mouse pointer
  ctx.lineTo(e.offsetX, e.offsetY); // creating first line according to the mouse pointer
  ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY); // creating bottom line of triangle
  ctx.closePath(); // closing path of a triangle so the third line draw automatically
  ctx.stroke();
};

//Draw Rectangle or square
export const drawRect = (e, ctx, prevMouseX, prevMouseY) => {
  ctx.setLineDash([]);
  ctx.strokeRect(
    e.offsetX,
    e.offsetY,
    prevMouseX - e.offsetX,
    prevMouseY - e.offsetY
  );
};

//draw hexagon
export const drawHexagon = (e, ctx, prevMouseX, prevMouseY) => {
  ctx.setLineDash([]);
  // Calculate the radius of the polygon based on the distance between the starting and ending points
  const radius = Math.sqrt(
    (e.offsetX - prevMouseX) ** 2 + (e.offsetY - prevMouseY) ** 2
  );

  // Calculate the angle between each point of the polygon
  const angle = (2 * Math.PI) / 6;

  // Begin the path
  ctx.beginPath();

  // Move to the starting point
  ctx.moveTo(
    prevMouseX + radius * Math.cos(0),
    prevMouseY + radius * Math.sin(0)
  );

  // Draw each point of the polygon
  for (let i = 1; i <= 5; i++) {
    ctx.lineTo(
      prevMouseX + radius * Math.cos(i * angle),
      prevMouseY + radius * Math.sin(i * angle)
    );
  }

  // Close the path and stroke it
  ctx.closePath();
  ctx.stroke();
};

//draw Ellipse
export const drawEllipse = (e, ctx, prevMouseX, prevMouseY) => {
  ctx.setLineDash([]);
  // Calculate the center point of the ellipse
  const centerX = (prevMouseX + e.offsetX) / 2;
  const centerY = (prevMouseY + e.offsetY) / 2;

  // Calculate the radius in the X and Y directions
  const radiusX = Math.abs(e.offsetX - prevMouseX) / 2;
  const radiusY = Math.abs(e.offsetY - prevMouseY) / 2;

  // Begin the path
  ctx.beginPath();

  // Create an ellipse path using the arc method
  ctx.save(); // Save the current context state
  ctx.translate(centerX, centerY); // Translate to the center point
  ctx.scale(radiusX / radiusY, 1); // Scale the x-axis to create an ellipse
  ctx.arc(0, 0, radiusY, 0, 2 * Math.PI); // Draw the ellipse
  ctx.restore(); // Restore the context state

  // Stroke the path
  ctx.stroke();
};
