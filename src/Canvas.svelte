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

  $: hex = color.toHex8String(); //changing the color value to hex format

  let canvas;
  let context;
  let isDrawing = false;
  let prevMouseX, prevMouseY, snapshot;

  const setCanvasBackground = () => {
    // setting canvas to the original background color
    context.fillStyle = "beige";
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
    isDrawing = true;

    prevMouseX = e.offsetX; // passing current mouseX position as prevMouseX value
    prevMouseY = e.offsetY; // passing current mouseY position as prevMouseY value
    context.beginPath();
    snapshot = context.getImageData(0, 0, canvas.width, canvas.height);
  };

  const handleEnd = () => {
    isDrawing = false;
  };
  const handleMove = (e) => {
    if (!isDrawing) return;
    context.putImageData(snapshot, 0, 0); // adding copied canvas data on to this canvas
    //if condition to select a shape or stroke
    if ($selectedShape === "rectangle" && $stroke === "false") {
      drawRect(e, context, prevMouseX, prevMouseY);
    } else if ($selectedShape === "triangle" && $stroke === "false") {
      drawTriangle(e, context, prevMouseX, prevMouseY);
    } else if ($selectedShape === "circle" && $stroke === "false") {
      drawCircle(e, context, prevMouseX, prevMouseY);
    } else if ($selectedStroke === "line" && $shape === "false") {
      drawLine(e, context, prevMouseX, prevMouseY);
    } else if ($selectedStroke === "pen" && $shape === "false") {
      pen(e, context);
    } else if ($selectedStroke === "gradientLine" && $shape === "false") {
      gradientLine(e, context);
    } else if ($selectedStroke === "dashedLine" && $shape === "false") {
      dashedLline(e, context);
    } else if ($selectedShape === "hexagon" && $stroke === "false") {
      drawHexagon(e, context, prevMouseX, prevMouseY);
    } else if ($selectedShape === "ellipse" && $stroke === "false") {
      drawEllipse(e, context, prevMouseX, prevMouseY);
    } else {
      console.log("not a valid stroke or shape selected");
    }
  };

  //clear canvas function

  export const handleClear = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();
  };

  //Save the canvas

  export const handleSave = () => {
    const link = document.createElement("a"); // creating <a> element
    link.href = canvas.toDataURL("image/jpeg"); // passing canvasData as link href value
    link.download = "canvas.jpg";
    link.click(); // clicking link to download image
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
    background-color: beige;
    width: 100%;
    height: 100%;
  }
</style>
