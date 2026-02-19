const { Server } = require("socket.io");
const http = require("http");
const express = require("express");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: [process.env.BASE_URL || "http://localhost:5173"],
    },
});

const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {

    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id;

    // emits the online users to the client
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // can be used to listen to the events from the client
    socket.on("disconnect", () => {
        if (userId) delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

module.exports = { io, app, server, getReceiverSocketId };
