import { createWebHistory, createRouter } from "vue-router";

import Home from "../components/Home.vue";
import Login from "../components/Login.vue";
import Signup from "../components/Signup.vue";
import Dashboard from "../components/Dashboard.vue";
import MyPoll from "../components/MyPoll.vue";
const routes = [
  {
    name: "HomeComponent",
    path: "/",
    component: Home,
  },
  {
    name: "LoginPage",
    path: "/login",
    component: Login,
  },
  {
    name: "SignupPage",
    path: "/register",
    component: Signup,
  },
  {
    name: "DashboardPage",
    path: "/dashboard",
    component: Dashboard,
  },
  {
    name: "MyPoll",
    path: "/mypoll",
    component: MyPoll,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
export default router;
