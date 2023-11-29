const Poll = require("../Model/pollSchema");

exports.getAllPolls = async (req, res) => {
  try {
    const polls = await Poll.find();

    res.status(200).json(polls);
  } catch (error) {
    console.error(error);

    res.status(500).json({ message: "Internal server error" });
  }
};

exports.createPoll = async (req, res) => {
  try {
    const { question, options, time, visibility } = req.body;
    const validTill = new Date(Date.now() + time * 1000);
    const createdAt = new Date();

    const poll = new Poll({
      question,
      options,
      time,
      visibility,
      validTill,
      createdAt,
    });

    await poll.save();

    res.status(201).json({ message: "Poll created successfully", poll });
  } catch (error) {
    console.error(error);

    res.status(500).json({ message: "Internal server error" });
  }
};

exports.voteOnPoll = async (req, res) => {
  const { pollId, optionIndex } = req.body;
  const userId = req.user; // Assuming you have a middleware to get the user ID

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

    // Update the vote count for the selected option
    const optionVote = poll.voteCounts.find(
      (vote) => vote.optionIndex === optionIndex
    );
    if (optionVote) {
      optionVote.count += 1;
    } else {
      poll.voteCounts.push({ optionIndex, count: 1 });
    }

    await poll.save();

    res.status(200).json({ message: "Vote recorded successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.voteOnPoll = async (req, res) => {
  const { pollId, optionIndex } = req.body;
  const userId = req.user; // Assuming you have a middleware to get the user ID

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

    // Update the vote count for the selected option
    const optionVote = poll.optionVotes[optionIndex];
    if (optionVote !== undefined) {
      poll.optionVotes[optionIndex]++;
    } else {
      poll.optionVotes[optionIndex] = 1;
    }

    await poll.save();

    res.status(200).json({ message: "Vote recorded successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
