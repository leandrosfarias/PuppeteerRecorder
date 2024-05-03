// // background.js
// chrome.runtime.onInstalled.addListener(function () {
//   console.log("Extensão instalada.");
// });

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "downloadFile") {
    console.log("Recebendo solicitação de download...");
    const blob = request.blob;
    console.log("Blob em downloadFile: ", blob); 
    // const url = URL.createObjectURL(blob);
    chrome.downloads.download(
      {
        url: request.url,
        filename: "automacao.js",
        saveAs: true,
      },
      function (downloadId) {
        if (chrome.runtime.lastError) {
          console.error("Erro ao baixar arquivo:", chrome.runtime.lastError);
        } else {
          console.log("Arquivo baixado com ID:", downloadId);
          URL.revokeObjectURL(url);
        }
      }
    );
    sendResponse({ status: "Processando download" });
  }
  return true;
});

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === "downloadFile") {
//         const blob = new Blob(["hello world"], {type: 'text/plain'});
//         const url = URL.createObjectURL(blob);
//         console.log(url);  // Deve logar a URL do Blob
//     }
//   });
  