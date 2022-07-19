<template>
  <li class="market">
    <span
      >{{ market.name }}
      <button @click="loadOutcomes(market.outcomes)">
        show outcomes
      </button></span
    >
    <ul v-if="outcomes && outcomes.length">
      <li
        style="display: flex"
        v-for="outcome of outcomes
          .filter(
            ({ marketId }) =>
              marketId === market.marketId && outcome.status.displayable
          )
          .sort((a, b) => a.displayOrder - b.displayOrder)"
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
import { mapActions, mapState } from "vuex";
import Odds from "./Odds.vue";
export default {
  name: "Markets-Component",
  props: ["market"],
  components: { Odds },
  methods: {
    ...mapActions(["loadOutcomes"]),
  },
  computed: {
    ...mapState(["outcomes"]),
  },
  mounted() {
    console.log(this.market);
  },
};
</script>

<style>
.market {
  padding: 0.5rem;
}
</style>
