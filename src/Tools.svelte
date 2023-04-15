<script>
  import {
    selectedShape,
    selectedStroke,
    shape,
    stroke,
    isErasing,
  } from "./stores";
</script>

<h3>Shapes</h3>

<select
  class="dropdown"
  bind:value={$selectedShape}
  on:click={(e) => {
    $isErasing = false;
    $selectedShape = e.target.value;
    $stroke = false;
    $shape = true;
  }}
>
  <option value="rectangle">Rectangle</option>
  <option value="triangle">Triangle</option>
  <option value="circle">Circle</option>
  <option value="hexagon">Hexagon</option>
  <option value="ellipse">Ellipse</option>
</select>
<h3>Strokes</h3>
<select
  class="dropdown"
  bind:value={$selectedStroke}
  on:click={(e) => {
    $isErasing = false;
    $selectedStroke = e.target.value;
    $stroke = true;
    $shape = false;
  }}
>
  <option value="pen">Pen</option>
  <option value="dashedLine">Dashed Line</option>
  <option value="line"> Straight Line</option>
  <option value="gradientLine"> Gradient Line</option>
</select>

<style>
  .dropdown {
    width: 100%;
    margin-top: 10px;
    cursor: pointer;
    color: white;
    font-weight: bold;
    background-color: #4b778d;
    border: 1px solid #4b778d;
    border-radius: 4px;
  }

  .dropdown option {
    color: white;
    background-color: #4b778d;
  }

  select:hover {
    background-color: #e74646;
  }

  option:hover {
    background-color: #e74646;
  }

  h3 {
    font-size: 20px;
    text-transform: uppercase;
    text-align: center;
    font-family: Verdana, Geneva, Tahoma, sans-serif;
    color: #e74646;
  }
</style>
