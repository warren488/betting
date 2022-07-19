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
    /** loads an event into its own object for the event page, also makes it easier to subscribe to changes */
    async loadCurrentEvent(context, eventId) {
      return fetch("http://localhost:8888/sportsbook/event/" + eventId).then(
        async (res) => {
          const { event } = await res.json();
          context.state.currentEvent = event;
          return;
        }
      );
    },
    /** get all live events to display on the homoe page */
    async getLiveEvents(context) {
      if (!context.state.loadedEvents) {
        return fetch("http://localhost:8888/football/live?primaryMarkets=true")
          .then(async (res) => {
            const { events } = await res.json();
            context.state.liveEvents = events;
            context.state.loadedEvents = true;
            // once we get the events we want to add handlers for changes (not actually subscribing yet)
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
        // from what I've seen market status is the only event for markets
        if (message.type === "MARKET_STATUS") {
          // figure out which market we want to update
          const { index, object: oldMarket } = getObjectBy(
            { marketId: message.data.marketId },
            context.state.liveMarkets
          );
          // replace the old data with the updated status only if the market exists
          if (oldMarket) {
            context.state.liveMarkets.splice(index, 1, {
              ...oldMarket,
              // @ts-ignore
              status: message.data.status,
            });
          }
        }
      });
    },
    listenToOutcomeUpdates(context) {
      context.state.socket.addEventListener("message", (m) => {
        const message = JSON.parse(m.data);
        console.log(message);
        // these two events seem to be the only outcome events and they change the same properties
        if (["OUTCOME_STATUS", "PRICE_CHANGE"].includes(message.type)) {
          // figure out which outcome we want to update
          const { index, object: oldOutcome } = getObjectBy(
            { outcomeId: message.data.outcomeId },
            context.state.outcomes
          );
          console.log(index, oldOutcome);
          // replace the old data with the updated status only if the outcome exists
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
    async loadMarket(context, { marketId, loadOutcomes, subscribe }) {
      console.log("loadMarket");

      // this will stop us from constantly requesting data that already exists
      const existingMarket = context.state.liveMarkets.find(
        ({ marketId: id }) => marketId === id
      );
      if (!existingMarket) {
        return fetch("http://localhost:8888/sportsbook/market/" + marketId)
          .then(async (res) => {
            const { market } = await res.json();
            // @ts-ignore
            context.state.liveMarkets = [...context.state.liveMarkets, market];
            // as soon as we get the new market and add it to state we may want to listen for any changes
            // this subscribe argument helps achieve that
            if (subscribe) {
              context.state.socket.send(
                JSON.stringify({
                  type: "subscribe",
                  keys: ["m." + marketId],
                  clearSubscription: false,
                })
              );
            }
            // similar to above we may want to immediately load the outcomes
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

      // helps prevent unnecessary requests
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
