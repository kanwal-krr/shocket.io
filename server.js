require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

// Track users with their socket IDs
const users = {};

io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle user joining with a username
    socket.on('user join', (username) => {
        users[socket.id] = username;
        // Notify everyone about the new user
        io.emit('chat message', { 
            text: `${username} has joined the chat`,
            sender: 'system'
        });
    });

    // Handle chat messages with sender information
    socket.on('chat message', (msg) => {
        io.emit('chat message', {
            text: msg,
            sender: users[socket.id] || 'Anonymous'
        });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        if (users[socket.id]) {
            io.emit('chat message', {
                text: `${users[socket.id]} has left the chat`,
                sender: 'system'
            });
            delete users[socket.id];
        }
        console.log('A user disconnected');
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});