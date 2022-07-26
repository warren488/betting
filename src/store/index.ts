import { getObjectBy } from "@/util";
import { createStore } from "vuex";

export default createStore({
  state: (): {
    liveEvents: any[];
    liveMarkets: any[];
    outcomes: any[];
    currentEvent: Record<string, unknown> | null;
    socket: WebSocket;
    loadedEvents: boolean;
  } => ({
    liveEvents: [],
    liveMarkets: [],
    outcomes: [],
    currentEvent: null,
    socket: new WebSocket("ws://localhost:8889"),
    loadedEvents: false,
  }),
  getters: {},
  mutations: {
    clearCurrentEvent(state) {
      state.currentEvent = null;
    },
  },
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
            context.dispatch("listenNewOutcomes");
          })
          .catch(console.log);
      }
    },
    listenNewOutcomes(context) {
      context.state.socket.addEventListener("message", (m) => {
        const message = JSON.parse(m.data);
        if (message.type === "OUTCOME_DATA") {
          // figure out which market we want to update
          const { object: exitingOutcome } = getObjectBy(
            { outcomeId: message.data.outcomeId },
            context.state.outcomes
          );
          if (!exitingOutcome) {
            context.state.outcomes = [...context.state.outcomes, message.data];
          }
        }
      });
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
              status: message.data.status,
              price: message.data.price,
            });
          }
        }
      });
    },
    // this function is specifically useful because we want to do stuff with the first ten markets on the
    // market page but if we load them one by one it messes with the ordering after we apply our sort
    async loadMarkets(context, marketIds: string[]) {
      const markets = await Promise.all(
        marketIds.map((marketId) =>
          // because we want to wait on the response the socket is not a good use here
          fetch("http://localhost:8888/sportsbook/market/" + marketId).then(
            async (res) => res.json()
          )
        )
      );
      markets.forEach(({ market }) => {
        const { marketId } = market;
        const { index, object: oldMarket } = getObjectBy(
          { marketId },
          context.state.liveMarkets
        );
        // replace the old data with the updated status only if the market exists
        if (oldMarket) {
          context.state.liveMarkets.splice(index, 1, market);
        } else {
          context.state.liveMarkets.push(market);
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
      // helps prevent unnecessary requests
      const existingOutcome = context.state.outcomes.find(
        ({ outcomeId: id }) => outcomeId === id
      );
      if (!existingOutcome) {
        context.state.socket.send(
          JSON.stringify({ type: "getOutcome", id: outcomeId })
        );
      }
    },
  },
  modules: {},
});
