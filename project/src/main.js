import { createApp } from "vue";
import App from "./App.vue";
import router from "./routes/routes";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import store from "./store/auth";
import io from "socket.io-client";

const socket = io("http://localhost:3000"); // Replace with your Socket.io server URL

const app = createApp(App);

app.use(router);
app.use(Toast);
app.use(store);

// Provide the Socket.io instance to the entire app
app.provide("socket", socket);

app.mount("#app");
