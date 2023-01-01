import { createApp } from "vue";
import VueGtag from "vue-gtag";
import App from "./App.vue";

import "purecss/build/pure.css";
import "purecss/build/grids-responsive.css";

const app = createApp(App);
app.use(VueGtag, { config: { id: "G-MEMN364SMZ" } });
app.mount("#app");
