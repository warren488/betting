import { createStore } from "vuex";

export default createStore({
  state: {
    liveEvents: [],
    liveMarkets: [],
    loadedEvents: false,
  },
  getters: {},
  mutations: {},
  actions: {
    async getLiveEvents(context) {
      if (!context.state.loadedEvents) {
        return fetch("http://localhost:8888/football/live?primaryMarkets=true")
          .then(async (res) => {
            const { events } = await res.json();
            context.state.liveEvents = events;
            context.state.loadedEvents = true;
          })
          .catch(console.log);
      }
    },
    async loadMarket(context, marketId) {
      const existingMarket = context.state.liveMarkets.find(
        ({ marketId: id }) => marketId === id
      );
      if (!existingMarket) {
        return fetch("http://localhost:8888/sportsbook/market/" + marketId)
          .then(async (res) => {
            const { market } = await res.json();
            // @ts-ignore
            context.state.liveMarkets = [...context.state.liveMarkets, market];
          })
          .catch(console.log);
      }
    },
  },
  modules: {},
});
