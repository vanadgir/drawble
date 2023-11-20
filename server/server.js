const express = require("express");
const session = require("express-session");
const helmet = require("helmet");
const passport = require("passport");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("./auth");

// initialize express and passport
const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());
app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// initialize socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// custom middleware
function isLoggedIn(req, res, next) {
  if (req.user) {
    return next();
  } else {
    return res.json({ authenticated: false, user: "Please Login" });
  }
}

// basic helmet header security
app.use(helmet());

// client homepage
app.get("/", (req, res) => {
  res.redirect("http://localhost:3000");
});

// google authenticate route
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

// callback after authenticate, success/fail
app.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/auth/failure",
  })
);

// auth failure route
app.get("/auth/failure", (req, res) => {
  res.send("Something went wrong...");
});

// auth status route, protected
app.get("/auth/status", isLoggedIn, (req, res) => {
  res.json({
    authenticated: true,
    email: req.user.email,
  });
});

// logout route
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Logout failed");
    }
    res.clearCookie("connect.sid").redirect("/");
  });
});

// track active rooms
const availableRooms = [
  { room: "123", vacant: true},
  { room: "456", vacant: true},
  { room: "789", vacant: true},
];

// create room route
app.post("/api/createRoom", (req, res) => {
  const vacantRoom = availableRooms.findIndex((room) => room.vacant);
  if (vacantRoom !== -1) {
    const roomKey = availableRooms[vacantRoom].room;
    availableRooms[vacantRoom].vacant = false;

    res.json({ roomKey });
  } else {
    res.status(404).send("Please wait for a vacant room.");
  }
});

// join room route
app.post("/api/joinRoom", (req, res) => {
  const { enteredRoomKey } = req.body;
  const hostedRoom = availableRooms.findIndex(
    (room) => room.room === enteredRoomKey && !room.vacant
  );
  if (hostedRoom !== -1) {
    res.json({ enteredRoomKey });
  } else {
    res.status(404).send("Room not found or unavailable");
  }
});

// track active users
const activeUsers = {};

// socket.io events
// connect event
io.on("connection", (socket) => {
  // new member join event
  socket.on("join", (username) => {
    activeUsers[socket.id] = username;
  });

  // new message event
  socket.on("new-message", (data) => {
    socket.broadcast.emit("receive-message", data);
  });

  // disconnect event
  socket.on("disconnect", () => {
    const disconnectedUser = activeUsers[socket.id];
    delete activeUsers[socket.id];
    io.emit("user-disconnected", disconnectedUser);
  });
});

// set port and start server
const port = process.env.DEV_SERVER_PORT;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
