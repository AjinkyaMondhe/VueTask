<template>
    <div class="navbar">
        <!-- Fancy name on the left side -->
        <div class="navbar-brand">
            <i class="fas fa-square-poll-vertical fa-spin" style="font-size: 24px; margin-right: 10px"></i>
            Live Voting
        </div>
        <!-- Right-side buttons -->
        <div class="navbar-buttons">
            <button class="dashboard-button" @click="openDashboard">Dashboard</button>
            <button class="mypoll-button" @click="openMyPoll">My Poll </button>
            <button class="poll-button" @click="openModal">Create Poll</button>
            <button class="logout-button" @click="triggerToast">Logout</button>
        </div>
    </div>
    <!-- Create Poll Modal -->
    <CreatePollModal v-if="isModalOpen" @cancel="isModalOpen = false" />
</template>
  
<script>
import axios from "axios";
import { useToast } from "vue-toastification";
import { useRouter } from "vue-router";
import CreatePollModal from './CreatePollModal.vue'
export default {
    name: "NavBar",
    components: {
        CreatePollModal,
    },
    data() {
        return {
            isModalOpen: false,
        };
    },
    mounted() {
        axios
            .get("http://localhost:3000/api/polls")
            .then((response) => {
                // Assign the fetched poll data to the 'polls' array
                this.polls = response.data.map((poll) => {
                    return {
                        ...poll,
                        validTill: new Date(poll.validTill), // Convert validTill timestamp to Date object
                        createdAt: new Date(poll.createdAt), // Convert createdAt timestamp to Date object
                    };
                });
                // Start individual countdown timers for each poll
                this.startCountdown();
            })
            .catch((error) => {
                console.error("Error fetching poll data:", error);
            });
    },

    setup() {
        const toast = useToast();
        const router = useRouter();
        return { toast, router };
    },
    computed: {
    },
    methods: {
        startCountdown() {
            this.countdownTimers = this.polls.map((poll, index) => {
                return setInterval(() => {
                    const timeDifferenceInSeconds = Math.floor(
                        (poll.validTill - new Date()) / 1000
                    );
                    if (timeDifferenceInSeconds <= 0) {
                        // Poll expired, clear the interval and set the timer to "Expired"
                        clearInterval(this.countdownTimers[index]);
                        this.polls[index].countdownTimer = "Expired";

                        // Remove the countdown end time from localStorage
                        localStorage.removeItem(`countdown_end_time_${index}`);
                    } else {
                        const hours = Math.floor(timeDifferenceInSeconds / 3600);
                        const minutes = Math.floor((timeDifferenceInSeconds % 3600) / 60);
                        const seconds = timeDifferenceInSeconds % 60;
                        const timerValue = `${hours}h ${minutes}m ${seconds}s`;
                        this.polls[index].countdownTimer = timerValue;

                        // Save the updated validTill timestamp in localStorage
                        localStorage.setItem(
                            `countdown_end_time_${index}`,
                            poll.validTill.getTime().toString()
                        );
                    }
                }, 1000); // Update the timer every second
            });
        },
        openModal() {
            this.isModalOpen = true;
        },
        triggerToast() {
            this.toast.error("Logout successful.");
            this.router.push("/login");
        },
        openMyPoll() {
            this.router.push("/mypoll")
        },
        openDashboard() {
            this.router.push("/dashboard");
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

.mypoll-button {
    background-color: rgba(55, 252, 252, 0.6);
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

.mypoll-button:hover {
    background-color: rgba(7, 131, 131, 0.6);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
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