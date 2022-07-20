<template>
  <div class="odds">
    <div class="price">
      {{ decimalView ? decimal : `${num}/${den}` }}
    </div>
    <button @click="decimalView = !decimalView">
      {{ decimalView ? "fraction" : "decimal" }}
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

.price {
  display: flex;
  align-items: center;
}

button {
  margin-left: 0.25rem;
}
</style>
