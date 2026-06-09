let ws;
let audioCtx;
let buffer;
let source;

let latency = 0;

const btn = document.getElementById("btn_connect");
const status_div = document.getElementById("status_div")
const status = document.getElementById("status_icon");


// AUDIO LADEN
async function loadAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    const res = await fetch("audio.flac");
    const arrayBuffer = await res.arrayBuffer();
    buffer = await audioCtx.decodeAudioData(arrayBuffer);
}

function ping() {
    ws.send(JSON.stringify({
        type: "ping",
        t0: Date.now()
    }));
}

function handlePong(msg) {
    const t1 = Date.now();

    const rtt = t1 - msg.clientTime;
    const estimatedServer = msg.serverTime + rtt / 2;

    latency = estimatedServer - t1;
}

function playAt(serverTime) {
    const offset = serverTime - Date.now() - latency;
    console.log("Offset: ", offset);
    const startTime = (audioCtx.currentTime + offset) / 1000;

    source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);

    console.log("Start At ", startTime, ", now: ", audioCtx.currentTime);
    source.start(startTime);
}

async function connect() {
    btn.style.display = "none"
    status_div.classList.remove("hidden");
    
    await loadAudio();
    
    ws = new WebSocket(`ws://${location.host}`);
    
    ws.onopen = () => {
        console.log("Connected!")
        setInterval(ping, 1000);
        status.innerHTML = "⏸"
    };

    ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);

        if (data.type === "pong") {
            handlePong(data);
        }

        if (data.type === "start") {
            console.log("START:", data.startTime);
            status.innerHTML = "▶"
            playAt(data.startTime);
        }
        if (data.type === "pause") {
            console.log("PAUSE!")
            status.innerHTML = "⏸"
            source.stop();
            source.disconnect();
        }
    };
}