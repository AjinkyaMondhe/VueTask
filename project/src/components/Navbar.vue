<template>
  <div class="navbar">
    <!-- Fancy name on the left side -->
    <div class="navbar-brand">
      <i class="fas fa-square-poll-vertical fa-spin" style="font-size: 24px; margin-right: 10px"></i>
      Live Voting
    </div>
    <!-- Right-side buttons -->
    <div class="navbar-buttons">
      <button class="dashboard-button">Dashboard</button>
      <button class="poll-button" @click="openModal">Create Poll</button>
      <button class="logout-button" @click="triggerToast">Logout</button>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";

export default {
  name: "NavBar",
  setup() {
    const toast = useToast();
    const router = useRouter();
    return { router, toast };
  },
  methods: {
    openModal() {
      this.isModalOpen = true;
    },
    triggerToast() {
      this.toast.error("Logout successful.");
      this.router.push("/login");
    },
  },
};
</script>
  
<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #333;
  color: white;
  padding: 10px 20px;
}

.navbar-brand {
  font-size: 24px;
  font-weight: bold;
  font-family: cursive;
}

.navbar-buttons {
  display: flex;
  gap: 20px;
}

.poll-button {
  background-color: #28a745;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.poll-button:hover {
  background-color: #1e995b;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.dashboard-button {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.dashboard-button:hover {
  background-color: #0056b3;

  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.logout-button {
  background-color: #dc3545;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.logout-button:hover {
  background-color: #c82333;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
</style>