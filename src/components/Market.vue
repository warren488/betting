<template>
  <li>
    <span>{{ market.name }}</span>
    <ul v-if="outcomes && outcomes.length">
      <li
        style="display: flex"
        v-for="outcome of outcomes.filter(
          ({ marketId }) => marketId === market.marketId
        )"
        :key="outcome.outcomeId"
      >
        {{ outcome.name }}:
        <Odds
          :den="outcome.price.den"
          :num="outcome.price.num"
          :decimal="outcome.price.decimal"
        />
      </li>
    </ul>
  </li>
</template>

<script>
import { mapState } from "vuex";
import Odds from "./Odds.vue";
export default {
  name: "Markets-Component",
  props: ["market"],
  components: { Odds },
  computed: {
    ...mapState(["outcomes"]),
  },
  mounted() {
    console.log(this.market);
  },
};
</script>

<style></style>
