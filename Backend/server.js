const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const path = require("path");

mongoose.set("strictQuery", false);

// Import routes from your separate routes file
const routes = require("./routes/routes");
const pollController = require("./controllers/poll");

const corsOptions = {
  origin: "http://localhost:8080",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

// Use CORS middleware with options
app.use(cors(corsOptions));

// Routes
app.use(express.json());
app.use(routes);

// Additional routes
app.get("/api/polls", pollController.getAllPolls);
app.post("/api/polls", pollController.createPoll);

mongoose
  .connect("mongodb://0.0.0.0:27017/votingsys", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connected to DB");
  })
  .catch((error) => {
    console.error("Error connecting to DB:", error);
  });

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("vote", (voterInfo) => {
    // Handle the vote information here, for example:
    console.log(
      `User ${voterInfo.userId} voted for option ${voterInfo.optionId}`
    );

    // Broadcast a message to all clients or emit an event
    io.emit("voteMessage", `User ${voterInfo.userId} successfully voted!`);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

http.listen(3000, function check(error) {
  if (error) {
    console.log("Server start error:", error);
  } else {
    console.log("Server started on port 3000");
  }
});
