import { createApp } from "vue";
import App from "./App.vue";
import router from "./routes/routes";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import store from "./store/auth";
import io from "socket.io-client";

const socket = io("http://localhost:3000");
socket.emit("testEvent", "Hello, server!");

socket.on("connect", () => {
  console.log("Connected to Socket.IO server");
});

const app = createApp(App);
app.config.globalProperties.$socket = socket;
app.use(router);
app.use(Toast);
app.use(store);

// Provide the Socket.io instance to the entire app
// app.provide("socket", socket);

app.mount("#app");
