<template>
  <div v-if="currentEvent">
    <h2>{{ currentEvent.name }}</h2>
    <h3 style="margin: 0px">{{ currentEvent.linkedEventTypeName }}</h3>
    <ul>
      <Market
        v-for="(market, index) of eventMarkets"
        :market="market"
        :key="market.marketId"
        :showOutcomes="index < 10"
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
  unmounted() {
    this.clearCurrentEvent();
  },
  methods: {
    ...mapActions([
      "loadCurrentEvent",
      "clearCurrentEvent",
      "loadMarket",
      "loadOutcomes",
      "loadMarkets",
    ]),
  },
  computed: {
    ...mapState(["currentEvent", "liveMarkets"]),
    eventMarkets() {
      return (
        this.liveMarkets
          // we only want markets for this event that are displayable
          .filter(
            (market) =>
              market.eventId === this.currentEvent.eventId &&
              market.status.displayable
          )
          .sort((a, b) => a.displayOrder - b.displayOrder)
      );
    },
  },
  watch: {
    currentEvent() {
      this.currentEvent && this.loadMarkets(this.currentEvent.markets);
    },
  },
};
</script>

<style></style>
