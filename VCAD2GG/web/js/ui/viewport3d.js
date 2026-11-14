window.VCAD2 = window.VCAD2 || {};

window.VCAD2.Viewport3D = {
  scene: null,
  camera: null,
  renderer: null,
  controls: null,
  group: null,
  meshesById: {},
  clock: null,

  init(containerId) {
    const container = document.getElementById(containerId);
    if (!window.THREE) {
      container.innerHTML = '<div class="empty-state">Three.js failed to load (offline?). CAD data &amp; exports still work.</div>';
      return;
    }

    this.clock = new THREE.Clock();
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 200);
    this.camera.position.set(10, 8, 12);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    if (THREE.OrbitControls) {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
    }

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(10, 18, 10);
    this.scene.add(ambient, dir);

    const grid = new THREE.GridHelper(24, 24, 0x30363d, 0x1e242c);
    this.scene.add(grid);

    this.group = new THREE.Group();
    this.scene.add(this.group);

    window.addEventListener('resize', () => {
      if (!this.renderer) return;
      this.camera.aspect = container.clientWidth / container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(container.clientWidth, container.clientHeight);
    });

    this.animate();
  },

  renderAssembly(assembly) {
    if (!this.group || !window.THREE) return;
    while (this.group.children.length) {
      this.group.remove(this.group.children[0]);
    }
    this.meshesById = {};

    const Catalog = window.VCAD2.PartCatalog;
    (assembly.parts || []).forEach(part => {
      const spec = Catalog.get(part.type);
      let geo;
      if (spec.shape === 'cylinder' || spec.shape === 'gear') {
        const radius = spec.size[0] / 2;
        geo = new THREE.CylinderGeometry(radius, radius, spec.size[2], spec.shape === 'gear' ? 16 : 24);
      } else {
        geo = new THREE.BoxGeometry(spec.size[0], spec.size[1], spec.size[2]);
      }

      const mat = new THREE.MeshStandardMaterial({
        color: part.color || '#38bdf8',
        roughness: 0.35,
        metalness: 0.25,
        wireframe: window.VCAD2.State.wireframe
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(part.pos[0], part.pos[1], part.pos[2]);
      mesh.rotation.set(part.rot[0], part.rot[1], part.rot[2]);
      mesh.userData = { basePos: [...part.pos], baseRot: [...part.rot] };

      this.group.add(mesh);
      this.meshesById[part.id] = mesh;
    });

    this.applyExplode(window.VCAD2.State.explodeFactor);
  },

  applyExplode(factor) {
    Object.values(this.meshesById).forEach(mesh => {
      const [bx, by, bz] = mesh.userData.basePos;
      const scale = 1 + factor * 1.5;
      mesh.position.set(bx * scale, by * scale, bz * scale);
    });
  },

  setCameraPreset(preset) {
    if (!this.camera) return;
    const map = {
      iso: [10, 8, 12],
      front: [0, 3, 15],
      side: [15, 3, 0],
      top: [0, 18, 0.01]
    };
    const pos = map[preset] || map.iso;
    this.camera.position.set(...pos);
    this.camera.lookAt(0, 1.5, 0);
  },

  animate() {
    requestAnimationFrame(() => this.animate());
    if (this.controls) this.controls.update();
    if (this.clock) {
      const t = this.clock.getElapsedTime();
      // Sync baseRot for joints
      window.VCAD2.State.mechaRig.joints.forEach(j => {
        if (!j.baseRot && this.meshesById[j.partId]) {
          j.baseRot = {
            x: this.meshesById[j.partId].rotation.x,
            y: this.meshesById[j.partId].rotation.y,
            z: this.meshesById[j.partId].rotation.z
          };
        }
      });
      window.VCAD2.MechaRigger.stepAnimation(this.meshesById, t);
    }
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
};
