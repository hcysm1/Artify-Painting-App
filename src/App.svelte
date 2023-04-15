<script>
  import Canvas from "./Canvas.svelte";
  import { Color, ColorInput } from "color-picker-svelte"; //import color-picker-svelte library
  import Tools from "./Tools.svelte";

  let color = new Color("#ff3d91"); //creating a color object
  let brushsize = 1; //size of brush

  let handleClear; //to clear canvas
  let handleSave; //to save the canvas as image
  let handleShare;
  let handleZoomIn; //to zoom in
  let handleZoomOut; //to zoom out
  let handleUndo; //to undo
  let handleRedo; //to redo
  let handleErase; //to erase

  //Close toolbox
  const handleClose = () => {
    if ((document.getElementById("tool-box").style.display = "flex")) {
      document.getElementById("tool-box").style.display = "none";
      document.getElementById("close-toolbox").style.display = "none";
      document.getElementById("open-toolbox").style.display = "block";
    }
  };

  //open toolbox
  const handleOpen = () => {
    document.getElementById("tool-box").style.display = "flex";
    document.getElementById("close-toolbox").style.display = "block";
    document.getElementById("open-toolbox").style.display = "none";
  };
</script>

<body>
  <div class="container">
    <!-- Painting Section -->
    <section class="canvas">
      <!-- Canvas -->
      <Canvas
        {color}
        {brushsize}
        bind:handleClear
        bind:handleSave
        bind:handleShare
        bind:handleZoomIn
        bind:handleZoomOut
        bind:handleRedo
        bind:handleUndo
        bind:handleErase
      />
    </section>

    <!-- Toolbox Section -->
    <section class="close">
      <button id="close-toolbox" on:click={handleClose}>
        <span class="material-symbols-rounded">arrow_forward</span>
      </button>
    </section>
    <section class="open">
      <button id="open-toolbox" on:click={handleOpen}>
        <span class="material-symbols-rounded">arrow_back</span>
      </button>
    </section>
    <section id="tool-box" class="toolbox">
      <h2>Artify</h2>
      <div class="canvas-tools">
        <button class="canvas-tools-buttons" on:click={handleSave}>
          <span class="material-symbols-rounded"> download</span>
        </button>
        <button class="canvas-tools-buttons" on:click={handleShare}>
          <span class="material-symbols-rounded"> share </span>
        </button>
        <button class="canvas-tools-buttons" on:click={handleZoomIn}>
          <span class="material-symbols-rounded"> zoom_in</span>
        </button>
        <button class="canvas-tools-buttons" on:click={handleZoomOut}>
          <span class="material-symbols-rounded"> zoom_out </span>
        </button>
      </div>
      <div class="canvas-tools">
        <button class="canvas-tools-buttons" on:click={handleClear}>
          <span class="material-symbols-rounded"> refresh </span>
        </button>
        <button class="canvas-tools-buttons" on:click={handleErase}>
          <span class="material-symbols-rounded"> auto_fix_normal </span>
        </button>
        <button class="canvas-tools-buttons" on:click={handleUndo}>
          <span class="material-symbols-rounded"> undo </span>
        </button>
        <button class="canvas-tools-buttons" on:click={handleRedo}>
          <span class="material-symbols-rounded"> redo </span>
        </button>
      </div>

      <div class="painting-tools">
        <Tools />
      </div>
      <div class="styles-tools">
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
    </section>
  </div>
</body>

<!-- STYLING -->
<style>
  body {
    overflow: hidden;
    background-color: #fffbeb;
    font-size: 14px;
    line-height: 1;
  }

  #close-toolbox {
    background: #4b778d;
    right: -50px;
    top: 100%;
    align-items: center;
    color: #fff;
    cursor: pointer;
    height: 40px;
    width: 60px;
    font-size: 16px;
    display: none; /* hide the button by default */
  }

  #open-toolbox {
    background: #4b778d;
    right: -50px;
    top: 100%;
    align-items: center;
    color: #fff;
    cursor: pointer;
    height: 40px;
    width: 60px;
    font-size: 16px;
    display: none; /* hide the button by default */
  }
  section.close {
    height: 100vh;
    position: fixed;
    left: calc(100% - 310px);
  }
  section.open {
    height: 100vh;
    position: fixed;
    right: 0;
  }

  @media screen and (max-width: 767px) {
    #close-toolbox {
      display: block; /* show the button on small screens */
    }
  }

  section {
    height: 100vh;
    position: fixed;
    top: 0;
  }

  #tool-box {
    right: 0;
    width: 250px;
    overflow-y: scroll;
    background: linear-gradient(to bottom, #fff6bd, #ffd4b2);
    box-shadow: 0 3px 4px black;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    transition: 0.5s;
  }
  .canvas-tools {
    display: flex;
    flex-direction: row;
  }

  section.canvas {
    left: 0;
    width: 100%;
    height: 100%;
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
    color: #e74646;
  }

  .canvas-tools .canvas-tools-buttons:hover {
    color: #fff;
    background-color: #e74646;
  }

  .canvas-tools .canvas-tools-buttons {
    background: #4b778d;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    color: #fff;
    cursor: pointer;
    height: 40px;
    width: 60px;
    font-size: 16px;
  }

  .size-slider {
    width: 100%;
    height: 5px;
    margin-top: 10px;
    cursor: pointer;
  }
</style>
