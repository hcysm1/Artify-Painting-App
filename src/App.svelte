<script>
  import Canvas from "./Canvas.svelte";
  import { Color, ColorInput } from "color-picker-svelte"; //import color-picker-svelte library
  import Tools from "./Tools.svelte";

  let color = new Color("#ff3d91"); //creating a color object
  let brushsize = 1; //size of brush
  let handleClear; //to clear canvas
  let handleSave; //to save the canvas as image
</script>

<body>
  <div class="container">
    <!-- Painting Section -->
    <section class="canvas">
      <!-- Canvas -->
      <Canvas {color} {brushsize} bind:handleClear bind:handleSave />
    </section>
    <!-- Toolbox Section -->
    <section class="toolbox">
      <h2>Artify</h2>
      <div class="canvas-tools">
        <button class="canvas-tools-buttons" on:click={handleSave}>
          <span class="material-symbols-rounded"> download</span>
        </button>
        <button class="canvas-tools-buttons">
          <span class="material-symbols-rounded"> share </span>
        </button>
        <button class="canvas-tools-buttons">
          <span class="material-symbols-rounded"> zoom_in</span>
        </button>
        <button class="canvas-tools-buttons">
          <span class="material-symbols-rounded"> zoom_out </span>
        </button>
      </div>
      <div class="canvas-tools">
        <button class="canvas-tools-buttons" on:click={handleClear}>
          <span class="material-symbols-rounded"> save </span>
        </button>
        <button class="canvas-tools-buttons">
          <span class="material-symbols-rounded"> share </span>
        </button>
        <button class="canvas-tools-buttons">
          <span class="material-symbols-rounded"> undo </span>
        </button>
        <button class="canvas-tools-buttons">
          <span class="material-symbols-rounded"> redo </span>
        </button>
      </div>

      <div class="painting-tools">
        <Tools />
      </div>

      <div class="styles-tools">
        <h2>Styles</h2>
        <!-- Color Picker -->
        <ColorInput bind:color showAlphaSlider />
        <!-- brush size -->
        <input
          class="size-slider"
          type="range"
          bind:value={brushsize}
          min="0"
          max="100"
        />
      </div>

      <div class="background-tools">
        <h2>Background</h2>
      </div>
    </section>
  </div>
</body>

<!-- STYLING -->
<style>
  body {
    margin: 0;
    overflow: hidden;
    background-color: #fffbeb;
    font-size: 14px;
    line-height: 1;
  }

  section {
    height: 100vh;
    position: fixed;
    top: 0;
  }
  section.toolbox {
    right: 0;
    width: 300px;
    overflow-y: scroll;
    background: linear-gradient(to bottom, #fff6bd, #ffd4b2);
    box-shadow: 0 3px 4px black;
    display: flex;
    flex-direction: column;
  }
  .canvas-tools {
    display: flex;
    flex-direction: row;
  }
  .eraser-tools {
    display: flex;
    flex-direction: row;
  }
  section.canvas {
    left: 0;
    width: calc(100vw - 180px);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  section.toolbox > div {
    padding: 20px 16px 8px 16px;
  }
  h2 {
    margin-bottom: 24px;
    font-size: 20px;
    text-transform: uppercase;
    text-align: center;
    font-family: Verdana, Geneva, Tahoma, sans-serif;
    color: #4b778d;
  }

  .canvas-tools button {
    width: 100%;
    color: #fff;
    border: none;
    outline: none;
    padding: 11px 0;
    font-size: 16px;
    margin-bottom: 13px;
    background: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .canvas-tools .clear-canvas:hover {
    color: #fff;
    background: #4b778d;
  }
  .canvas-tools .clear-canvas {
    background: #4b778d;
    border: 1px solid #4b778d;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 40px;
    width: 110px;
    margin-left: 3px;
  }
  .canvas-tools .canvas-tools-buttons {
    background: #4b778d;
    border: 1px solid #4b778d;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 40px;
    width: 50px;
    margin-left: 6px;
    margin-right: 6px;
  }

  .size-slider {
    width: 100%;
    height: 5px;
    margin-top: 10px;
    cursor: pointer;
  }
</style>
