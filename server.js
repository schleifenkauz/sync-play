const express = require("express");
const http = require("http");
const os = require("os")
const WebSocket = require("ws");
const multer = require("multer");
const dotenv = require("dotenv")
const { S3Client, PutObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");

const app = express();
app.use(express.static("public"));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const upload = multer({
    storage: multer.memoryStorage()
});

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
                const msg = JSON.stringify({ type: "pause" })
                clients.forEach(ws => ws.send(msg))
            }
            playing = !playing;
        }
    });
});

dotenv.config()

const r2 = new S3Client({
    region: "auto",
    endpoint:
        `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,

    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
    }
});

app.post("/upload", upload.single("file"), async (req, res) => {

    const file = req.file;

    if (!file) return res.status(400).json({ message: 'no file' });

    await r2.send(
        new PutObjectCommand({
            Bucket: "sync-play",
            Key: file.originalname,
            Body: file.buffer,
            ContentType: file.mimetype
        })
    );

    res.json({
        message: "uploaded",
        file: file.originalname
    });
});

async function get_all_keys() {
    const result_list = await r2.send(
        new ListObjectsV2Command({
            Bucket: "sync-play"
        })
    );
    return (result_list.Contents || []).map(obj => obj.Key);
}

app.get("/available-files", async (req, res) => {
    const keys = await get_all_keys();
    res.json(keys);
})

app.get("/dl-audio-file", async (req, res) => {
    const domain = process.env.R2_PUBLIC_DOMAIN;
    const keys = await get_all_keys()
    const key = getRandomItem(keys);
    console.log("Selected ", key, " from ", keys);
    const url = `${domain}/${key}`
    res.redirect(url);
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

const port = process.env.PORT || 8081;
server.listen(port, "0.0.0.0", () => {
    const ip = getLocalIP();
    const url = `http://${ip}:${port}`;
    console.log("Client Adresse: ", url);
});

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}