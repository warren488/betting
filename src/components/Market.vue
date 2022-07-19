<template>
  <li class="market">
    <span
      >{{ market.name }}
      <button @click="toggleOutcomes">
        {{ this.hideOutcomes ? "show outcomes" : "hide outcomes" }}
      </button></span
    >
    <ul v-if="outcomes && outcomes.length > 0 && !this.hideOutcomes">
      <li
        style="display: flex"
        v-for="outcome of outcomes
          .filter(
            ({ marketId, status: { displayable } }) =>
              marketId === market.marketId && displayable
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
  props: ["market", "showOutcomes"],
  components: { Odds },
  data() {
    return { hideOutcomes: false };
  },
  methods: {
    ...mapActions(["loadOutcomes"]),
    toggleOutcomes() {
      this.hideOutcomes = !this.hideOutcomes;
      if (this.hideOutcomes) this.loadOutcomes(this.market.outcomes);
    },
  },
  computed: {
    ...mapState(["outcomes"]),
  },
  mounted() {
    if (this.showOutcomes) {
      this.loadOutcomes(this.market.outcomes);
      // internally manage showing and hiding of outcomes
    }
    this.hideOutcomes = !this.showOutcomes;
  },
};
</script>

<style>
.market {
  padding: 0.5rem;
}
</style>
