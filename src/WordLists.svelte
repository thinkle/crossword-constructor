<script type="ts">
  import Words from "./Words.svelte";
  import { getContext } from "svelte";
  let p = getContext("puzzleContext");
  console.log("Got context?", p);
  let { acrosses, downs } = p;
  export let playMode;
  $: console.log("Across", $acrosses, "Down", $downs);
</script>

<div>
  <h3>Acrosses</h3>
  <Words {playMode} words={$acrosses} />
</div>
<div>
  <h3>Downs</h3>
  <Words {playMode} words={$downs} />
</div>
