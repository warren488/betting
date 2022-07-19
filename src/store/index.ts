import { getObjectBy } from "@/util";
import { createStore } from "vuex";

export default createStore({
  state: {
    liveEvents: [],
    liveMarkets: [],
    outcomes: [],
    currentEvent: null,
    socket: new WebSocket("ws://localhost:8889"),
    loadedEvents: false,
  },
  getters: {},
  mutations: {},
  actions: {
    async loadCurrentEvent(context, eventId) {
      return fetch("http://localhost:8888/sportsbook/event/" + eventId).then(
        async (res) => {
          const { event } = await res.json();
          context.state.currentEvent = event;
          return;
        }
      );
    },
    async getLiveEvents(context) {
      if (!context.state.loadedEvents) {
        return fetch("http://localhost:8888/football/live?primaryMarkets=true")
          .then(async (res) => {
            const { events } = await res.json();
            context.state.liveEvents = events;
            context.state.loadedEvents = true;
            context.dispatch("listenToOutcomeUpdates");
            context.dispatch("listenToMarketUpdates");
          })
          .catch(console.log);
      }
    },
    listenToMarketUpdates(context) {
      context.state.socket.addEventListener("message", (m) => {
        const message = JSON.parse(m.data);
        console.log(message);
        if (message.type === "MARKET_STATUS") {
          console.log("new market");
          const { index, object: oldMarket } = getObjectBy(
            { marketId: message.data.marketId },
            context.state.liveMarkets
          );
          context.state.liveMarkets.splice(index, 1, {
            ...oldMarket,
            // @ts-ignore
            status: message.data.status,
          });
        }
      });
    },
    listenToOutcomeUpdates(context) {
      context.state.socket.addEventListener("message", (m) => {
        const message = JSON.parse(m.data);
        console.log(message);
        if (["OUTCOME_STATUS", "PRICE_CHANGE"].includes(message.type)) {
          const { index, object: oldOutcome } = getObjectBy(
            { outcomeId: message.data.outcomeId },
            context.state.outcomes
          );
          console.log(index, oldOutcome);
          if (oldOutcome) {
            context.state.outcomes.splice(index, 1, {
              ...oldOutcome,
              // @ts-ignore
              status: message.data.status,
              // @ts-ignore
              price: message.data.price,
            });
          }
        }
      });
    },
    async loadMarket(context, { marketId, loadOutcomes }) {
      console.log("loadMarket");

      const existingMarket = context.state.liveMarkets.find(
        ({ marketId: id }) => marketId === id
      );
      if (!existingMarket) {
        return fetch("http://localhost:8888/sportsbook/market/" + marketId)
          .then(async (res) => {
            const { market } = await res.json();
            // @ts-ignore
            context.state.liveMarkets = [...context.state.liveMarkets, market];
            // as soon as we get the new market and add it to state we listen for any changes
            context.state.socket.send(
              JSON.stringify({
                type: "subscribe",
                keys: ["m." + marketId],
                clearSubscription: false,
              })
            );
            if (loadOutcomes) {
              context.dispatch("loadOutcomes", market.outcomes);
            }
          })
          .catch(console.log);
      }
    },
    async loadOutcomes(context, outcomes: string[]) {
      // at this point we should already be listening to the market so live updates will come in
      outcomes.forEach((outcomeId: string) => {
        context.dispatch("loadOutcome", outcomeId);
      });
    },
    async loadOutcome(context, outcomeId) {
      console.log("loadoutcome");

      const existingoutcome = context.state.outcomes.find(
        ({ outcomeId: id }) => outcomeId === id
      );
      if (!existingoutcome) {
        return fetch("http://localhost:8888/sportsbook/outcome/" + outcomeId)
          .then(async (res) => {
            const { outcome } = await res.json();
            // @ts-ignore
            context.state.outcomes = [...context.state.outcomes, outcome];
          })
          .catch(console.log);
      }
    },
  },
  modules: {},
});
