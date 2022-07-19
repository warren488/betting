<template>
  <div class="home">
    <h1>Live Events</h1>
    <ul>
      <li
        v-for="liveEvent in liveEvents"
        :key="liveEvent.eventId"
        style="padding-bottom: 1rem; border-bottom: solid thin"
      >
        <span v-on:click="$router.push('/event/' + liveEvent.eventId)">
          {{ liveEvent.name }}
        </span>
        <p @click="() => setMarketsVisible(liveEvent)">
          {{
            visibleMarkets.includes(liveEvent.eventId)
              ? "Hide..."
              : "see more..."
          }}
        </p>
        <div v-if="visibleMarkets.includes(liveEvent.eventId)">
          <ul>
            <Market
              v-for="market of liveMarkets.filter(
                (market) => market.eventId === liveEvent.eventId
              )"
              :market="market"
              :key="market.marketId"
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
        markets.forEach(this.loadMarket);
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
ul {
  padding: 0px;
}
li {
  list-style: none;
}
p {
  margin: 0px;
}
</style>
