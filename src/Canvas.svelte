<script>
  import { onMount } from "svelte"; //onMount lifecycle
  import {
    drawCircle,
    drawRect,
    drawTriangle,
    drawHexagon,
    drawEllipse,
  } from "./shapes";
  import { pen, dashedLline, drawLine, gradientLine } from "./styles";
  import { selectedShape, selectedStroke, shape, stroke } from "./stores";
  export let brushsize; //brush size
  export let color; //brush color
  export let isErasing;
  console.log("start", isErasing);

  $: hex = color.toHex8String(); //changing the color value to hex format

  let canvas;
  let context;
  let isDrawing = false;
  let prevMouseX, prevMouseY, snapshot;
  let undoStack = [];
  let redoStack = [];
  let scale = 1;

  const setCanvasBackground = () => {
    // setting canvas to the original background color
    context.fillStyle = "#fffbeb";
    context.fillRect(0, 0, canvas.width, canvas.height);
  };
  window.addEventListener("load", () => {
    // setting canvas width/height... offsetwidth/height returns viewable width/height of an element
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    setCanvasBackground();
  });

  onMount(() => {
    context = canvas.getContext("2d");
  });

  //when the color or size changes this statement will run
  $: if (context) {
    context.strokeStyle = hex; //changing color
    context.lineWidth = brushsize; //changing size
    context.lineCap = "round"; //change brush shape
    context.lineJoin = "round"; //change brush shape
  }

  const handleStart = (e) => {
    e.preventDefault();
    isDrawing = true;
    prevMouseX = e.offsetX / scale; // passing current mouseX position as prevMouseX value
    prevMouseY = e.offsetY / scale; // passing current mouseY position as prevMouseY value
    context.beginPath();
    snapshot = context.getImageData(0, 0, canvas.width, canvas.height);
    undoStack.push(context.getImageData(0, 0, canvas.width, canvas.height));
  };

  const handleEnd = () => {
    isDrawing = false;
  };

  const handleMove = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    context.putImageData(snapshot, 0, 0); // adding copied canvas data on to this canvas
    //if condition to select a shape or stroke
    if (isErasing) {
      console.log("if", isErasing);
      context.strokeStyle = "#fffbeb";
      context.lineTo(e.offsetX, e.offsetY);
      context.stroke();
    } else {
      if ($selectedShape === "rectangle" && $stroke === false) {
        drawRect(e, context, prevMouseX, prevMouseY);
      } else if ($selectedShape === "triangle" && $stroke === false) {
        drawTriangle(e, context, prevMouseX, prevMouseY);
      } else if ($selectedShape === "circle" && $stroke === false) {
        drawCircle(e, context, prevMouseX, prevMouseY);
      } else if ($selectedShape === "hexagon" && $stroke === false) {
        drawHexagon(e, context, prevMouseX, prevMouseY);
      } else if ($selectedShape === "ellipse" && $stroke === false) {
        drawEllipse(e, context, prevMouseX, prevMouseY);
      } else if ($selectedStroke === "line" && $shape === false) {
        drawLine(e, context, prevMouseX, prevMouseY);
      } else if ($selectedStroke === "pen" && $shape === false) {
        pen(e, context);
      } else if ($selectedStroke === "gradientLine" && $shape === false) {
        gradientLine(e, context, hex);
        context.strokeStyle = hex;
      } else if ($selectedStroke === "dashedLine" && $shape === false) {
        dashedLline(e, context);
        context.setLineDash([]);
      } else {
        console.log("not a valid stroke or shape selected");
      }
    }
  };

  //clear canvas
  export const handleClear = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    undoStack = [];
    redoStack = [];
  };

  //Save the canvas
  export const handleSave = () => {
    const link = document.createElement("a"); // creating <a> element
    link.href = canvas.toDataURL("image/jpeg"); // passing canvasData as link href value
    link.download = "canvas.jpg";
    link.click(); // clicking link to download image
  };

  export const handleShare = () => {};

  //zoom in function
  export const handleZoomIn = () => {
    scale += 0.1;
    canvas.style.transform = `scale(${scale})`;
  };

  //zoom out function
  export const handleZoomOut = () => {
    if (scale > 0.1) {
      scale -= 0.1;
      canvas.style.transform = `scale(${scale})`;
    }
  };

  //Undo function
  export const handleUndo = () => {
    if (undoStack.length > 0) {
      redoStack.push(context.getImageData(0, 0, canvas.width, canvas.height));
      context.putImageData(undoStack.pop(), 0, 0);
    }
  };

  //Redo function
  export const handleRedo = () => {
    if (redoStack.length > 0) {
      undoStack.push(context.getImageData(0, 0, canvas.width, canvas.height));
      context.putImageData(redoStack.pop(), 0, 0);
    }
  };

  //to set the erase value to true
  export const handleErase = () => {
    isErasing = true;
  };
</script>

<!-- CANVAS -->

<canvas
  bind:this={canvas}
  on:pointerdown={handleStart}
  on:pointerup={handleEnd}
  on:pointermove={handleMove}
/>

<!-- STYLING -->
<style>
  canvas {
    background-color: #fffbeb;
    width: 100%;
    height: 100%;
  }
</style>
