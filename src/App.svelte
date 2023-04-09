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
      <div class="canvas-tools">
        <h2>Canvas</h2>
        <button class="clear-canvas" on:click={handleClear}>Clear</button>
        <button class="save-img" on:click={handleSave}>Save</button>
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
    background-color: #ffffff;
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

    background-color: #ffffff;
    border-left: 1px solid #545454;

    display: flex;
    flex-direction: column;
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
    border-bottom: 1px solid #545454;
  }
  h2 {
    margin-bottom: 24px;
    font-size: 20px;
    text-transform: uppercase;
    text-align: center;
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
    background: #6c757d;
  }
  .canvas-tools .clear-canvas {
    color: #6c757d;
    border: 1px solid #6c757d;
    transition: all 0.3s ease;
  }
  .canvas-tools .save-img {
    background: #437e78;
    border: 1px solid #437e78;
  }
  .size-slider {
    width: 100%;
    height: 5px;
    margin-top: 10px;
    cursor: pointer;
  }
</style>
