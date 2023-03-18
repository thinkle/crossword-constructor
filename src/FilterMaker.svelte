<script>
  import { filters } from "./filters";
  let textVal = "";

  let isValid = true;
  let error;
  function updateRegex(textval) {
    try {
      let reg = new RegExp(textval);
      $filters = [reg];
      isValid = true;
    } catch (err) {
      isValid = false;
      error = err;
    }
  }

  $: updateRegex(textVal);
</script>

<div>
  Enter filter RegExp: <input bind:value={textVal} />
  {#if !isValid}
    Invalid RegExp: {error}
  {/if}
  {$filters}
</div>
