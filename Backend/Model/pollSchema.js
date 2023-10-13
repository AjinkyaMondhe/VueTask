const mongoose = require("mongoose");

const PollSchema = {
  question: String, // The title or question of the poll
  options: [String], // An array of poll options
  time: Number, // The duration of the poll in seconds
  visibility: String, // The visibility of the poll (e.g., 'public' or 'private')
  createdAt: { type: Date, default: Date.now },
  validTill: Date,
  votes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the User model or user identifier
      },
      optionIndex: Number, // Index of the selected option
    },
  ],
  voteCounts: [
    {
      optionIndex: Number, // Index of the option
      count: Number, // Number of votes for the option
    },
  ],
};
module.exports = mongoose.model("Poll", PollSchema);
