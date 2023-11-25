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
const activeRooms = {};

// track active users
const activeUsers = {};

// socket.io events
// connect event
io.on("connection", (socket) => {
  // new member join event
  socket.on("join-room", ({ username, roomKey }) => {
    socket.join(roomKey);
    activeUsers[socket.id] = { username, roomKey };

    if (!activeRooms[roomKey]) {
      activeRooms[roomKey] = [];
    }
    activeRooms[roomKey].push(socket.id);

    // console.log(activeRooms);
    // console.log(activeUsers);
    console.log(io.sockets.adapter.rooms.get(roomKey));

    socket.to(roomKey).emit("user-connected", { username });
  });

  socket.on("check-rooms", (roomKey, callback) => {
    const room = io.sockets.adapter.rooms.get(roomKey);
    const isRoomExists = room !== undefined;

    callback(isRoomExists);
  });

  // new message event
  socket.on("new-message", ({ username, text, roomKey }) => {
    io.to(roomKey).emit("receive-message", { username, text });
  });

  socket.on("draw-line", ({ prevPoint, currentPoint, color, roomKey }) => {
    // socket.broadcast.emit("draw-line", { prevPoint, currentPoint, color });
    // io.to(roomKey).emit("draw-line", { prevPoint, currentPoint, color });
  });

  // disconnect event
  socket.on("disconnect", () => {
    const user = activeUsers[socket.id];
    if (!user) return;

    const { roomKey } = user;
    delete activeUsers[socket.id];

    if (activeRooms[roomKey]) {
      const index = activeRooms[roomKey].indexOf(socket.id);
      if (index !== -1) {
        activeRooms[roomKey].splice(index, 1);
        if (activeRooms[roomKey].length === 0) {
          socket.leave(roomKey);
          delete activeRooms[roomKey];
        }
      }
    }

    // console.log(activeRooms);
    // console.log(activeUsers);

    io.to(roomKey).emit("user-disconnected", user.username);
  });
});

// set port and start server
const port = process.env.DEV_SERVER_PORT;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
