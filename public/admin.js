let ws;

const btn_connect = document.getElementById("btn_connect")
const content = document.getElementById("admin_content")
const toggle = document.getElementById("status_icon")
const file_input = document.getElementById("file_picker")

async function connect() {
    const protocol = location.protocol === "https:" ? "wss:" : "ws:";
    ws = new WebSocket(`${protocol}//${location.host}`);

    ws.onopen = () => {
        console.log("Connected!")
        btn_connect.style.display = "none"
        content.classList.remove("hidden")
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

async function uploadFile() {
    const file = file_input.files[0];

    if (!file) {
        alert("Choose an audio file first");
        return;
    }

    const formData = new FormData();
    formData.append("audio", file);
    
    file_input.files = [];

    const response = await fetch("/upload", {
        method: "POST",
        body: formData
    });

    const result = await response.json();

    console.log(result);

    alert("Succesfully uploaded audio file!")
}