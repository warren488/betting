<template>
  <div class="home">
    <h1>Live Events</h1>
    <ul>
      <li
        v-for="liveEvent in liveEvents"
        :key="liveEvent.eventId"
        class="live-event"
      >
        <h2
          class="live-event__heading"
          v-on:click="$router.push('/event/' + liveEvent.eventId)"
        >
          {{ liveEvent.name }}
        </h2>
        <p @click="() => setMarketsVisible(liveEvent)">
          {{
            visibleMarkets.includes(liveEvent.eventId)
              ? "Hide primary markets..."
              : "See primary markets..."
          }}
        </p>
        <div v-if="visibleMarkets.includes(liveEvent.eventId)">
          <ul class="live-event__primary-markets">
            <Market
              v-for="market of liveMarkets.filter(
                (market) =>
                  market.eventId === liveEvent.eventId &&
                  // make sure we only render the primary markets on the home screen
                  liveEvent.markets.includes(market.marketId)
              )"
              :market="market"
              :key="market.marketId"
              :showOutcomes="true"
            />
          </ul>
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState } from "vuex";
import Odds from "@/components/Odds.vue";
import Market from "../components/Market.vue";

export default defineComponent({
  name: "HomeView",
  data() {
    return {
      visibleMarkets: [""],
    };
  },
  methods: {
    ...mapActions(["loadMarket"]),
    setMarketsVisible(event: { eventId: string; markets: string[] }) {
      const { eventId, markets } = event;
      console.log(event);
      if (this.visibleMarkets.includes(eventId)) {
        this.visibleMarkets = this.visibleMarkets.filter(
          (arrId: string) => arrId !== eventId
        );
      } else {
        markets.forEach((marketId) => this.loadMarket({ marketId }));
        this.visibleMarkets.push(eventId);
      }
    },
  },
  computed: {
    ...mapState(["liveEvents", "liveMarkets", "outcomes"]),
  },
  components: { Odds, Market },
});
</script>

<style lang="scss" scoped>
.live-event {
  margin-bottom: 1rem;
  border-bottom: solid thin;
}

.live-event__heading {
  margin: 0px;
  cursor: pointer;
}

.live-event__primary-markets {
  display: flex;
  justify-content: center;
}
</style>
