<template>
  <div v-if="currentEvent">
    <h2>{{ currentEvent.name }}</h2>
    <ul>
      <Market
        v-for="market of liveMarkets.filter(
          (market) => market.eventId === currentEvent.eventId
        )"
        :market="market"
        :key="market.marketId"
        @click="loadOutcomes(market.outcomes)"
      />
    </ul>
  </div>
</template>

<script>
import Market from "../components/Market.vue";
import { mapActions, mapState } from "vuex";
export default {
  components: {
    Market,
  },
  created() {
    this.loadCurrentEvent(this.$route.params.id);
    // ideally we shoulda wait for it to be loaded
  },
  methods: {
    ...mapActions(["loadCurrentEvent", "loadMarket", "loadOutcomes"]),
  },
  computed: {
    ...mapState(["currentEvent", "liveMarkets"]),
  },
  watch: {
    currentEvent() {
      this.currentEvent &&
        this.currentEvent.markets.forEach((marketId) =>
          this.loadMarket({ marketId })
        );
    },
  },
};
</script>

<style></style>
