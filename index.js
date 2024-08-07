const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

// CORS configuration
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// Mongoose configuration
const mongoUri = "mongodb+srv://janithakarunarathna12:E3OUigKBJAVPHgAi@voltmeterv1.vxefnw8.mongodb.net/VoltmeterV1?retryWrites=true&w=majority";
mongoose.connect(mongoUri).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB', err);
});

const ReadingSchema = new mongoose.Schema({
    timestamp: Date,
    adc0: Number,
    volts0: Number,
    adc1: Number,
    volts1: Number,
    adc2: Number,
    volts2: Number,
    adc3: Number,
    volts3: Number
});

const Reading = mongoose.model('reading', ReadingSchema);

// WebSocket connection
io.on('connection', (socket) => {
    console.log('a user connected');

    // Send initial data
    const sendInitialData = async () => {
        try {
            const data = await Reading.find({}).sort({ timestamp: -1 }).limit(60).exec();
            console.log('Initial data:', data);  // Log initial data
            socket.emit('initialData', data.reverse());
        } catch (err) {
            console.error(err);
        }
    };

    sendInitialData();

    // Periodically send new data
    setInterval(async () => {
        try {
            const data = await Reading.find({}).sort({ timestamp: -1 }).limit(1).exec();
            console.log('New data:', data);  // Log new data
            socket.emit('newData', data);
        } catch (err) {
            console.error(err);
        }
    }, 60000); // 60 seconds
});

// Endpoint to get historical data
app.get('/data', async (req, res) => {
    const { startTime, endTime } = req.query;
    try {
        const data = await Reading.find({
            timestamp: {
                $gte: new Date(startTime),
                $lte: new Date(endTime)
            }
        }).exec();
        console.log('Historical data:', data);  // Log historical data
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching data' });
    }
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});
