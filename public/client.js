let ws;
let audioCtx;
let buffer;

let latency = 0;

function setStatus(message) {
    document.getElementById("status").innerHTML = message
}

function disable(btnId) {
    document.getElementById(btnId).disable = false
}

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

// AUDIO START
function playAt(serverTime) {
    const offset = serverTime - Date.now() - latency;
    console.log("Offset: ", offset);
    const startTime = (audioCtx.currentTime + offset) / 1000;

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);

    console.log("Start At ", startTime, ", now: ", audioCtx.currentTime);
    source.start(startTime);
}

// CONNECT
async function connect() {
    await loadAudio();
    disable("btn_connect")

    ws = new WebSocket(`ws://${location.host}`);

    ws.onopen = () => {
        console.log("Connected!")
        setInterval(ping, 1000); 
        setStatus("Connected!")
    };

    ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);

        if (data.type === "pong") {
            handlePong(data);
        }

        if (data.type === "start") {
            console.log("START:", data.startTime);
            setStatus("Playing")
            playAt(data.startTime);
        }
    };
}