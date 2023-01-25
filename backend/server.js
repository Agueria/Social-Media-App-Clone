const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const authRoute = require('./routes/auth');
const userRoute = require('./routes/users');
const postRoutes = require('./routes/posts');
const convRoutes = require('./routes/conversation');
const messageRoutes = require('./routes/Message');
const { log } = require('console');


dotenv.config();

const connect = async () => {
    try {
        mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.log(err);
    }
}

//middelware
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use(express.json());
app.use(cors());
app.use(morgan('common'));

const storage = multer.diskStorage({
     destination: (req, file, cb) => {
            cb(null, "public/images");
        },
        filename: (req, file, cb) => {
            cb(null, req.body.name);
        },
});

const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
    try {
        return res.status(200).json("File uploaded successfully");
    } catch (err) {
        res.status(500).json(err);
    }
});


app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/posts", postRoutes);
app.use("/conversations", convRoutes);
app.use("/message", messageRoutes);

app.listen(5000, () => {
    connect();
    console.log("Server is running on port: 5000");
});

//socket
const io = require("socket.io")(8900,{
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:3000",
    }
}) 

let users = [];

const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
        users.push({ userId, socketId });
};

const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
};


//socket connection
io.on("connection", (socket) => {
    console.log("a user connected");

    //take userId and socketId from client
    socket.on("addUser", (userId) => {
        addUser(userId, socket.id);
        io.emit("getUsers", users);

    //send and get message
    socket.on("sendMessage", ({ senderId, receiverId, text }) => {
        const user = getUser(receiverId);
        io.to(user.socketId).emit("getMessage", {
            senderId,
            text,
        });
    });

    //when disconnect
    socket.on("disconnect", () => {
        console.log("a user disconnected");
        removeUser(socket.id);
        io.emit("getUsers", users);
    });
});
});