let ws;

const btn = document.getElementById("btn_connect")
const status_div = document.getElementById("status_div")
const toggle = document.getElementById("status_icon")

async function connect() {
    const protocol = location.protocol === "https:" ? "wss:" : "ws:";
    ws = new WebSocket(`${protocol}://${location.host}`);
    
    ws.onopen = () => {
        console.log("Connected!")
        btn.style.display = "none"
        status_div.classList.remove("hidden")   
        toggle.innerHTML = "▶"
    }

    ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data)
        if (data.type === "start") {
            console.log("Start")
            toggle.innerHTML = "⏸"
        }
        if (data.type === "pause") {
            console.log("Pause")
            toggle.innerHTML = "▶"
        }
    }
}

async function toggleAudio() {
    console.log("Toggle")
    ws.send(JSON.stringify({
        type: "toggle"
    }))
}