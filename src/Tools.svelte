<script>
  import { selectedShape, selectedStroke, shape, stroke } from "./stores";
</script>

<h2>Shapes</h2>

<select
  class="dropdown"
  bind:value={$selectedShape}
  on:click={(e) => (
    ($selectedShape = e.target.value), ($shape = true), ($stroke = false)
  )}
>
  <option value="rectangle">Rectangle</option>
  <option value="triangle">Triangle</option>
  <option value="circle">Circle</option>
  <option value="hexagon">Hexagon</option>
  <option value="ellipse">Ellipse</option>
</select>
<h2>Strokes</h2>
<select
  class="dropdown"
  bind:value={$selectedStroke}
  on:click={(e) => (
    ($selectedStroke = e.target.value), ($shape = false), ($stroke = true)
  )}
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
  }
</style>
