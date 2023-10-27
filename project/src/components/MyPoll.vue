<template>
    <div>
        <Navbar />
        <div class="mypolls-container">
            <div class="poll-list-column">
                <h1 class="header">My Polls</h1>

                <ul class="poll-list">
                    <li v-for="(poll, index) in polls" :key="poll._id"
                        :class="{ 'selected-poll': index === selectedQuestionIndex }" @click="showPollDetails(poll, index)"
                        class="poll-item">
                        <a class="poll-link">{{ poll.question }}</a>
                    </li>
                </ul>
            </div>

            <div class="poll-details-column">
                <h2 class="header">Poll Details</h2>
                <div v-if="!selectedPoll" class="intro-text">Click on a question to see more details</div>
                <div v-if="selectedPoll">
                    <h3 class="question-title">{{ selectedPoll.question }}</h3>
                    <p class="poll-info"><strong>Created At:</strong> {{ formatDate(selectedPoll.createdAt) }}</p>
                    <p class="poll-info"><strong>Visibility:</strong> {{ selectedPoll.visibility }}</p>
                    <p class="poll-info"><strong>Poll Status:</strong> {{ pollStatus }}</p>
                    <p class="poll-info"><strong>Valid Till:</strong> {{ formatDate(selectedPoll.validTill) }}</p>

                    <!-- Display options with percentages using a bar chart -->
                    <div class="options-container" v-if="selectedPoll.options && selectedPoll.options.length">
                        <h3 class="options-title">Options</h3>
                        <ul class="options-list">
                            <li v-for="(option, optionIndex) in selectedPoll.options" :key="optionIndex">
                                <div class="option-details">
                                    <label class="option-text">{{ option.text }}</label>
                                    <div class="bar-chart">
                                        <div :style="{ width: (option.voteCount / maxVoteCount * 100) + '%' }" class="bar">
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <!-- Display the total votes at the bottom -->
                        <p class="total-votes-info"><strong>Total Votes:</strong> {{ totalVotes }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import Navbar from './Navbar.vue';

export default {
    components: {
        Navbar,
    },
    data() {
        return {
            polls: [],
            selectedPoll: null,
            selectedQuestionIndex: -1,
        };
    },
    created() {
        // Fetch the list of polls from your API when the component is created
        axios
            .get("http://localhost:3000/api/polls")
            .then((response) => {
                this.polls = response.data;
            })
            .catch((error) => {
                console.error("Error fetching poll data:", error);
            });
    },
    methods: {
        showPollDetails(poll, index) {
            this.selectedPoll = poll;
            this.selectedQuestionIndex = index;
        },
        formatDate(dateTime) {
            const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            return new Date(dateTime).toLocaleString(undefined, options);
        },
    },
    computed: {
        pollStatus() {
            if (!this.selectedPoll) {
                return ""; // No selected poll
            }
            const now = new Date();
            const validTill = new Date(this.selectedPoll.validTill);

            if (now > validTill) {
                return "Closed"; // Poll is closed
            } else {
                return "Open"; // Poll is open
            }
        },
        totalVotes() {
            if (this.selectedPoll && this.selectedPoll.options && this.selectedPoll.options.length > 0) {
                // Calculate the total votes for all options
                return this.selectedPoll.options.reduce((total, option) => total + option.voteCount, 0);
            }
            return 0;
        },
        maxVoteCount() {
            if (this.selectedPoll && this.selectedPoll.options && this.selectedPoll.options.length > 0) {
                return Math.max(...this.selectedPoll.options.map(option => option.voteCount));
            }
            return 0;
        },
    },
};
</script>

  
<style scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: Arial, Helvetica, sans-serif;
}



.mypolls-container {
    display: flex;
    justify-content: center;
    align-items: center;
}

.poll-list-column {
    width: 30%;
    padding: 20px;
    background-color: #f0f0f0;
    overflow: auto;
    height: 88vh;
}

.poll-list {
    list-style: none;
    padding: 0;
}

.poll-item {
    margin: 10px 0;
    cursor: pointer;
    transition: background-color 0.3s;
    color: #333;
    /* Default text color */
}

.selected-poll {
    background-color: #55a3f6;
    color: #fff !important;
    border-radius: 5px;
}

.poll-link {
    text-decoration: none;
    color: #333;
    font-weight: bold;
    display: block;
    padding: 10px;
    border-radius: 5px;
}

.poll-item.selected-poll .poll-link {
    color: #fff;
    /* Change text color on selection */
}

.poll-link:hover {
    background-color: #55a3f6;
    color: #fff;
}

.poll-details-column {
    width: 70%;
    padding: 20px;
    background-color: #fff;

    overflow: auto;
    height: 88vh;
}

.header {
    /* font-size: 24px; */
    margin-bottom: 20px;
    /* background-color: #55a3f6; */
    border-radius: 5px;
    display: inline-block;
    /* color: #fff; */
    /* padding: 10px; */
    /* text-align: center; */
}

.intro-text {
    font-size: 18px;
    margin: 20px 0;
    color: #777;
    text-align: left;
}

.question-title {
    font-size: 20px;
    margin-bottom: 10px;
    color: #333;
}

.poll-info {
    margin: 10px 0;
    font-size: 14px;
    color: #555;
}

/* Style the visibility and created/valid till dates differently */

/* Style links within the poll details */
.poll-details-column a {
    color: #007BFF;
    text-decoration: underline;
}

/* Add some space between details items */
.poll-details-column .poll-info:not(:last-child) {
    margin-bottom: 15px;
}

.option-text {
    font-size: 18px;
    margin-bottom: 8px;
    color: #333;
}

.option-details .option-text {
    font-size: 18px;
    margin-bottom: 8px;
    color: #333;
    /* Adjust the color to make it visible */
}

.bar-chart {
    height: 20px;
    background-color: #f0f0f0;
    border-radius: 5px;
    overflow: hidden;
    margin-bottom: 8px;
    position: relative;
}

.total-votes-info {
    margin-top: 20px;
    font-size: 18px;
    color: #333;
}


.bar {
    height: 100%;
    background-color: #55a3f6;
    transition: width 0.5s;
    position: relative;
}

.percentage {
    position: absolute;
    right: 10px;
    color: #fff;
    font-weight: bold;
}

.options-title {
    font-size: 24px;
    margin-bottom: 10px;
    color: #333;
}

.options-list {
    list-style: none;
    padding: 0;
}

.option-details {
    margin-bottom: 20px;
    border: 1px solid #e0e0e0;
    padding: 10px;
    border-radius: 5px;
    background-color: #f9f9f9;
}

.option-details .option-text {
    font-size: 18px;
    margin-bottom: 8px;
    color: #333;
}

/* Add gradient effect to the bar for better visualization */
.bar::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, #55a3f6 0%, #55a3f6 100%);
    opacity: 0.5;
    z-index: -1;
}

.total-votes-info {
    margin-top: 20px;
    font-size: 18px;
    color: #333;
    font-weight: bold;
}
</style>