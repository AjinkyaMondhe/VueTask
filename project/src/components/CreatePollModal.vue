<template>
    <div class="navbar">
        <div class="modal" :class="{ 'modal-open': isModalOpen }">
            <div class="modal-content">
                <h1>Create Poll</h1>
                <form @submit.prevent="submitPoll">
                    <div class="modal-content-inner">
                        <div class="sections-container">
                            <!-- Left Section: Poll Title and Options -->
                            <div class="left-section">
                                <!-- <label class="input-label" for="question">Poll Title:</label> -->
                                <div class="input-container">
                                    <input class="input-field" type="text" id="question" v-model="question" required
                                        placeholder="Enter a question for eg:- Who won the world cup 2023 ?" />
                                </div>
                                <div class="option-inputs">
                                    <div class="option-input">
                                        <!-- <label for="option1">1:</label> -->
                                        <input type="text" id="option1" v-model="options[0]" required
                                            placeholder=" Option 1" />
                                    </div>
                                    <div class="option-input">
                                        <!-- <label for="option2">2:</label> -->
                                        <input type="text" id="option2" v-model="options[1]" required
                                            placeholder=" Option 2" />
                                    </div>

                                    <!-- Dynamic Option Inputs -->
                                    <div v-for="(option, index) in dynamicOptions" :key="index" class="option-input">
                                        <div class="option-input-container">
                                            <!-- <label :for="'option' + (index + 3)"> {{ index + 3 }}:</label> -->
                                            <input :type="'text'" :id="'option' + (index + 3)"
                                                v-model="dynamicOptions[index]"
                                                placeholder="Remove this option if not in use" required />
                                            <!-- Button to Remove Option -->
                                            <button type="button" @click="removeOption(index)">X</button>
                                        </div>
                                    </div>
                                    <!-- Button to Add More Options -->
                                    <button type="button" class="addbutton" @click="addOption">Add Option</button>
                                </div>
                            </div>
                            <!-- Right Section: Timer and Visibility Options -->
                            <div class="right-section">
                                <div class="custom-timer-input">
                                    <div class="timer-input1">
                                        <label for="time-value">Enter Time:</label>
                                        <input type="number" id="time-value" v-model="timeValue" min="0"
                                            aria-label="Enter Time" placeholder="Enter Time" />
                                    </div>
                                    <div class="timer-input2">
                                        <label for="time-unit">Time Unit:</label>
                                        <select id="time-unit" v-model="selectedTimeUnit" aria-label="Select Time Unit">
                                            <option value="hours">Hours</option>
                                            <option value="minutes">Minutes</option>
                                            <option value="seconds">Seconds</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="visibility-options" v-if="showInMypoll">
                                    <label>Select Visibility:</label>
                                    <div class="radio-group">
                                        <!-- Public Option -->
                                        <label class="radio-label">
                                            <input type="radio" id="public" value="public" v-model="visibility"
                                                aria-label="Public" />
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
                            </div>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button type="submit">Create Poll</button>
                        <button class="cancel" @click="closeModal">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import { useToast } from "vue-toastification";
import { useRouter } from "vue-router";
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
            showInMypoll: true,
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
    },
    methods: {
        closeModal() {
            this.$emit('cancel');
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
                    this.showInMypoll = this.visibility === 'private';
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
.modal {
    font-family: 'Ubuntu', sans-serif;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    overflow: auto;
    /* Enable scrolling if the content is too long */
}

.modal-content-inner {
    display: flex;
}

.modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    width: 60%;
    text-align: center;
    max-height: 85vh;
    overflow-y: auto;
}

.sections-container {
    display: flex;
}

.left-section,
.right-section {
    flex: 1;
    /* Each section takes up 50% of the available width */
    padding: 20px;
}

.modal input {
    width: 100%;
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

.modal-content input[type="text"] {
    margin-left: 10px;
}

.modal-content h1 {
    font-size: 24px;
    margin-bottom: 20px;
    color: #007bff;
    /* Change the color to your preferred style */
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
    display: flex;
    margin-left: 18px;
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

.option-inputs button[type="button"]:hover,
.modal button:hover,
.modal button.cancel:hover,
.modal button[type="submit"]:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

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

.radio-group {
    display: flex;
}


.radio-label {
    display: flex;
    align-items: center;
    cursor: pointer;
}

/* Style for each radio button */
.radio-label input[type="radio"] {
    display: none;
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

/* Add some margin to the last radio button to create spacing */
.radio-label:last-child {
    margin-right: 0;
}

/* Style for radio buttons label text */
.radio-text {
    margin-right: 10px;
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

.visibility-options button[type="button"]:last-child {
    margin-left: 0;
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

.option-input-container {
    display: flex;
    width: 115%;
}

.option-input-container label {
    margin-right: 10px;
}

.option-input-container input[type="text"] {
    width: 75%;
    margin-left: 10px;

}

.option-input-container button[type="button"] {
    padding: 5px 10px;
    background-color: red;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
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

/* Style for each timer input */
.custom-timer-input {
    display: flex;
    flex-direction: row;
    margin-top: 50px;
    /* text-align: left; */
}

.timer-input1 input[type="number"] {
    padding: 10px;
    width: 60%;
    /* Adjust the width for the timer input */
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 14px;
    background-color: #fff;
    color: #333;
}

.timer-input2 select,
.timer-input2 input[type="number"] {
    padding: 10px;
    width: 100%;
    /* Adjust the width for the time unit input */
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 14px;
    background-color: #fff;
    color: #333;
    margin-right: 40px;
    padding-right: 24px;
}

.left-section {
    flex: 1;
    /* Each section takes up 50% of the available width */
    padding: 20px;
    display: flex;
    flex-direction: column;
}

.input-label {
    text-align: center;

}

.option-input {
    display: flex;
    align-items: center;
}

.option-input-container {
    display: flex;
    align-items: center;
}

.option-input-container label {
    margin-right: 10px;
    align-self: flex-start;
    /* Align label to the left */
}
</style>