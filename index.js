const WebSocket = require('ws');
const mongoose = require('mongoose');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

// Mongoose configuration
const mongoUri = "mongodb+srv://janithakarunarathna12:E3OUigKBJAVPHgAi@voltmeterv1.vxefnw8.mongodb.net/VoltmeterV1?retryWrites=true&w=majority";
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
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

const Reading = mongoose.model('Reading', ReadingSchema);

// WebSocket server setup
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Client connected');

    const sendReadings = async () => {
        try {
            const readings = await Reading.find({}).exec();
            console.log('Sending data:', readings); // Log data to check the content
            ws.send(JSON.stringify(readings));
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // Send test data immediately
    ws.send(JSON.stringify([{ timestamp: new Date(), volts0: 1.2, volts1: 2.3 }]));

    // Send data every 30 seconds
    const interval = setInterval(sendReadings, 30000);

    ws.on('close', () => {
        clearInterval(interval);
        console.log('Client disconnected');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

const PORT = process.env.PORT || 1880;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
