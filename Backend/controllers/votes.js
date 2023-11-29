const express = require("express");
const Poll = require("../Model/pollSchema");

// Define a route to handle votes
exports.votes = async (req, res) => {
  const { pollId, optionIndex } = req.body;
  const userId = req.user; 

  try {
    const poll = await Poll.findById(pollId);

    // Check if the user has already voted in this poll
    const existingVote = poll.votes.find(
      (vote) => vote.user.toString() === userId
    );

    if (existingVote) {
      return res
        .status(400)
        .json({ message: "You have already voted in this poll." });
    }

    // Record the vote
    poll.votes.push({ user: userId, optionIndex });
    await poll.save();

    res.status(200).json({ message: "Vote recorded successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
