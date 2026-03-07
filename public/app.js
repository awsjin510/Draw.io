// PlantUML encoding utilities
const PLANTUML_CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';

function plantumlEncode6bit(b) {
  return PLANTUML_CHARSET[b & 0x3f];
}

function plantumlEncode3bytes(b1, b2, b3) {
  let c1 = b1 >> 2;
  let c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
  let c3 = ((b2 & 0xf) << 2) | (b3 >> 6);
  let c4 = b3 & 0x3f;
  return plantumlEncode6bit(c1) + plantumlEncode6bit(c2) + plantumlEncode6bit(c3) + plantumlEncode6bit(c4);
}

function plantumlEncodeBytes(data) {
  let result = '';
  for (let i = 0; i < data.length; i += 3) {
    if (i + 2 === data.length) {
      result += plantumlEncode3bytes(data[i], data[i + 1], 0);
    } else if (i + 1 === data.length) {
      result += plantumlEncode3bytes(data[i], 0, 0);
    } else {
      result += plantumlEncode3bytes(data[i], data[i + 1], data[i + 2]);
    }
  }
  return result;
}

async function encodePlantUML(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  // Use CompressionStream for deflate-raw
  const cs = new CompressionStream('deflate-raw');
  const writer = cs.writable.getWriter();
  writer.write(data);
  writer.close();

  const reader = cs.readable.getReader();
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  const compressed = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    compressed.set(chunk, offset);
    offset += chunk.length;
  }

  return plantumlEncodeBytes(compressed);
}

// State
let currentPuml = '';
let selectedPresetId = null;

// DOM elements
const presetCards = document.getElementById('preset-cards');
const descriptionInput = document.getElementById('description');
const generateBtn = document.getElementById('generate-btn');
const loadingSection = document.getElementById('loading');
const errorSection = document.getElementById('error');
const errorMessage = document.getElementById('error-message');
const warningsSection = document.getElementById('warnings');
const warningList = document.getElementById('warning-list');
const resultSection = document.getElementById('result');
const diagramImg = document.getElementById('diagram-img');
const diagramError = document.getElementById('diagram-error');
const downloadBtn = document.getElementById('download-btn');
const toggleSourceBtn = document.getElementById('toggle-source-btn');
const sourceSection = document.getElementById('source-section');
const sourceCode = document.getElementById('source-code');

// Load presets
async function loadPresets() {
  try {
    const res = await fetch('/api/presets');
    const presets = await res.json();
    renderPresets(presets);
  } catch (err) {
    console.error('Failed to load presets:', err);
  }
}

function renderPresets(presets) {
  presetCards.innerHTML = presets.map(p => `
    <div class="preset-card" data-id="${p.id}" data-description="${escapeAttr(p.description)}">
      <div class="card-icon">${p.icon}</div>
      <div class="card-name">${p.name}</div>
      <div class="card-desc">${p.description}</div>
    </div>
  `).join('');

  presetCards.querySelectorAll('.preset-card').forEach(card => {
    card.addEventListener('click', () => {
      // Toggle selection
      presetCards.querySelectorAll('.preset-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedPresetId = card.dataset.id;
      descriptionInput.value = card.dataset.description;
    });
  });
}

function escapeAttr(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Generate diagram
async function generate() {
  const description = descriptionInput.value.trim();
  if (!description) {
    showError('請輸入架構描述');
    return;
  }

  // Reset UI
  hideAll();
  loadingSection.classList.remove('hidden');
  generateBtn.disabled = true;

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description,
        type: selectedPresetId || undefined,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || '生成失敗');
      return;
    }

    currentPuml = data.output;

    // Show validation warnings if any
    if (data.validationErrors && data.validationErrors.length > 0) {
      warningList.innerHTML = data.validationErrors.map(e => `<li>${e}</li>`).join('');
      warningsSection.classList.remove('hidden');
    }

    // Render diagram
    await renderDiagram(currentPuml);
    resultSection.classList.remove('hidden');
  } catch (err) {
    showError('請求失敗：' + err.message);
  } finally {
    loadingSection.classList.add('hidden');
    generateBtn.disabled = false;
  }
}

async function renderDiagram(puml) {
  const encoded = await encodePlantUML(puml);
  const url = `https://www.plantuml.com/plantuml/svg/~1${encoded}`;

  diagramImg.classList.remove('hidden');
  diagramError.classList.add('hidden');

  diagramImg.onload = () => {
    diagramError.classList.add('hidden');
  };

  diagramImg.onerror = () => {
    diagramImg.classList.add('hidden');
    diagramError.classList.remove('hidden');
  };

  diagramImg.src = url;
}

function showError(msg) {
  errorMessage.textContent = msg;
  errorSection.classList.remove('hidden');
}

function hideAll() {
  errorSection.classList.add('hidden');
  warningsSection.classList.add('hidden');
  resultSection.classList.add('hidden');
  sourceSection.classList.add('hidden');
  diagramError.classList.add('hidden');
}

// Download .puml file
function downloadPuml() {
  if (!currentPuml) return;
  const blob = new Blob([currentPuml], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'architecture.puml';
  a.click();
  URL.revokeObjectURL(url);
}

// Toggle source code
function toggleSource() {
  if (sourceSection.classList.contains('hidden')) {
    sourceCode.textContent = currentPuml;
    sourceSection.classList.remove('hidden');
    toggleSourceBtn.textContent = '📝 隱藏原始碼';
  } else {
    sourceSection.classList.add('hidden');
    toggleSourceBtn.textContent = '📝 顯示原始碼';
  }
}

// Event listeners
generateBtn.addEventListener('click', generate);
downloadBtn.addEventListener('click', downloadPuml);
toggleSourceBtn.addEventListener('click', toggleSource);

// Allow Ctrl+Enter to generate
descriptionInput.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') {
    generate();
  }
});

// Init
loadPresets();
