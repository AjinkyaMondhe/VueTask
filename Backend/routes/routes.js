var express = require("express");
const userController = require("../controllers/user.js");
const pollController = require("../controllers/poll.js");
const voteController = require("../controllers/votes.js");

const router = express.Router();

// get apis
router.get("/api/polls", pollController.getAllPolls);

// post apis
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/api/polls", pollController.createPoll);
router.post("/api/votes", voteController.votes);

router.post("/dashboard", pollController.voteOnPoll);

module.exports = router;
