class ExerciseBlock extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.mode = 'keyboard';
    this.hasSpeechRec = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    this.hasSpeechSynth = !!window.speechSynthesis;
    
    this.questionText = "";
    this.targetAnswer = "";
    this.recognitionLang = "";
    this.synthesisLang = "";
    this.alreadyFinished = false; // Voorkomt dubbele events
  }

  connectedCallback() {
    this.determineDirection();
    this.render();
  }

  determineDirection() {
    const from = this.getAttribute('from');
    const fromLang = this.getAttribute('from-lang') || 'nl-NL';
    const to = this.getAttribute('to');
    const toLang = this.getAttribute('to-lang') || 'en-GB';

    if (Math.random() < 0.5) {
      this.questionText = `Hoe zeg je "${from}" in het ${this.getLanguageName(toLang)}?`;
      this.targetAnswer = to;
      this.synthesisLang = fromLang;
      this.recognitionLang = toLang;
    } else {
      this.questionText = `Hoe zeg je "${to}" in het ${this.getLanguageName(fromLang)}?`;
      this.targetAnswer = from;
      this.synthesisLang = toLang;
      this.recognitionLang = fromLang;
    }
  }

  getLanguageName(langCode) {
    const names = {
      'nl-NL': 'Nederlands', 'en-GB': 'Engels', 'en-US': 'Engels',
      'fr-FR': 'Frans', 'de-DE': 'Duits', 'gr': 'Grieks', 'cyr': 'Russisch'
    };
    return names[langCode] || langCode;
  }

  setMode(newMode) {
    this.mode = newMode;
    this.render();
    this.setupValidation();
    if (newMode === 'write') this.initCanvas();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; font-family: sans-serif; max-width: 600px; margin: 0; padding: 0; }
        .header { margin-bottom: 15px; }
        .text-row { display: flex; align-items: center; gap: 10px; }
        h3 { margin: 0; font-size: 1.2rem; }
        .mode-selector { display: flex; gap: 8px; margin-bottom: 20px; background: #f0f0f0; padding: 4px; border-radius: 8px; }
        .mode-btn { flex: 1; border: none; padding: 6px; border-radius: 6px; cursor: pointer; background: transparent; font-weight: bold; color: #666; }
        .mode-btn.active { background: white; color: #007bff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .mode-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .icon-btn { background: #f0f0f0; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        #canvas-container { border: 2px dashed #ddd; border-radius: 8px; background: #fff; }
        canvas { width: 100%; height: 200px; touch-action: none; }
        .mic-area { text-align: center; padding: 15px; background: #fafafa; border-radius: 8px; }
        .mic-btn { width: 50px; height: 50px; border-radius: 50%; border: none; background: #dc3545; color: white; cursor: pointer; font-size: 20px; }
        .mic-btn.recording { animation: pulse 1.5s infinite; background: #ff0000; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(220, 53, 69, 0); } 100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); } }
        .hidden { display: none; }
        .action-btn { margin-top: 8px; padding: 6px 12px; border: 1px solid #ccc; border-radius: 4px; background: white; cursor: pointer; font-size: 12px; }
        .finish-btn { background: #28a745; color: white; border: none; margin-left: 5px; }
      </style>

      <div class="header">
        <div class="text-row">
          <h3>${this.questionText}</h3>
          <button id="tts-btn" class="icon-btn" ${!this.hasSpeechSynth ? 'disabled' : ''}>🔊</button>
        </div>
      </div>

      <div class="mode-selector">
        <button class="mode-btn ${this.mode === 'keyboard' ? 'active' : ''}" data-mode="keyboard">⌨️ Typen</button>
        <button class="mode-btn ${this.mode === 'write' ? 'active' : ''}" data-mode="write">✍️ Schrijven</button>
        <button class="mode-btn ${this.mode === 'speak' ? 'active' : ''}" data-mode="speak" ${!this.hasSpeechRec ? 'disabled' : ''}>🎤 Spreken</button>
      </div>

      <div id="content-area">
        <div class="${this.mode !== 'keyboard' ? 'hidden' : ''}">
          <multi-keyboard id="kb-input" placeholder="Typ het antwoord..."></multi-keyboard>
        </div>

        <div class="${this.mode !== 'write' ? 'hidden' : ''}">
          <div id="canvas-container"><canvas id="write-canvas"></canvas></div>
          <button id="clear-canvas" class="action-btn">Wissen</button>
          <button id="finish-write" class="action-btn finish-btn">Klaar met schrijven</button>
        </div>

        <div class="${this.mode !== 'speak' ? 'hidden' : ''}">
          <div class="mic-area">
            <button id="mic-btn" class="mic-btn">🎙️</button>
            <p id="transcript-status"><small>Antwoord in het ${this.getLanguageName(this.recognitionLang)}</small></p>
            <div id="speech-result" style="font-weight:bold; margin-top:10px; color:#007bff;"></div>
          </div>
        </div>
      </div>
    `;

    this.setupEventListeners();
    this.setupValidation();
  }

  setupEventListeners() {
    this.shadowRoot.querySelectorAll('.mode-btn:not([disabled])').forEach(btn => {
      btn.onclick = () => this.setMode(btn.dataset.mode);
    });

    const ttsBtn = this.shadowRoot.getElementById('tts-btn');
    if (ttsBtn) ttsBtn.onclick = () => {
      const utterance = new SpeechSynthesisUtterance(this.questionText);
      utterance.lang = this.synthesisLang;
      window.speechSynthesis.speak(utterance);
    };

    if (this.mode === 'speak' && this.hasSpeechRec) {
      const micBtn = this.shadowRoot.getElementById('mic-btn');
      micBtn.onclick = () => this.startSpeechRecognition();
    }

    if (this.mode === 'write') {
      this.shadowRoot.getElementById('finish-write').onclick = () => {
        // Bij handschrift gaan we ervan uit dat het goed is zodra ze op 'Klaar' drukken
        // Omdat we geen tekstherkenning hebben.
        this.fireSuccessEvent('handwriting');
      };
    }
  }

  startSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = this.recognitionLang; 
    const micBtn = this.shadowRoot.getElementById('mic-btn');
    recognition.onstart = () => micBtn.classList.add('recording');
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      this.shadowRoot.getElementById('speech-result').innerText = `Gehoord: "${transcript}"`;
      this.checkFinalAnswer(transcript);
    };
    recognition.onend = () => micBtn.classList.remove('recording');
    recognition.start();
  }

  setupValidation() {
    if (this.mode === 'keyboard') {
      const kb = this.shadowRoot.getElementById('kb-input');
      const handler = () => {
        const input = kb.shadowRoot.getElementById('output');
        if(input) this.checkFinalAnswer(input.value, input);
      };
      kb.shadowRoot.addEventListener('input', handler);
      kb.shadowRoot.addEventListener('click', handler);
    }
  }

  checkFinalAnswer(value, element = null) {
    const isCorrect = value.toLowerCase().trim() === this.targetAnswer.toLowerCase().trim();
    if (element) {
      element.style.backgroundColor = isCorrect ? '#d4edda' : '#f8d7da';
      element.style.borderColor = isCorrect ? '#28a745' : '#dc3545';
    }
    if (isCorrect) {
      if (this.mode === 'speak') {
        this.shadowRoot.getElementById('speech-result').innerText += " ✅";
      }
      this.fireSuccessEvent(this.mode);
    }
  }

  fireSuccessEvent(method) {
    if (this.alreadyFinished) return;
    this.alreadyFinished = true;

    this.dispatchEvent(new CustomEvent('right-answer-given', {
      bubbles: true,
      composed: true,
      detail: {
        answer: this.targetAnswer,
        method: method,
        question: this.questionText
      }
    }));
  }

  initCanvas() {
    const canvas = this.shadowRoot.getElementById('write-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let drawing = false;
    canvas.width = canvas.offsetWidth;
    canvas.height = 200;
    ctx.lineWidth = 3; ctx.lineCap = 'round';
    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return { x: (e.clientX || e.touches?.[0].clientX) - rect.left, y: (e.clientY || e.touches?.[0].clientY) - rect.top };
    };
    canvas.onmousedown = (e) => { drawing = true; ctx.beginPath(); const p = getPos(e); ctx.moveTo(p.x, p.y); };
    canvas.onmousemove = (e) => { if (!drawing) return; const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); };
    window.onmouseup = () => drawing = false;
    canvas.ontouchstart = (e) => { drawing = true; ctx.beginPath(); const p = getPos(e); ctx.moveTo(p.x, p.y); };
    canvas.ontouchmove = (e) => { if (!drawing) return; const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); };
    canvas.ontouchend = () => drawing = false;
    this.shadowRoot.getElementById('clear-canvas').onclick = () => ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

customElements.define('exercise-block', ExerciseBlock);