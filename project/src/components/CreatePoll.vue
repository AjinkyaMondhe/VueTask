<template>
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
                            <input type="radio" id="private" value="private" v-model="visibility" aria-label="Private" />
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
</template>

<script>
import axios from "axios";
export default {

    name: "createPoll",
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
    method: {

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
        addOption() {
            this.dynamicOptions.push("");
        },
        removeOption(index) {
            this.dynamicOptions.splice(index, 1);
        },
    },
};
</script>

<style>
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
</style>