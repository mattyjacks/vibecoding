window.VCAD2 = window.VCAD2 || {};

window.VCAD2.State = {
  config: {
    endpoint: localStorage.getItem('vcad2_endpoint') || 'https://openrouter.ai/api/v1/chat/completions',
    model: (localStorage.getItem('vcad2_model') === 'openai/gpt-6-luna-light' ? 'google/gemini-2.5-flash' : localStorage.getItem('vcad2_model')) || 'google/gemini-2.5-flash',
    apiKey: localStorage.getItem('vcad2_apikey') || ''
  },
  assembly: {
    name: 'Untitled_Model',
    submodels: [],
    parts: []
  },
  mechaRig: {
    joints: [],
    isPlaying: false,
    speed: 10
  },
  explodeFactor: 0,
  wireframe: false,
  history: [],
  future: [],
  listeners: [],

  subscribe(fn) {
    this.listeners.push(fn);
  },

  notify(event, payload) {
    this.listeners.forEach(fn => fn(event, payload, this));
  },

  setAssembly(assembly, recordHistory = true) {
    if (recordHistory && this.assembly.parts.length) {
      this.history.push(JSON.parse(JSON.stringify(this.assembly)));
      if (this.history.length > 30) this.history.shift();
      this.future = [];
    }
    this.assembly = assembly;
    this.notify('assembly:updated', assembly);
  },

  undo() {
    if (!this.history.length) return;
    this.future.push(JSON.parse(JSON.stringify(this.assembly)));
    const prev = this.history.pop();
    this.setAssembly(prev, false);
    this.log('Undo applied.', 'info');
  },

  redo() {
    if (!this.future.length) return;
    this.history.push(JSON.parse(JSON.stringify(this.assembly)));
    const next = this.future.pop();
    this.setAssembly(next, false);
    this.log('Redo applied.', 'info');
  },

  setMechaRig(joints) {
    this.mechaRig.joints = joints;
    this.notify('mecha:updated', joints);
  },

  log(message, level = 'info') {
    this.notify('log:entry', { message, level, time: new Date().toLocaleTimeString() });
  },

  setStep(stepName, status = 'active') {
    this.notify('pipeline:step', { stepName, status });
  }
};
