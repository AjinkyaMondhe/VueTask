<template>
    <div>
        <Navbar />
        <!-- Sorting Button -->
        <div class="sort-button-container">
            <label class="sort-label" for="poll-sort">Sort by:</label>
            <select id="poll-sort" v-model="selectedSort">
                <option value="all">All</option>
                <option value="live">Live Polls</option>
                <option value="expired">Expired Polls</option>
            </select>
        </div>
        <!-- Poll Card (for Public Polls) -->
        <div class="poll-card-container">
            <div class="poll-card" v-for="(poll, index) in publicPolls" :key="index"
                :class="{ 'expired-poll': isPollExpired(poll) }">
                <h3>{{ poll.question }}</h3>
                <div class="countdown-timer" :class="countdownTimerClass(poll)">{{ poll.countdownTimer }}</div>

                <div class="poll-options" :class="{ 'expired-options': isPollExpired(poll) }">
                    <p v-for="(option, optionIndex) in poll.options" :key="optionIndex"
                        @click="selectOption(index, optionIndex)" :class="{ selected: isSelected(index, optionIndex) }">
                        {{ option }}
                    </p>
                </div>
                <div class="poll-details">
                    <div class="created-at custom-font">
                        Created At: {{ formatDateTime(poll.createdAt) }}
                    </div>
                    <div class="valid-till custom-font">
                        Valid Till: {{ formatDateTime(poll.validTill) }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import axios from "axios";
import { useToast } from "vue-toastification";
import { useRouter } from "vue-router";
import Navbar from './Navbar.vue';
export default {
    name: "DashboardPage",
    components: { Navbar, },
    data() {
        return {
            isModalOpen: false,
            question: "",
            options: ["", ""],
            isDashboardActive: true,
            polls: [], // Array to store user-created polls
            selectedOptionIndex: null,
            dynamicOptions: [""],
            time: null,
            timeValue: 0,
            selectedTimeUnit: "hours",
            visibility: "public",
            currentDateTime: "",
            validTill: null, // Add a new property for the "Valid Till" time
            selectedOption: [],
            countdownTimers: [], // Store individual countdown timers for each poll
            selectedSort: "all",
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

        // Initialize current date and time
        this.updateCurrentDateTime();
    },

    setup() {
        const toast = useToast();
        const router = useRouter();
        return { toast, router };
    },
    computed: {
        totalTimeInSeconds() {
            switch (this.selectedTimeUnit) {
                case "hours":
                    return this.timeValue * 3600;
                case "minutes":
                    return this.timeValue * 60;
                case "seconds":
                    return this.timeValue;
                default:
                    return 0;
            }
        },
        countdownTimerClass() {
            return (poll) => {
                const timeDifferenceInSeconds = Math.floor(
                    (poll.validTill - new Date()) / 1000
                );
                if (timeDifferenceInSeconds <= 0) {
                    return 'expired-timer';
                } else if (timeDifferenceInSeconds <= 300) { // Less than 5 minutes
                    return 'warning-timer';
                } else {
                    return ''; // No special class
                }
            };
        },
        sortedPolls() {
            if (this.selectedSort === "all") {
                return this.polls;
            } else if (this.selectedSort === "live") {
                return this.polls.filter(poll => !this.isPollExpired(poll));
            } else if (this.selectedSort === "expired") {
                return this.polls.filter(poll => this.isPollExpired(poll));
            }
            return this.polls; // Default to "All" if something unexpected is selected
        },
        publicPolls() {
            return this.sortedPolls.filter(poll => poll.visibility === 'public');
        },
        privatePolls() {
            return this.sortedPolls.filter(poll => poll.visibility === 'private');
        },
        showMyPollSection() {
            return this.selectedSort === 'all' || this.selectedSort === 'live';
        },
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
        closeModal() {
            this.isModalOpen = false;
            this.question = "";
            this.options = ["", ""];
            this.dynamicOptions = [""];
            this.time = null;
        },
        submitPoll() {
            const now = new Date();
            const newPoll = {
                question: this.question,
                options: [...this.options, ...this.dynamicOptions].slice(0, 4),
                time: this.totalTimeInSeconds,
                visibility: this.visibility,
                createdAt: now, // Store the creation time
                validTill: new Date(now.getTime() + this.totalTimeInSeconds * 1000),
                status: 'open', // Set the status to 'open' when creating the poll
            };
            // Calculate the "Valid Till" time by adding user-inputted time to the current date and time
            this.validTill = new Date(now.getTime() + this.totalTimeInSeconds * 1000);
            newPoll.validTill = this.validTill; // Store the valid till time in the poll object

            axios
                .post("http://localhost:3000/api/polls", newPoll)
                .then((response) => {
                    // Poll created successfully, you can handle the response here
                    console.log("Poll created:", response.data);
                    this.closeModal();
                    this.toast.success("Poll created successfully!");
                    // Add the new poll to the polls array
                    this.polls.push(newPoll);
                })
                .catch((error) => {
                    // Handle errors here
                    console.error("Error creating poll:", error);
                    this.toast.error("Error creating poll. Please try again later.");
                });
        },
        triggerToast() {
            this.toast.error("Logout successful.");
            this.router.push("/login");
        },

        addOption() {
            this.dynamicOptions.push("");
        },
        removeOption(index) {
            this.dynamicOptions.splice(index, 1);
        },
        selectOption(index, optionIndex) {
            if (this.selectedOption[index] === optionIndex) {
                return; // User has already voted for this option
            }
            this.selectedOption[index] = optionIndex; // Update the selectedOption array

            // Send a POST request to vote for the selected option
            axios
                .post("http://localhost:3000/api/votes", {
                    pollId: this.polls[index]._id,
                    optionIndex,
                })
                .then(() => {
                    // Vote recorded successfully
                    this.toast.success("Successfully Voted!");
                })
                .catch((error) => {
                    console.error("Error recording vote:", error);
                    this.toast.error("Voter Already Voted");
                });
        },

        isSelected(index, optionIndex) {
            return this.selectedOption[index] === optionIndex; // Check if an option is selected
        },
        isPollExpired(poll) {
            return new Date() > poll.validTill;
        },
        openDashboard() {
            this.router.push("/dashboard");
        },
        updateCurrentDateTime() {
            const now = new Date();
            const options = {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
            };
            this.currentDateTime = now.toLocaleDateString(undefined, options);
        },
        formatDateTime(dateTime) {
            if (!(dateTime instanceof Date) || isNaN(dateTime)) {
                return ""; // Handle cases where dateTime is not a valid Date object
            }
            const options = {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
            };
            return dateTime.toLocaleDateString(undefined, options);
        },
    },
};
</script>

<style scoped>
.sort-label {
    font-weight: bold;
    margin-right: 10px;
    color: #333;
}

/* Style for the sorting button container */
.sort-button-container {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-right: 20px;
    margin-top: 10px;
}

/* Style for the sorting button select element */
#poll-sort {
    margin: auto 5px;
    padding: 5px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: #fff;
    font-size: 13px;
    cursor: pointer;
    transition: border-color 0.3s, background-color 0.3s;
}

/* Style the select element on focus */
#poll-sort:focus {
    outline: none;
    border-color: #007bff;
    background-color: #f8f8f8;
}

.poll-card-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    /* Center the poll cards horizontally */
}

.poll-card {
    width: 800px;
    background-color: #ffffff;
    border: 1px solid #dddddd;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin: 10px;
    position: relative;
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: pointer;
    display: flex;
    flex-direction: column;
}

.poll-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    background-color: #f5f5f5;
}

.poll-card h3 {
    font-size: 20px;
    margin-bottom: 15px;
    font-weight: bold;
}

.poll-card.expired-poll:hover {
    transform: none;
    box-shadow: none;
    cursor: not-allowed !important;
    background-color: #b5b5b5;
}

/* Apply hover effect to non-expired polls */
.poll-card:not(.expired-poll):hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    background-color: #f5f5f5;
}

.poll-options p[disabled] {
    background-color: #f0f0f0;
    /* Gray background for disabled options */
    color: #666;
    /* Gray text color for disabled options */
    cursor: not-allowed;
    /* Change cursor to not-allowed for disabled options */
    pointer-events: none;
    /* Disable pointer events for disabled options */
}

.expired-poll h3 {
    color: #666;
    /* Gray text color for expired polls */
}

.expired-options p {
    background-color: #f0f0f0;
    /* Gray background for expired options */
    color: #666;
    /* Gray text color for expired options */
    cursor: not-allowed;
    /* Change cursor to not-allowed for expired options */
    pointer-events: none;
    /* Disable pointer events for expired options */
}

.countdown-timer {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 16px;
    color: white;
    background-color: #28a745;
    border-radius: 18px;
    padding: 5px 10px;
}

.warning-timer {
    font-size: large;
    background-color: red;
}

.expired-timer {
    background-color: black;
}

.expired-poll {
    background-color: #b5b5b5;
    cursor: not-allowed !important;
}

.expired-options p {
    color: #ccc;
    /* Gray out the option text */
    cursor: not-allowed !important;
}

.poll-options {
    margin-left: 20px;
    flex-grow: 1;
}

.poll-options p {
    margin: 10px 0;
    font-size: 15px;
    cursor: pointer;
    padding: 10px;

    transition: background-color 0.3s;
    border: 1px solid black;
}

.poll-options p:hover {
    color: #333;
    font-size: 17px;
}

.poll-options p:hover {
    background-color: #f5f5f5;
    box-shadow: 1px 1px 1px grey;
}

.poll-details {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: 10px;
}

.created-at,
.valid-till {
    font-size: 16px;
    color: #888;
}

.created-at {
    margin-left: 10px;
}

.valid-till {
    margin-right: 10px;
}

.selected {
    background-color: #333;
    color: #fff;
    font-weight: bold;
}

.custom-font {
    font-family: "YourCustomFont", sans-serif;
    font-size: 13px;
    font-weight: bold;
    color: #333;
}
</style>
