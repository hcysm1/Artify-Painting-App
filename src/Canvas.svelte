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
  import {
    selectedShape,
    selectedStroke,
    shape,
    stroke,
    isErasing,
  } from "./stores";
  export let brushsize; //brush size
  export let color; //brush color

  $: hex = color.toHex8String(); //changing the color value to hex format

  let canvas;
  let context;
  let isDrawing = false;
  let prevMouseX, prevMouseY, snapshot;
  let undoStack = [];
  let redoStack = [];
  let scale = 1;

  //set canvas background
  const setCanvasBackground = () => {
    // setting canvas to the original background color
    context.fillStyle = "#fffbeb";
    context.fillRect(0, 0, canvas.width, canvas.height);
  };

  window.addEventListener("load", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    setCanvasBackground();
  });

  onMount(() => {
    context = canvas.getContext("2d");
  });

  //erase function
  export const handleErase = () => {
    $selectedStroke = "pen";
    $isErasing = true;
  };

  //when the color or size changes this statement will run
  $: if (context) {
    context.strokeStyle = $isErasing ? "#fffbeb" : hex;
    context.lineWidth = brushsize; //changing size
    context.lineCap = "round"; //change brush shape
    context.lineJoin = "round"; //change brush shape
  }

  //on pointer down event
  const handleStart = (e) => {
    e.preventDefault();
    isDrawing = true;
    prevMouseX = e.offsetX / scale; // passing current mouseX position as prevMouseX value
    prevMouseY = e.offsetY / scale; // passing current mouseY position as prevMouseY value
    context.beginPath();
    snapshot = context.getImageData(0, 0, canvas.width, canvas.height);
    undoStack.push(context.getImageData(0, 0, canvas.width, canvas.height));
  };

  //on pointer up
  const handleEnd = () => {
    isDrawing = false;
  };

  //on pointer move
  const handleMove = (e) => {
    e.preventDefault();
    if (!isDrawing) return;

    // adding copied canvas data on to this canvas
    context.putImageData(snapshot, 0, 0);

    //check if eraser is selected
    if ($isErasing) {
      pen(e, context);
    } else {
      //if condition to select a shape or stroke
      if ($selectedShape === "rectangle" && !$stroke) {
        drawRect(e, context, prevMouseX, prevMouseY);
      } else if ($selectedShape === "triangle" && !$stroke) {
        drawTriangle(e, context, prevMouseX, prevMouseY);
      } else if ($selectedShape === "circle" && !$stroke) {
        drawCircle(e, context, prevMouseX, prevMouseY);
      } else if ($selectedShape === "hexagon" && !$stroke) {
        drawHexagon(e, context, prevMouseX, prevMouseY);
      } else if ($selectedShape === "ellipse" && !$stroke) {
        drawEllipse(e, context, prevMouseX, prevMouseY);
      } else if ($selectedStroke === "line" && !$shape) {
        drawLine(e, context, prevMouseX, prevMouseY);
      } else if ($selectedStroke === "pen" && !$shape) {
        pen(e, context);
      } else if ($selectedStroke === "gradientLine" && !$shape) {
        gradientLine(e, context, hex);
        context.strokeStyle = hex;
      } else if ($selectedStroke === "dashedLine" && !$shape) {
        dashedLline(e, context);
        context.setLineDash([]);
      } else {
        console.log("not a valid stroke or shape selected");
      }
    }
  };

  //clear canvas
  export const handleClear = () => {
    setCanvasBackground();
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
</script>

<!-- CANVAS -->

<canvas
  bind:this={canvas}
  on:pointerdown={handleStart}
  on:pointerup={handleEnd}
  on:pointermove={handleMove}
/>
