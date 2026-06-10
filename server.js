const express = require("express");
const http = require("http");
const os = require("os")
const WebSocket = require("ws");

const app = express();
app.use(express.static("public"));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = [];

let playing = false

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

        if (data.type === "toggle") {
            if (!playing) {            
                const startEpoch = Date.now() + 2000
                const msg = JSON.stringify({ type: "start", startTime: startEpoch })
                clients.forEach(ws => ws.send(msg))
            } else {
                const msg = JSON.stringify({type: "pause"})
                clients.forEach(ws => ws.send(msg))
            }
            playing = !playing;
        }
    });
});

function getLocalIP() {
  const nets = os.networkInterfaces();

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {

      if (
        net.family === "IPv4" &&
        !net.internal &&
        !name.includes("Virtual") &&
        !name.includes("Docker")
      ) {
        return net.address;
      }
    }
  }
}

const port = process.env.PORT || 8080;
server.listen(port, "0.0.0.0", () => {
    const ip = getLocalIP();
    const url = `http://${ip}:${port}`;
    console.log("Client Adresse: ", url);
});