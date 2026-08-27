let ws;
let videoElem;
let latency = 0;

const btn = document.getElementById("btn_connect");
const status_div = document.getElementById("status_div")
const status = document.getElementById("status_icon");

async function loadMedia() {
    const container = document.querySelector('.container');
    videoElem = document.createElement('video');
    videoElem.id = 'media';
    videoElem.controls = true;
    videoElem.preload = 'auto';
    videoElem.crossOrigin = 'anonymous';
    videoElem.style.maxWidth = '100%';
    videoElem.style.display = 'block';
    videoElem.src = 'dl-audio-file';
    container.appendChild(videoElem);

    await new Promise((resolve) => {
        if (videoElem.readyState >= 3) return resolve();
        videoElem.addEventListener('canplay', resolve, { once: true });
    });
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

    if (!videoElem) {
        console.warn('No media element loaded');
        return;
    }

    // reset to start
    try { videoElem.pause(); videoElem.currentTime = 0; } catch (e) {}

    if (offset <= 0) {
        videoElem.play().catch(e => console.warn('play failed', e));
    } else {
        setTimeout(() => videoElem.play().catch(e => console.warn('play failed', e)), offset);
    }
}

async function connect() {
    btn.style.display = "none"
    status_div.classList.remove("hidden");
    
    await loadMedia();

    const protocol = location.protocol === "https:" ? "wss:" : "ws:";
    ws = new WebSocket(`${protocol}//${location.host}`);
    
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
            if (videoElem) videoElem.pause();
        }
    };
}