const express = require("express");
const session = require("express-session");
const cors = require("cors");
const helmet = require("helmet");
const passport = require("passport");
const http = require("http");
const { Server } = require("socket.io");
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
app.get("/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

// callback after authenticate, success/fail
app.get("/google/callback",
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

// simple route to verify server running
app.get("/test-route", (req, res) => {
  res.json({status: "running"});
});

const mysql = require("mysql2");
// create mysql pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true
});

// intitiate database on server start
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to MySQL Database: ", err);
    return;
  };  
  
  connection.query(process.env.DB_INIT, (err) => {
    if (err) {
      console.error("Error initiating database ", err);
      return;
    }
  });

  connection.release();
});

// track active rooms
let activeRooms = {};

// track active users
let activeUsers = {};

// massage db data into local activeRooms object
const updateRooms = (connection) => {
    connection.query(process.env.DB_SELECT_ROOMS, (err, results) => {
      if (err) {
        console.error("Error getting rooms: ", err);
        return;
      }
      activeRooms = {};
      results.forEach((room) => {
        if (!activeRooms[room.roomKey]) {
          activeRooms[room.roomKey] = [];
        }
        activeRooms[room.roomKey].push(room.socketId);
      });
    });
}

// massage db data into local activeUsers object
const updateUsers = (connection) => {
  connection.query(process.env.DB_SELECT_USERS, (err, results) => {
    if (err) {
      console.error("Error getting rooms: ", err);
      return;
    }
    activeUsers = {};
    results.forEach((user) => {
      activeUsers[user.socketId] = { username: user.username, roomKey: user.roomKey }
    })
  });
}

// function for getting current timestamp
const getTimestamp = () => {
  const currentDate = new Date();
  const timestampString = `${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}-${currentDate.getFullYear()} ${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}:${String(currentDate.getSeconds()).padStart(2, '0')}`;
  return timestampString;
}

// socket.io events
// connect event
io.on("connection", (socket) => {
  console.log(getTimestamp(), "START Socket Connection:", socket.id);

  // join room event
  socket.on("join-room", ({ username, roomKey }) => {

    // get mysql connection
    pool.getConnection((err, connection) => {
      if (err) {
        console.error("Error connecting to MySQL Database: ", err);
        return;
      };  
      const newUser = {socketId: socket.id, username: username, roomKey: roomKey};
      const newRoom = {roomKey: roomKey};

      // query for inserting user into table
      connection.query(process.env.DB_USER_ENTER_ROOM, newUser, (err) => {
        if (err) {
          console.error("Error adding record to database ", err);
          return;
        }
        updateUsers(connection);
      });
  
      // query for inserting room into table
      connection.query(process.env.DB_INSERT_ROOM, newRoom, (err) => {
        if (err) {
          console.error("Error adding record to database ", err);
          return;
        }
        updateRooms(connection);
      });
      connection.release();
    });

    // socket joins room
    socket.join(roomKey);

    // user connected message
    socket.to(roomKey).emit("user-connected", {username});
  });

  // check if room exists
  socket.on("check-rooms", (roomKey, callback) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error("Error connecting to MySQL Database: ", err);
        callback(false);
        return;
      }

      // query for checking room table 
      connection.query(process.env.DB_CHECK_ROOM, roomKey, (err, results) => {
        if (err) {
          console.error("Error finding room: ", err)
          callback(false);
        }
        if (results[0].room_exists === 1) {
          callback(true);
        } else {
          callback(false);
        }
      })
    })
  })

  // leave room event
  socket.on("leave-room", () => {
    const user = activeUsers[socket.id];
    if (!user) return;

    const { roomKey } = user;
    socket.leave(roomKey);

    io.to(roomKey).emit("user-disconnected", user.username);

    // get mysql connection
    pool.getConnection((err, connection) => {
      if (err) {
        console.error("Error connecting to MySQL Database: ", err);
        return;
      };  

      // query for removing user from table
      connection.query(process.env.DB_USER_LEAVE_ROOM, socket.id, (err) => {
        if (err) {
          console.error("Error finding user: ", err);
          return;
        }
        updateUsers(connection);
      });

      // query for checking if room empty
      connection.query(process.env.DB_CHECK_USER_COUNT, roomKey, (err, results) => {
        if (err) {
          console.error("Error finding room: ", err);
          return;
        }
        if (results[0].count==0) {
          connection.query(process.env.DB_DELETE_ROOM, roomKey, (err) => {
            if (err) {
              console.error("Error finding room: ", err);
              return;
            }
            updateRooms(connection);
          })
        }
      });
      connection.release();
    });
  })

  // new message event
  socket.on("new-message", ({ username, text, roomKey }) => {
    io.to(roomKey).emit("receive-message", { username, text });
  });

  // draw line event
  socket.on("draw-line", ({prevPoint, currentPoint, color, roomKey, myDimensions}) => {
    io.to(roomKey).emit("draw-line", {prevPoint, currentPoint, color, dimensions: myDimensions});
  });

  // clear canvas event
  socket.on("clear", ({roomKey}) => {
    io.to(roomKey).emit("clear");
  })

  // disconnect event
  socket.on("disconnect", () => {
    console.log(getTimestamp(), "STOP Socket Connection:", socket.id);
    const user = activeUsers[socket.id];
    if (!user) return;

    const { roomKey } = user;
    socket.leave(roomKey);

    io.to(roomKey).emit("user-disconnected", user.username);

    // get mysql connection
    pool.getConnection((err, connection) => {
      if (err) {
        console.error("Error connecting to MySQL Database: ", err);
        return;
      };  

      // query for removing user from table
      connection.query(process.env.DB_USER_LEAVE_ROOM, socket.id, (err) => {
        if (err) {
          console.error("Error finding user: ", err);
          return;
        }
        updateUsers(connection);
      });

      // query for checking if room empty
      connection.query(process.env.DB_CHECK_USER_COUNT, roomKey, (err, results) => {
        if (err) {
          console.error("Error finding room: ", err);
          return;
        }
        if (results[0].count==0) {
          connection.query(process.env.DB_DELETE_ROOM, roomKey, (err, results) => {
            if (err) {
              console.error("Error finding room: ", err);
              return;
            }
            updateRooms(connection);
          })
        }
      });
      connection.release();
    });
  });
});

// set port and start server
const port = process.env.DEV_SERVER_PORT;
server.listen(port, () => {
  console.log(getTimestamp(), `Server running on port ${port}`);
});
