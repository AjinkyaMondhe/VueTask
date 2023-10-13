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
            <button class="poll-button" @click="openModal">Create Poll</button>
            <button class="logout-button" @click="triggerToast">Logout</button>
        </div>
        <div class="modal" :class="{ 'modal-open': isModalOpen }">
            <div class="modal-content">
                <form @submit.prevent="submitPoll">
                    <!-- Poll Title -->
                    <label class="input-label" for="question">Poll Title:</label>
                    <div class="input-container">
                        <input class="input-field" type="text" id="question" v-model="question" required
                            placeholder="Enter Poll Title" />
                    </div>

                    <!-- Option Inputs -->
                    <div class="option-inputs">
                        <div class="option-input">
                            <label for="option1">1:</label>
                            <input type="text" id="option1" v-model="options[0]" required placeholder=" Option 1" />
                        </div>
                        <div class="option-input">
                            <label for="option2">2:</label>
                            <input type="text" id="option2" v-model="options[1]" required placeholder=" Option 2" />
                        </div>

                        <!-- Dynamic Option Inputs -->
                        <div v-for="(option, index) in dynamicOptions" :key="index" class="option-input">
                            <label :for="'option' + (index + 3)"> {{ index + 3 }}: </label>
                            <input :type="'text'" :id="'option' + (index + 3)" v-model="dynamicOptions[index]"
                                placeholder="Remove this option if not in use" required />
                            <!-- Button to Remove Option -->
                            <button type="button" @click="removeOption(index)">Remove</button>
                        </div>

                        <!-- Button to Add More Options -->
                        <button type="button" class="addbutton" @click="addOption">
                            Add Option
                        </button>
                    </div>

                    <!-- Custom Timer Input -->
                    <div class="custom-timer-input">
                        <div class="timer-input">
                            <label for="time-value">Enter Time:</label>
                            <input type="number" id="time-value" v-model="timeValue" min="0" aria-label="Enter Time"
                                placeholder="Enter Time" />
                        </div>
                        <div class="timer-input">
                            <label for="time-unit">Select Time Unit:</label>
                            <select id="time-unit" v-model="selectedTimeUnit" aria-label="Select Time Unit">
                                <option value="hours">Hours</option>
                                <option value="minutes">Minutes</option>
                                <option value="seconds">Seconds</option>
                            </select>
                        </div>
                    </div>

                    <div class="visibility-options">
                        <label>Select Visibility:</label>
                        <div class="radio-group">
                            <!-- Public Option -->
                            <label class="radio-label">
                                <input type="radio" id="public" value="public" v-model="visibility" aria-label="Public" />
                                <span class="radio-custom"></span>
                                <span class="radio-text">Public</span>
                            </label>

                            <!-- Private Option -->
                            <label class="radio-label">
                                <input type="radio" id="private" value="private" v-model="visibility"
                                    aria-label="Private" />
                                <span class="radio-custom"></span>
                                <span class="radio-text">Private</span>
                            </label>
                        </div>
                    </div>
                    <button type="submit">Create Poll</button>
                    <button class="cancel" @click="closeModal">Cancel</button>
                </form>
            </div>
        </div>
    </div>
    <!-- Poll Card -->
    <div class="poll-card-container">
        <div class="poll-card" v-for="(poll, index) in polls" :key="index" :class="{ 'expired-poll': isPollExpired(poll) }">
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
</template>

<script>
import axios from "axios";
import { useToast } from "vue-toastification";
import { useRouter } from "vue-router";
// import Navbar from './components/Navbar.vue';

export default {
    name: "DashboardPage",
    components: {},
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
            // Clear the input fields and options
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

.option-inputs button[type="button"] {
    padding: 5px 10px;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

.option-inputs button[type="button"]:hover {
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

/* Add a hover effect */
.logout-button:hover {
    background-color: #c82333;
    /* Slightly darker red on hover */
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Styles for the modal */
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-open {
    display: flex;
}

.modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    width: 80%;
    max-width: 600px;
    text-align: center;
    max-height: 80vh;
    overflow-y: auto;
}

.modal input {
    margin-left: 15px;
    width: 50%;
    margin-bottom: 5px;
    padding: 10px;
}

.modal button {
    padding: 10px 20px;
    margin-top: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.modal button.cancel {
    background-color: #dc3545;
}

label {
    color: black;
}

.modal-content label {
    text-align: right;
    margin-right: 10px;
}

.modal-content input[type="text"] {
    width: 65%;
    margin-left: 10px;
}

.option-inputs .option-input button[type="button"] {
    padding: 5px 10px;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    margin-left: 5px;
}

.option-inputs button[type="button"],
.modal button,
.modal button.cancel {
    padding: 10px 20px;
    margin: 10px 5px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.addbutton {
    background-color: #28a745 !important;
    color: white;
}

.option-inputs button[type="button"] {
    color: white;
}

.modal button[type="submit"] {
    background-color: #007bff;
    color: white;
}

.modal button.cancel {
    background-color: #dc3545;
}

/* Add a hover effect to all buttons */
.option-inputs button[type="button"]:hover,
.modal button:hover,
.modal button.cancel:hover,
.modal button[type="submit"]:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 1000;
    align-items: center;
    justify-content: center;
}

.modal-open {
    display: flex;
}

.modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    width: 80%;
    /* Adjust the width as desired */
    max-width: 600px;
    /* Limit the maximum width if needed */
    text-align: center;
}

/* Styles for the visibility options */
.visibility-options {
    display: flex;
    align-items: center;
    margin-top: 20px;
}

.visibility-options label {
    color: #333;
    font-size: 16px;
    margin-right: 10px;
}

/* Radio button styles */
.radio-group {
    align-items: center;
}

.radio-label input[type="radio"] {
    display: none;
}

.radio-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    margin-right: 20px;
}

.radio-custom {
    width: 20px;
    height: 20px;
    border: 2px solid #007bff;
    border-radius: 50%;
    margin-right: 5px;
    position: relative;
    transition: background-color 0.2s, border-color 0.2s;
}

.radio-label input[type="radio"]:checked+.radio-custom {
    background-color: #007bff;
    border-color: #007bff;
}

.radio-label input[type="radio"]:checked+.radio-custom::before {
    width: 12px;
    height: 12px;
    background-color: #007bff;
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.radio-custom {
    width: 20px;
    height: 20px;
    border: 2px solid #007bff;
    border-radius: 50%;
    margin-right: 5px;
    position: relative;
}

.radio-label input[type="radio"] {
    display: none;
}

.visibility-options .radio-label:last-child {
    margin-right: 0;
}

.visibility-options button[type="button"] {
    padding: 10px 20px;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    margin-left: 20px;
}

.visibility-options button[type="button"]:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.visibility-options button.cancel {
    background-color: #dc3545;
    margin-left: 10px;
}

.option-inputs {
    margin-top: 10px;
}

.option-input {
    align-items: center;
}

.option-input button[type="button"] {
    padding: 5px 10px;
    background-color: red;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

.custom-timer-input {
    display: flex;
    align-items: center;
    margin-top: 10px;

}

/* Style for each timer input */
.timer-input select,
.timer-input input[type="number"] {
    padding: 10px;
    width: 60%;
    /* Make the input fields take the full width */
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 14px;
    background-color: #fff;
    color: #333;
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

.option-inputs {
    margin-top: 10px;
}

.option-input {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.option-input label {
    flex: 0 0 30px;

    text-align: right;
    margin-right: 10px;
}

.option-input input[type="text"] {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 14px;
    background-color: #fff;
    color: #333;
}

.option-input button[type="button"] {
    padding: 5px 10px;
    background-color: red;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

.input-container {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
}

.input-label {
    text-align: right;
    margin-right: 10px;
    font-size: 20px;
    color: #333;
}

.input-field {
    flex: 1;
    margin-left: 10px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 14px;
    background-color: #fff;
    color: #333;
}
</style>