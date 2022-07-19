<template>
  <div class="odds">
    <div>{{ decimalView ? decimal : `${num}/${den}` }}</div>
    <button @click="decimalView = !decimalView">
      {{ decimalView ? "fract" : "decimal" }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Odd-Component",
  props: ["den", "num", "decimal"],
  data() {
    return {
      decimalView: false,
    };
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.odds {
  display: flex;
}
</style>
