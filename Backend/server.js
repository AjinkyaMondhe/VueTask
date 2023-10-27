const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http").createServer(app); // Use createServer to bind Socket.IO
const io = require("socket.io")(http);

mongoose.set("strictQuery", false);

// Import routes from your separate routes file
const routes = require("./routes/routes");
const pollController = require("./controllers/poll");

const corsOptions = {
  origin: "http://localhost:8080", // Whitelist your frontend URL
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

// Use CORS middleware with options
app.use(cors(corsOptions));
app.use(express.json());
app.use(routes);

app.get("/api/polls", pollController.getAllPolls);
app.post("/api/polls", pollController.createPoll);

app.options("/register", cors());

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

  // Listen for the "chat message" event
  socket.on("chat message", (message) => {
    // Log the received message to the backend terminal
    console.log("Message from a user: " + message);
    // Broadcast the message to all connected clients
    io.emit("chat message", "User: " + message);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.use(cors({ origin: 'http://localhost:8080' }));

http.listen(3000, function check(error) {
  if (error) {
    console.log("Server start error:", error);
  } else {
    console.log("Server started on port 3000");
  }
});
