const mongoose = require("mongoose");
const PollSchema = new mongoose.Schema({
  question: String,
  options: [String],
  time: Number,
  visibility: String,
  createdAt: { type: Date, default: Date.now },
  validTill: Date,
  status: String,
  votes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      optionIndex: Number,
    },
  ],
  optionVotes: [Number], // Store the count of votes for each option
  votedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

module.exports = mongoose.model("Poll", PollSchema);
