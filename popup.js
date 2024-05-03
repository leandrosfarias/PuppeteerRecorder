document.getElementById('startRecording').addEventListener('click', () => {
    console.log("Iniciando gravação...");
    // chrome.runtime.sendMessage('noonophlciigdlfpecibjchbefmcnmhe', { command: "start" });
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { command: "start" }, function(response) {
            // console.log(response.farewell);
        });
    });
    document.getElementById('status').textContent = "Gravação iniciada...";
});

document.getElementById('stopRecording').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { command: "stop" }, function(response) {
            // console.log(response.farewell);
        });
    });
    document.getElementById('status').textContent = "Gravação parada. Verifique o console.";
});
