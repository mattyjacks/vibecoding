window.VCAD2 = window.VCAD2 || {};

window.VCAD2.Workbench = {
  init() {
    const State = window.VCAD2.State;

    // Tabs
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab, .tab-content').forEach(el => el.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
      });
    });

    // Generate
    document.getElementById('btn-generate').addEventListener('click', async () => {
      const prompt = document.getElementById('prompt-input').value.trim() || '4-wheel rover with steering';
      await window.VCAD2.NovaPlanner.buildFromPrompt(prompt);
      window.VCAD2.CritiqueLoop.run();
      window.VCAD2.MechaAnalyzer.analyze();
    });

    // Presets
    document.querySelectorAll('.chip[data-preset]').forEach(chip => {
      chip.addEventListener('click', async () => {
        const map = {
          rover: '4-wheel rover with steering and gear drive',
          arm: 'articulated robotic arm with shoulder and elbow gears',
          gearbox: 'meshed 3-gear reduction gearbox'
        };
        const prompt = map[chip.dataset.preset];
        document.getElementById('prompt-input').value = prompt;
        await window.VCAD2.NovaPlanner.buildFromPrompt(prompt);
        window.VCAD2.CritiqueLoop.run();
        window.VCAD2.MechaAnalyzer.analyze();
      });
    });

    // Camera presets
    document.querySelectorAll('[data-cam]').forEach(btn => {
      btn.addEventListener('click', () => window.VCAD2.Viewport3D.setCameraPreset(btn.dataset.cam));
    });

    // Undo / Redo & Wireframe
    document.getElementById('btn-undo').addEventListener('click', () => State.undo());
    document.getElementById('btn-redo').addEventListener('click', () => State.redo());
    document.getElementById('btn-wireframe').addEventListener('click', () => {
      State.wireframe = !State.wireframe;
      window.VCAD2.Viewport3D.renderAssembly(State.assembly);
    });

    // Code view toggle (.MPD vs Blender Python)
    document.getElementById('btn-view-mpd').addEventListener('click', () => {
      document.getElementById('code-preview').textContent = window.VCAD2.LDrawExporter.toMPD(State.assembly);
    });
    document.getElementById('btn-view-blender').addEventListener('click', () => {
      document.getElementById('code-preview').textContent = window.VCAD2.BlenderExporter.toPythonScript(State.assembly, State.mechaRig.joints);
    });

    // Critique & Rig buttons
    document.getElementById('btn-critique').addEventListener('click', () => window.VCAD2.CritiqueLoop.run());
    document.getElementById('btn-rig').addEventListener('click', () => window.VCAD2.MechaAnalyzer.analyze());

    // Explode & Animation
    document.getElementById('slider-explode').addEventListener('input', e => {
      State.explodeFactor = Number(e.target.value) / 100;
      window.VCAD2.Viewport3D.applyExplode(State.explodeFactor);
    });

    const playBtn = document.getElementById('btn-play-anim');
    playBtn.addEventListener('click', () => {
      State.mechaRig.isPlaying = !State.mechaRig.isPlaying;
      playBtn.textContent = State.mechaRig.isPlaying ? '⏸ Pause Mecha' : '▶ Play Mecha';
    });

    document.getElementById('slider-speed').addEventListener('input', e => {
      State.mechaRig.speed = Number(e.target.value);
    });

    // Exports
    document.getElementById('btn-export-mpd').addEventListener('click', () => {
      const mpd = window.VCAD2.LDrawExporter.toMPD(State.assembly);
      window.VCAD2.LDrawExporter.download(`${State.assembly.name}.mpd`, mpd);
    });
    document.getElementById('btn-export-stl').addEventListener('click', () => {
      const stl = window.VCAD2.MeshExporter.toASCIISTL(State.assembly);
      window.VCAD2.LDrawExporter.download(`${State.assembly.name}.stl`, stl);
    });
    document.getElementById('btn-export-json').addEventListener('click', () => {
      window.VCAD2.LDrawExporter.download(`${State.assembly.name}.json`, JSON.stringify(State.assembly, null, 2), 'application/json');
    });

    // Settings Modal
    const modal = document.getElementById('modal-settings');
    document.getElementById('btn-settings').addEventListener('click', () => {
      document.getElementById('input-endpoint').value = State.config.endpoint;
      document.getElementById('input-model').value = State.config.model;
      document.getElementById('input-apikey').value = State.config.apiKey;
      modal.classList.remove('hidden');
    });
    document.getElementById('btn-close-settings').addEventListener('click', () => modal.classList.add('hidden'));
    document.getElementById('btn-save-settings').addEventListener('click', () => {
      State.config.endpoint = document.getElementById('input-endpoint').value.trim();
      State.config.model = document.getElementById('input-model').value.trim();
      State.config.apiKey = document.getElementById('input-apikey').value.trim();
      localStorage.setItem('vcad2_endpoint', State.config.endpoint);
      localStorage.setItem('vcad2_model', State.config.model);
      localStorage.setItem('vcad2_apikey', State.config.apiKey);
      this.updateModeBadge();
      modal.classList.add('hidden');
    });

    this.updateModeBadge();

    // State Subscriptions
    State.subscribe((event, payload) => {
      if (event === 'assembly:updated') {
        window.VCAD2.Viewport3D.renderAssembly(payload);
        this.renderTree(payload);
        document.getElementById('code-preview').textContent = window.VCAD2.LDrawExporter.toMPD(payload);
      } else if (event === 'mecha:updated') {
        this.renderMechaList(payload);
      } else if (event === 'log:entry') {
        const feed = document.getElementById('agent-log');
        const div = document.createElement('div');
        div.className = `log-entry ${payload.level}`;
        div.textContent = `[${payload.time}] ${payload.message}`;
        feed.prepend(div);
      } else if (event === 'pipeline:step') {
        const pill = document.querySelector(`.step-pill[data-step="${payload.stepName}"]`);
        if (pill) {
          pill.classList.remove('active', 'done');
          pill.classList.add(payload.status);
        }
      }
    });
  },

  updateModeBadge() {
    const badge = document.getElementById('mode-indicator');
    const live = window.VCAD2.LunaLightClient.isLiveMode();
    badge.textContent = live ? 'Luna Light Live' : 'Demo Mode';
    badge.className = `status-pill ${live ? 'status-live' : 'status-demo'}`;
  },

  renderTree(assembly) {
    const tree = document.getElementById('assembly-tree');
    document.getElementById('part-count').textContent = `${assembly.parts.length} parts`;
    tree.innerHTML = '';
    assembly.parts.forEach(p => {
      const item = document.createElement('div');
      item.className = 'tree-item';
      item.innerHTML = `<span><strong>${p.id}</strong> · ${p.type}</span><span class="badge badge-subtle">${p.submodel}</span>`;
      tree.appendChild(item);
    });
  },

  renderMechaList(joints) {
    const list = document.getElementById('mecha-list');
    if (!joints.length) {
      list.innerHTML = '<p class="empty-state">No kinematic joints detected.</p>';
      return;
    }
    list.innerHTML = '';
    joints.forEach(j => {
      const item = document.createElement('div');
      item.className = 'tree-item';
      item.innerHTML = `<span><strong>${j.partId}</strong> · ${j.type}</span><span class="badge badge-accent">ratio ${j.ratio.toFixed(2)}</span>`;
      list.appendChild(item);
    });
  }
};
