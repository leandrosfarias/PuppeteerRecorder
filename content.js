let recording = false;

// Função para aplicar estilo de destaque ao elemento
function destacarElemento(elemento) {
  elemento.style.border = "3px solid red";
}

// Função para remover estilo de destaque do elemento
function removerDestaqueElemento(elemento) {
  elemento.style.border = "";
}

// Função para capturar seletor do elemento ao clicar
function capturarSeletorElemento(elemento) {
  const seletor = elemento.tagName.toLowerCase() + 
                  (elemento.className ? '.' + elemento.className.split(' ').join('.') : '');
  alert("Seletor do elemento:\n" + seletor);
}

chrome.runtime.onMessage.addListener(function(msg, sender, Response) {
  if (msg.command === 'start') {
    console.log('Iniciando gravação...');
    recording = true;
    iniciarGravacao();
  }
  if (msg.command === 'stop') {
    recording = false;
    // console.log('Gravação finalizada.');
    console.log('actions ->\n', actions);
    // chrome.runtime.sendMessage({ action: 'saveScript', data: actions });
    removerOuvintesDeEventos();
    saveScriptToDisk();
  }
});

// chrome.runtime.onMessage.addListener(
//   function(message, sender, sendResponse) {
//     if (message.action === 'saveScript') {
//       console.log('Received script data:', message.data);
//       // Aqui você pode processar os dados do script
//       // saveScriptToDisk(message.data);
//     }
//   }
// );

const actions = [];

function saveScriptToDisk() {
  // Concatena as ações em uma única string de script Puppeteer
  let scriptContent = "const puppeteer = require('puppeteer');\n\n" +
                      "async function run() {\n" +
                      "  const browser = await puppeteer.launch();\n" +
                      "  const page = await browser.newPage();\n";

  actions.forEach(action => {
    scriptContent += `  ${action}\n`;
  });

  scriptContent += "  await browser.close();\n}\n\nrun();";
  const blob = new Blob([scriptContent], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  chrome.runtime.sendMessage({ action: 'downloadFile', blob: blob, url: url });
  // downloadScript(blob);
  // const url = URL.createObjectURL(blob);
  // const a = document.createElement('a');
}

function downloadScript(blob) {
  // Cria uma URL para o Blob
  console.log('Blob:', blob);

  const url = URL.createObjectURL(blob);
  console.log('URL:', url);

  // Inicia o download do arquivo
  chrome.downloads.download({
    url: url,
    filename: 'automacao.js',  // Nome do arquivo que será salvo
    saveAs: true  // Solicita ao usuário que escolha onde salvar o arquivo
  }, downloadId => {
    if (chrome.runtime.lastError) {
      console.error('Erro ao baixar arquivo:', chrome.runtime.lastError);
    } else {
      console.log('Arquivo baixado com ID:', downloadId);
    }

    // Libera a URL do objeto após o download iniciar
    URL.revokeObjectURL(url);
  });
}

// document.addEventListener('click', (event) => {
//   if (!recording) return;
//   const selector = generateUniqueSelector(event.target);
//   actions.push(`await page.click('${selector}');`);
// }, true);

function generateUniqueSelector(element) {
  let path = [];
  while (element.nodeType === Node.ELEMENT_NODE) {
    // let selector = element.nodeName.toLowerCase();
    let selector = '';
    if (element.id) {
      selector += '#' + element.id;
      path.unshift(selector);
      break;  // Um ID deve ser único; se está correto, pode parar aqui
    }

    let sibling = element;
    let nth = 1;
    while (sibling = sibling.previousElementSibling) {
      if (sibling.nodeName.toLowerCase() == element.nodeName.toLowerCase()) {
        nth++;
      }
    }
    if (nth != 1) {
      selector += `:nth-child(${nth})`;
    }

    path.unshift(selector);
    element = element.parentNode;
  }

  return path.join(' > ');
}


function handleClickEvent(event) {
  console.log('Cliquei em um elemento!');
  event.stopImmediatePropagation();  // Impede que o evento padrão ocorra
  event.stopPropagation();  // Impede que o evento continue a propagar
  // const elemento = event.target;
  // capturarSeletorElemento(elemento);
  const selector = generateUniqueSelector(event.target);
  console.log('Selector:', selector);
  actions.push(`await page.click('${selector}');`);
  console.log('actions ->\n', actions);
  event.stopPropagation();  // Impede que o evento continue a propagar
}

function handleMouseOverEvent(event) {
  const elemento = event.target;
  if (elemento !== document.body && elemento !== document.documentElement) {
    destacarElemento(elemento);
  }
}

function handleMouseOutEvent(event) {
  const elemento = event.target;
  removerDestaqueElemento(elemento);      
}

function iniciarGravacao() {
  const elementos = document.querySelectorAll("*");
  elementos.forEach(elemento => {
      elemento.addEventListener('mouseover', handleMouseOverEvent);
      elemento.addEventListener('mouseout', handleMouseOutEvent);
      elemento.addEventListener('click', handleClickEvent, true);
  });
}

function removerOuvintesDeEventos() {
  console.log("Gravação finalizada.");
  document.removeEventListener("mouseover", function (event) {
    const elemento = event.target;
    if (elemento !== document.body && elemento !== document.documentElement) {
      destacarElemento(elemento);
    }
  });

  document.removeEventListener("mouseout", function (event) {
    const elemento = event.target;
    removerDestaqueElemento(elemento);
  });

  document.removeEventListener(
    "click",
    function (event) {
      console.log("Cliquei em um elemento!");
      event.stopImmediatePropagation(); // Impede que o evento padrão ocorra
      event.stopPropagation(); // Impede que o evento continue a propagar
      // const elemento = event.target;
      // capturarSeletorElemento(elemento);
      const selector = generateUniqueSelector(event.target);
      console.log("Selector: ", selector);
      actions.push(`await page.click('${selector}');`);
      console.log("actions ->\n", actions);
      event.stopPropagation(); // Impede que o evento continue a propagar
    },
    true
  );

  document.removeEventListener(
    "input",
    (event) => {
      // if (!recording || !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) return;
      console.log("evento digitar");
      const selector = generateUniqueSelector(event.target);
      const value = event.target.value;
      actions.push(
        `await page.type('${selector}', '${value.replace(/'/g, "\\'")}');`
      );
      console.log("actions ->\n", actions);
    },
    true
  );
}

console.log('Extensão carregada e ouvintes de eventos configurados.');
