<template>
  <div class="home">
    <h1>Live Events</h1>
    <ul>
      <li v-for="event in liveEvents" :key="event.eventId">
        {{ event.name }}
        <p @click="() => setMarketsVisible(event.eventId)">see more...</p>
        <div v-if="visibleMarkets.includes(event.eventId)">
          {{ event.markets }}
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "vuex";

export default defineComponent({
  name: "HomeView",
  data() {
    return {
      visibleMarkets: [""],
    };
  },
  methods: {
    setMarketsVisible(id: string) {
      console.log(id);
      if (this.visibleMarkets.includes(id)) {
        this.visibleMarkets = this.visibleMarkets.filter(
          (arrId: string) => arrId !== id
        );
      } else {
        this.visibleMarkets.push(id);
      }
    },
  },
  computed: {
    ...mapState(["liveEvents"]),
  },
});
</script>

<style lang="scss" scoped>
p {
  margin: 0px;
}
</style>
