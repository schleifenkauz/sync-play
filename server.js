const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
app.use(express.static("public"));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = [];

wss.on("connection", (ws) => {
    clients.push(ws);

    ws.on("message", (msg) => {
        const data = JSON.parse(msg);

        // Clock sync
        if (data.type === "ping") {

            ws.send(JSON.stringify({
                type: "pong",
                clientTime: data.t0,
                serverTime: Date.now()
            }));
        }

        if (data.type === "start") {
            const startEpoch = Date.now() + 2000
            const msg = JSON.stringify({ type: "start", startTime: startEpoch })
            clients.forEach(ws => ws.send(msg))
        }
    });
});

server.listen(8080, () => {
    console.log("Server läuft auf http://localhost:8080");
});