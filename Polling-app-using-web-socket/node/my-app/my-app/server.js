const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3001',
        methods: ['GET', 'POST'],
    },
});

// Enable CORS for all routes
// app.use(cors());

const candidates = {
    bjp: 0,
    congress: 0,
    app: 0,
    other: 0,
};

// Voter IDs to track who has voted
const voterIds = new Set();

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Send initial vote counts to new clients
    socket.emit('updateResults', candidates);

    // Handle user voting
    socket.on('vote', (voterData) => {
        const { voterId, candidate } = voterData;

        console.log(`Received vote from voter ID: ${voterId} for: ${candidate}`);

        // Check if the voter ID has already voted
        if (!voterIds.has(voterId) && candidates[candidate] !== undefined) {
            // Register the voter ID
            voterIds.add(voterId);

            candidates[candidate] += 1;

            io.emit('updateResults', candidates);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});
