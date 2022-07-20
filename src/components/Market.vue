<template>
  <li class="market">
    <h3 class="market__heading">
      {{ market.name }}
      <button @click="toggleOutcomes">
        {{ this.hideOutcomes ? "show outcomes" : "hide outcomes" }}
      </button>
    </h3>
    <ul v-if="outcomes && outcomes.length > 0 && !this.hideOutcomes">
      <li
        v-for="outcome of marketOutcomes"
        :key="outcome.outcomeId"
        class="outcome"
      >
        <span class="outcome__active" v-if="!outcome.status.suspended">
          {{ outcome.name }}
          <Odds
            :den="outcome.price.den"
            :num="outcome.price.num"
            :decimal="outcome.price.decimal"
          />
        </span>
        <span v-if="outcome.status.suspended"> suspended </span>
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
      // if hide outcomes is true this means we are about to toggle it and show them and should load them as well
      if (this.hideOutcomes) this.loadOutcomes(this.market.outcomes);
      this.hideOutcomes = !this.hideOutcomes;
    },
  },
  computed: {
    ...mapState(["outcomes"]),
    marketOutcomes() {
      return this.outcomes
        .filter(
          ({ marketId, status: { displayable } }) =>
            marketId === this.market.marketId && displayable
        )
        .sort((a, b) => a.displayOrder - b.displayOrder);
    },
  },
  mounted() {
    if (this.showOutcomes) {
      this.loadOutcomes(this.market.outcomes);
    }
    // internally manage showing and hiding of outcomes
    this.hideOutcomes = !this.showOutcomes;
  },
};
</script>

<style>
.market {
  margin-bottom: 2rem;
}

.market__heading {
  margin: 0.25rem;
}
.outcome__active {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-left: 0.25rem;
}
.outcome {
  margin-bottom: 0.25rem;
  border: solid thin;
  border-radius: 0.25rem;
}
</style>
