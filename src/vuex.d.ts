// vuex.d.ts
import { Store } from "@/vuex";

declare module "@vue/runtime-core" {
  // declare your own store states
  interface State {
    socket: number;
  }
}
