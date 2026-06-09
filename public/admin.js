let ws;

function setStatus(message) {
    document.getElementById("status").innerHTML = message
}

function setVisibility(id, v) {
    document.getElementById(id).style.visibility = v
}

async function connect() {
    ws = new WebSocket(`ws://${location.host}`);

    ws.onopen = () => {
        console.log("Connected!")
        setStatus("Connected!")
        setVisibility("btn_start", "visible")
        setVisibility("btn_connect", "collapse")
    }

    ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data)
        if (data.type === "start") {
            console.log("Start")
            setStatus("Started!")
        }
    }
}

async function startAudio() {
    ws.send(JSON.stringify({
        type: "start"
    }))
    setVisibility("btn_start", "hidden")
}