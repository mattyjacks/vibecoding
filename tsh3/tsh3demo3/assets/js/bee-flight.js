/**
 * Tri State Honey - Hyper-Realistic Biological 3D Flight Bee Engine (Apis mellifera)
 * Built with Three.js (Procedural Anatomical Modeling & Textures)
 * Features:
 *  - Hyper-realistic honeybee morphology: 
 *      • Faceted kidney-bean compound eyes with hexagonal ommatidia texture & 3 vertex ocelli
 *      • Elbowed (geniculate) antennae with scape and twitching flagellum
 *      • Velvety golden thoracic setae (plumose fur coats)
 *      • 6-segmented abdominal metasoma with alternating amber & black chitin tergites and micro-hair fringes
 *      • Translucent iridescent veined wings with pterostigma cells & full venation (costa, radius, cubitus)
 *      • 6 jointed chitin legs with golden corbiculae (pollen baskets) on hind tibiae & tarsal claws
 *  - TWO GIANT BEES: Periodic foreground flybys every ~20s with high-speed aerodynamic banking
 *  - Scroll-driven 3D flight corridor + organic hovering physics + golden pollen spark trails
 *  - Web Audio acoustic flight synthesis with Doppler effect
 */
(function () {
  'use strict';

  if (typeof THREE === 'undefined') {
    console.warn('Three.js is required for 3D Bee Flight.');
    return;
  }

  // 1. SETUP CANVAS & THREE.JS SCENE
  const canvas = document.createElement('canvas');
  canvas.id = 'tshBeeCanvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  let width = window.innerWidth;
  let height = window.innerHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 0, 22);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // 2. LIGHTING (Warm sunlight & amber rim highlights)
  const ambientLight = new THREE.AmbientLight(0xfff6e6, 1.5);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xfffaec, 2.2);
  sunLight.position.set(18, 28, 22);
  scene.add(sunLight);

  const rimLight = new THREE.DirectionalLight(0xf5b038, 2.0);
  rimLight.position.set(-18, -12, -12);
  scene.add(rimLight);

  const warmUnderlight = new THREE.PointLight(0xd97706, 1.4, 60);
  warmUnderlight.position.set(0, -6, 12);
  scene.add(warmUnderlight);

  // 3. HYPER-REALISTIC PROCEDURAL TEXTURES

  // A. Abdomen (Metasoma) Texture (1024x1024 with realistic tergites & micro-hair bands)
  function createHyperRealisticAbdomenTexture() {
    const cv = document.createElement('canvas');
    cv.width = 1024;
    cv.height = 1024;
    const ctx = cv.getContext('2d');

    // Base chitin tone
    ctx.fillStyle = '#140e08';
    ctx.fillRect(0, 0, cv.width, cv.height);

    // Realistic Tergite Segments (Apis mellifera golden & black pattern)
    const segments = [
      { y: 0.02, h: 0.14, base: '#f5b038', mid: '#ffd56b', dark: '#b26e0e', hairs: true },
      { y: 0.16, h: 0.15, base: '#e29916', mid: '#f8c24f', dark: '#8c5208', hairs: true },
      { y: 0.31, h: 0.14, base: '#1a1209', mid: '#2c1e10', dark: '#0c0804', hairs: true },
      { y: 0.45, h: 0.14, base: '#df9212', mid: '#f7b83d', dark: '#804804', hairs: true },
      { y: 0.59, h: 0.13, base: '#160f07', mid: '#26190c', dark: '#080502', hairs: true },
      { y: 0.72, h: 0.12, base: '#c6780c', mid: '#e6981e', dark: '#683602', hairs: true },
      { y: 0.84, h: 0.15, base: '#110a05', mid: '#1c1108', dark: '#000000', hairs: false }
    ];

    segments.forEach(s => {
      const topY = s.y * cv.height;
      const heightPx = s.h * cv.height;

      // Tergite curvature gradient
      const grad = ctx.createLinearGradient(0, topY, 0, topY + heightPx);
      grad.addColorStop(0, s.dark);
      grad.addColorStop(0.15, s.base);
      grad.addColorStop(0.5, s.mid);
      grad.addColorStop(0.85, s.base);
      grad.addColorStop(1, s.dark);
      ctx.fillStyle = grad;
      ctx.fillRect(0, topY, cv.width, heightPx);

      // Fine transverse chitin growth micro-grooves
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 6; i++) {
        const lineY = topY + (heightPx * (i + 1)) / 7;
        ctx.beginPath();
        ctx.moveTo(0, lineY);
        ctx.bezierCurveTo(cv.width * 0.3, lineY - 4, cv.width * 0.7, lineY - 4, cv.width, lineY);
        ctx.stroke();
      }

      // Segment joint margin (chitin plate border)
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, topY);
      ctx.lineTo(cv.width, topY);
      ctx.stroke();

      // Delicate pale golden micro-hair fringes along segment articulation
      if (s.hairs) {
        ctx.fillStyle = 'rgba(255, 230, 160, 0.45)';
        for (let x = 0; x < cv.width; x += 3) {
          const hairLen = 6 + (Math.sin(x * 0.2) + 1) * 4;
          ctx.fillRect(x, topY + heightPx - hairLen, 1.5, hairLen);
        }
      }
    });

    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }

  // B. Forewing & Hindwing Vein Texture (1024x512 with authentic closed cells & pterostigma)
  function createHyperRealisticWingTexture() {
    const cv = document.createElement('canvas');
    cv.width = 1024;
    cv.height = 512;
    const ctx = cv.getContext('2d');

    ctx.clearRect(0, 0, cv.width, cv.height);

    // 1. Delicate pearlescent membrane with soft iridescent amber & cyan sheen
    const grad = ctx.createRadialGradient(512, 256, 20, 512, 256, 490);
    grad.addColorStop(0, 'rgba(255, 252, 240, 0.65)');
    grad.addColorStop(0.4, 'rgba(250, 232, 185, 0.42)');
    grad.addColorStop(0.75, 'rgba(215, 240, 255, 0.25)');
    grad.addColorStop(1, 'rgba(255, 235, 170, 0.12)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(512, 256, 495, 235, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Primary Costal Margin (Thick leading edge vein)
    ctx.strokeStyle = 'rgba(75, 45, 10, 0.88)';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(35, 256);
    ctx.bezierCurveTo(180, 55, 750, 40, 980, 220);
    ctx.stroke();

    // 3. Subcostal & Radial Vein Framework
    ctx.lineWidth = 4.5;
    ctx.strokeStyle = 'rgba(90, 55, 15, 0.78)';
    ctx.beginPath();
    ctx.moveTo(90, 256);
    ctx.bezierCurveTo(280, 150, 580, 110, 920, 240);
    ctx.stroke();

    // 4. Closed Cell Network (Marginal cell, submarginal cells 1-3, discal cells)
    ctx.lineWidth = 3.0;
    ctx.strokeStyle = 'rgba(105, 65, 18, 0.65)';

    // Radial sector cross-veins
    ctx.beginPath();
    ctx.moveTo(250, 160); ctx.lineTo(330, 270);
    ctx.moveTo(420, 125); ctx.lineTo(500, 260);
    ctx.moveTo(610, 110); ctx.lineTo(690, 250);
    ctx.moveTo(760, 120); ctx.lineTo(820, 230);
    ctx.stroke();

    // Median & Cubital long veins
    ctx.beginPath();
    ctx.moveTo(180, 260);
    ctx.bezierCurveTo(350, 280, 650, 300, 890, 280);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(330, 270); ctx.lineTo(440, 350);
    ctx.moveTo(500, 260); ctx.lineTo(620, 360);
    ctx.moveTo(690, 250); ctx.lineTo(790, 340);
    ctx.stroke();

    // Trailing margin branchlets
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = 'rgba(115, 70, 20, 0.45)';
    ctx.beginPath();
    ctx.moveTo(440, 350); ctx.bezierCurveTo(480, 420, 560, 440, 680, 410);
    ctx.moveTo(620, 360); ctx.lineTo(730, 410);
    ctx.moveTo(790, 340); ctx.lineTo(870, 370);
    ctx.stroke();

    // 5. Pterostigma (The prominent dark chitinous cell on leading wing edge)
    ctx.fillStyle = 'rgba(60, 35, 8, 0.95)';
    ctx.beginPath();
    ctx.moveTo(680, 85);
    ctx.lineTo(760, 95);
    ctx.lineTo(745, 120);
    ctx.lineTo(670, 110);
    ctx.closePath();
    ctx.fill();

    const tex = new THREE.CanvasTexture(cv);
    return tex;
  }

  // C. Compound Eye Ommatidia Texture (Faceted micro-hexagon pattern)
  function createHyperRealisticEyeTexture() {
    const cv = document.createElement('canvas');
    cv.width = 256;
    cv.height = 256;
    const ctx = cv.getContext('2d');

    // Deep espresso base
    ctx.fillStyle = '#080503';
    ctx.fillRect(0, 0, cv.width, cv.height);

    // Micro hexagonal facet grid
    ctx.strokeStyle = 'rgba(40, 25, 12, 0.6)';
    ctx.lineWidth = 1;
    const size = 6;
    for (let y = 0; y < cv.height; y += size * 1.5) {
      for (let x = 0; x < cv.width; x += size * 1.732) {
        ctx.strokeRect(x, y, size, size);
      }
    }

    // Specular corneal radial gradient
    const grad = ctx.createRadialGradient(80, 80, 10, 128, 128, 120);
    grad.addColorStop(0, 'rgba(80, 55, 30, 0.8)');
    grad.addColorStop(0.6, 'rgba(20, 14, 8, 0.95)');
    grad.addColorStop(1, 'rgba(4, 2, 1, 1)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cv.width, cv.height);

    const tex = new THREE.CanvasTexture(cv);
    return tex;
  }

  // Shared Master Materials
  const abdomenTex = createHyperRealisticAbdomenTexture();
  const wingTex = createHyperRealisticWingTexture();
  const eyeTex = createHyperRealisticEyeTexture();

  const darkChitinMat = new THREE.MeshStandardMaterial({
    color: 0x161009,
    roughness: 0.32,
    metalness: 0.35
  });

  const compoundEyeMat = new THREE.MeshStandardMaterial({
    map: eyeTex,
    color: 0x100a06,
    roughness: 0.1,
    metalness: 0.75
  });

  const thoraxBaseMat = new THREE.MeshStandardMaterial({
    color: 0x9e6212,
    roughness: 0.92,
    metalness: 0.08
  });

  const abdomenMat = new THREE.MeshStandardMaterial({
    map: abdomenTex,
    roughness: 0.42,
    metalness: 0.22
  });

  const wingMat = new THREE.MeshStandardMaterial({
    map: wingTex,
    transparent: true,
    opacity: 0.78,
    roughness: 0.12,
    metalness: 0.35,
    side: THREE.DoubleSide,
    depthWrite: false
  });

  const pollenMat = new THREE.MeshStandardMaterial({
    color: 0xfcb71e,
    roughness: 0.78,
    metalness: 0.04
  });

  // 4. FACTORY: ASSEMBLE HYPER-REALISTIC 3D HONEYBEE
  function createBeeModel(scaleValue, isGiant) {
    const root = new THREE.Group();
    scene.add(root);

    const body = new THREE.Group();
    root.add(body);

    // A. THORAX (Mesosoma) - Golden Velvet Plumose Setae Fuzz
    const thoraxGeo = new THREE.SphereGeometry(1.0, 32, 28);
    thoraxGeo.scale(1.08, 0.98, 1.28);
    const thoraxMesh = new THREE.Mesh(thoraxGeo, thoraxBaseMat);
    body.add(thoraxMesh);

    // Multi-layered Thorax Fur Shells (Simulates dense velvety bee fuzz)
    for (let f = 1; f <= 3; f++) {
      const fuzzGeo = new THREE.SphereGeometry(1.0 + f * 0.035, 20, 16);
      fuzzGeo.scale(1.08, 0.98, 1.28);
      const fuzzMat = new THREE.MeshStandardMaterial({
        color: f === 1 ? 0xd98a18 : 0xf5b038,
        roughness: 1.0,
        transparent: true,
        opacity: 0.38 - f * 0.08,
        wireframe: true
      });
      const fuzzMesh = new THREE.Mesh(fuzzGeo, fuzzMat);
      body.add(fuzzMesh);
    }

    // Scutellum dorsal bump (anatomic bee dorsal feature)
    const scutellumGeo = new THREE.SphereGeometry(0.38, 16, 14);
    scutellumGeo.scale(1.2, 0.6, 0.8);
    const scutellumMesh = new THREE.Mesh(scutellumGeo, darkChitinMat);
    scutellumMesh.position.set(0, 0.82, -0.4);
    body.add(scutellumMesh);

    // B. HEAD & MOUTHPARTS
    const headGroup = new THREE.Group();
    headGroup.position.set(0, -0.06, 1.48);
    body.add(headGroup);

    // Heart-shaped/triangular cranial capsule
    const headGeo = new THREE.SphereGeometry(0.74, 24, 20);
    headGeo.scale(0.88, 0.78, 0.82);
    const headMesh = new THREE.Mesh(headGeo, darkChitinMat);
    headMesh.rotation.x = 0.22;
    headGroup.add(headMesh);

    // Clypeus & Mandibles (Chewing mouthparts)
    const mandibleGeo = new THREE.ConeGeometry(0.14, 0.45, 8);
    mandibleGeo.scale(1, 1, 0.5);
    const leftMandible = new THREE.Mesh(mandibleGeo, darkChitinMat);
    leftMandible.position.set(0.12, -0.68, 0.25);
    leftMandible.rotation.set(0.4, 0, -0.3);
    headGroup.add(leftMandible);

    const rightMandible = new THREE.Mesh(mandibleGeo, darkChitinMat);
    rightMandible.position.set(-0.12, -0.68, 0.25);
    rightMandible.rotation.set(0.4, 0, 0.3);
    headGroup.add(rightMandible);

    // C. FACETED KIDNEY COMPOUND EYES
    const eyeGeo = new THREE.SphereGeometry(0.38, 20, 20);
    eyeGeo.scale(0.55, 1.18, 0.82);

    const leftEye = new THREE.Mesh(eyeGeo, compoundEyeMat);
    leftEye.position.set(0.48, 0.12, 0.12);
    leftEye.rotation.set(-0.25, 0.45, -0.35);
    headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, compoundEyeMat);
    rightEye.position.set(-0.48, 0.12, 0.12);
    rightEye.rotation.set(-0.25, -0.45, 0.35);
    headGroup.add(rightEye);

    // 3 Vertex Ocelli (Simple light-sensing eyes on crown)
    const ocellusGeo = new THREE.SphereGeometry(0.045, 8, 8);
    const ocellusMat = new THREE.MeshStandardMaterial({ color: 0xffcb45, roughness: 0.1 });
    const ocellusMid = new THREE.Mesh(ocellusGeo, ocellusMat);
    ocellusMid.position.set(0, 0.55, 0.05);
    headGroup.add(ocellusMid);

    const ocellusLeft = new THREE.Mesh(ocellusGeo, ocellusMat);
    ocellusLeft.position.set(0.09, 0.52, -0.02);
    headGroup.add(ocellusLeft);

    const ocellusRight = new THREE.Mesh(ocellusGeo, ocellusMat);
    ocellusRight.position.set(-0.09, 0.52, -0.02);
    headGroup.add(ocellusRight);

    // D. ELBOWED (GENICULATE) ANTENNAE
    const leftAntennaPivot = new THREE.Group();
    leftAntennaPivot.position.set(0.2, 0.34, 0.45);
    headGroup.add(leftAntennaPivot);

    const rightAntennaPivot = new THREE.Group();
    rightAntennaPivot.position.set(-0.2, 0.34, 0.45);
    headGroup.add(rightAntennaPivot);

    function createGeniculateAntenna() {
      const g = new THREE.Group();
      // Scape (basal stalk)
      const scapeGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.35, 8);
      scapeGeo.translate(0, 0.17, 0);
      const scape = new THREE.Mesh(scapeGeo, darkChitinMat);
      scape.rotation.x = 0.5;
      g.add(scape);

      // Flagellum (elbowed curved sensory tip)
      const curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(0, 0.3, 0.15),
        new THREE.Vector3(0.06, 0.6, 0.45),
        new THREE.Vector3(0.12, 0.8, 0.75),
        new THREE.Vector3(0.05, 0.7, 1.1)
      );
      const flagellumGeo = new THREE.TubeGeometry(curve, 16, 0.03, 8, false);
      const flagellum = new THREE.Mesh(flagellumGeo, darkChitinMat);
      g.add(flagellum);
      return g;
    }

    const leftAntenna = createGeniculateAntenna();
    leftAntennaPivot.add(leftAntenna);

    const rightAntenna = createGeniculateAntenna();
    rightAntenna.scale.x = -1;
    rightAntennaPivot.add(rightAntenna);

    // E. ABDOMEN (METASOMA) - Tapered 6 Tergites with Breathing Animation
    const abdomenGroup = new THREE.Group();
    abdomenGroup.position.set(0, -0.16, -1.15);
    body.add(abdomenGroup);

    // Petiole waist connection
    const petioleGeo = new THREE.CylinderGeometry(0.38, 0.48, 0.4, 16);
    petioleGeo.rotateX(Math.PI / 2);
    const petioleMesh = new THREE.Mesh(petioleGeo, darkChitinMat);
    petioleMesh.position.set(0, 0.05, -0.05);
    abdomenGroup.add(petioleMesh);

    // Metasoma main body
    const abdomenGeo = new THREE.SphereGeometry(1.0, 32, 28);
    abdomenGeo.scale(0.94, 0.88, 1.95);
    const abdomenMesh = new THREE.Mesh(abdomenGeo, abdomenMat);
    abdomenMesh.position.set(0, -0.12, -1.25);
    abdomenMesh.rotation.x = -0.18;
    abdomenGroup.add(abdomenMesh);

    // Realistic Sting Chamber & Stinger
    const stingerGeo = new THREE.ConeGeometry(0.075, 0.55, 10);
    const stingerMesh = new THREE.Mesh(stingerGeo, darkChitinMat);
    stingerMesh.position.set(0, -0.42, -3.2);
    stingerMesh.rotation.x = -Math.PI / 2 + 0.12;
    abdomenGroup.add(stingerMesh);

    // F. FOUR ARTICULATED TRANSLUCENT WINGS
    const leftWingPivot = new THREE.Group();
    leftWingPivot.position.set(0.52, 0.82, 0.22);
    body.add(leftWingPivot);

    const rightWingPivot = new THREE.Group();
    rightWingPivot.position.set(-0.52, 0.82, 0.22);
    body.add(rightWingPivot);

    const leftHindPivot = new THREE.Group();
    leftHindPivot.position.set(0.44, 0.74, -0.18);
    body.add(leftHindPivot);

    const rightHindPivot = new THREE.Group();
    rightHindPivot.position.set(-0.44, 0.74, -0.18);
    body.add(rightHindPivot);

    // Forewings
    const forewingGeo = new THREE.PlaneGeometry(3.1, 1.35);
    forewingGeo.translate(1.48, 0.12, 0);

    const leftForewing = new THREE.Mesh(forewingGeo, wingMat);
    leftForewing.rotation.x = Math.PI / 2;
    leftForewing.rotation.y = -0.22;
    leftWingPivot.add(leftForewing);

    const rightForewing = new THREE.Mesh(forewingGeo, wingMat);
    rightForewing.rotation.x = Math.PI / 2;
    rightForewing.rotation.y = 0.22;
    rightForewing.scale.x = -1;
    rightWingPivot.add(rightForewing);

    // Hindwings (Coupled with hamuli)
    const hindwingGeo = new THREE.PlaneGeometry(2.1, 0.95);
    hindwingGeo.translate(1.0, 0.05, 0);

    const leftHindwing = new THREE.Mesh(hindwingGeo, wingMat);
    leftHindwing.rotation.x = Math.PI / 2;
    leftHindwing.rotation.y = -0.36;
    leftHindPivot.add(leftHindwing);

    const rightHindwing = new THREE.Mesh(hindwingGeo, wingMat);
    rightHindwing.rotation.x = Math.PI / 2;
    rightHindwing.rotation.y = 0.36;
    rightHindwing.scale.x = -1;
    rightHindPivot.add(rightHindwing);

    // G. SIX JOINTED LEGS WITH CORBICULA (POLLEN BASKET)
    function createArticulatedLeg(isHind = false) {
      const legG = new THREE.Group();

      // Coxa & Trochanter (Base joint)
      const coxaGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.35, 8);
      const coxa = new THREE.Mesh(coxaGeo, darkChitinMat);
      coxa.rotation.z = 0.3;
      legG.add(coxa);

      // Femur
      const femurGeo = new THREE.CylinderGeometry(0.055, 0.045, 0.75, 8);
      femurGeo.translate(0, -0.38, 0);
      const femur = new THREE.Mesh(femurGeo, darkChitinMat);
      femur.position.set(0.08, -0.15, 0);
      legG.add(femur);

      // Tibia
      const tibiaGeo = new THREE.CylinderGeometry(0.048, 0.038, 0.95, 8);
      tibiaGeo.translate(0, -0.48, 0);
      const tibia = new THREE.Mesh(tibiaGeo, darkChitinMat);
      tibia.position.set(0.08, -0.88, 0);
      tibia.rotation.z = 0.48;
      legG.add(tibia);

      // Pollen basket (Corbicula) on Hind Leg Tibia
      if (isHind) {
        const pollenGeo = new THREE.SphereGeometry(0.22, 16, 14);
        pollenGeo.scale(0.85, 1.55, 0.95);
        const pollenMesh = new THREE.Mesh(pollenGeo, pollenMat);
        pollenMesh.position.set(0.08, -0.48, 0.03);
        tibia.add(pollenMesh);
      }

      // Tarsus (Foot segments with tiny pretarsal claws)
      const tarsusGeo = new THREE.CylinderGeometry(0.03, 0.015, 0.55, 6);
      tarsusGeo.translate(0, -0.25, 0);
      const tarsus = new THREE.Mesh(tarsusGeo, darkChitinMat);
      tarsus.position.set(0, -0.92, 0);
      tarsus.rotation.z = -0.55;
      tibia.add(tarsus);

      return legG;
    }

    // Front legs (Prothoracic)
    const legFL = createArticulatedLeg();
    legFL.position.set(0.58, -0.42, 0.68);
    legFL.rotation.set(0.22, 0, -0.52);
    body.add(legFL);

    const legFR = createArticulatedLeg();
    legFR.position.set(-0.58, -0.42, 0.68);
    legFR.rotation.set(0.22, 0, 0.52);
    legFR.scale.x = -1;
    body.add(legFR);

    // Middle legs (Mesothoracic)
    const legML = createArticulatedLeg();
    legML.position.set(0.68, -0.52, 0.05);
    legML.rotation.set(-0.2, 0, -0.62);
    body.add(legML);

    const legMR = createArticulatedLeg();
    legMR.position.set(-0.68, -0.52, 0.05);
    legMR.rotation.set(-0.2, 0, 0.62);
    legMR.scale.x = -1;
    body.add(legMR);

    // Hind legs (Metathoracic with corbicula)
    const legHL = createArticulatedLeg(true);
    legHL.position.set(0.62, -0.52, -0.65);
    legHL.rotation.set(-0.55, 0, -0.42);
    body.add(legHL);

    const legHR = createArticulatedLeg(true);
    legHR.position.set(-0.62, -0.52, -0.65);
    legHR.rotation.set(-0.55, 0, 0.42);
    legHR.scale.x = -1;
    body.add(legHR);

    root.scale.set(scaleValue, scaleValue, scaleValue);

    return {
      root,
      body,
      abdomenGroup,
      leftWingPivot,
      rightWingPivot,
      leftHindPivot,
      rightHindPivot,
      leftAntennaPivot,
      rightAntennaPivot,
      legHL,
      legHR,
      isGiant,
      scaleValue,
      pos: new THREE.Vector3(0, 0, -100),
      rot: new THREE.Euler(0, 0, 0),
      flapTime: Math.random() * 20,
      active: !isGiant
    };
  }

  // CREATE MAIN BEE + TWO GIANT BEES
  const mainBee = createBeeModel(0.72, false);
  const giantBee1 = createBeeModel(2.0, true);  // Giant Bee 1 (Realistic giant foreground swoop)
  const giantBee2 = createBeeModel(2.4, true);  // Giant Bee 2 (Dramatic massive 3D flyby)

  giantBee1.root.visible = false;
  giantBee2.root.visible = false;

  // 5. GOLDEN POLLEN SPARK PARTICLE SYSTEM
  const particleCount = 140;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleAlphas = new Float32Array(particleCount);
  const particleVelocities = [];

  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = 9999;
    particlePositions[i * 3 + 1] = 9999;
    particlePositions[i * 3 + 2] = 9999;
    particleAlphas[i] = 0.0;
    particleVelocities.push({
      x: (Math.random() - 0.5) * 0.04,
      y: (Math.random() - 0.5) * 0.04 - 0.02,
      z: (Math.random() - 0.5) * 0.04
    });
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

  const sparkCv = document.createElement('canvas');
  sparkCv.width = 64;
  sparkCv.height = 64;
  const spCtx = sparkCv.getContext('2d');
  const spGrad = spCtx.createRadialGradient(32, 32, 0, 32, 32, 30);
  spGrad.addColorStop(0, 'rgba(255, 238, 160, 1.0)');
  spGrad.addColorStop(0.35, 'rgba(245, 176, 56, 0.88)');
  spGrad.addColorStop(0.7, 'rgba(217, 119, 6, 0.35)');
  spGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  spCtx.fillStyle = spGrad;
  spCtx.fillRect(0, 0, 64, 64);

  const particleMat = new THREE.PointsMaterial({
    map: new THREE.CanvasTexture(sparkCv),
    size: 0.75,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particleSystem = new THREE.Points(particleGeo, particleMat);
  scene.add(particleSystem);

  let particleIndex = 0;

  function spawnPollenParticle(x, y, z, sizeMultiplier = 1.0) {
    const idx = particleIndex;
    particlePositions[idx * 3] = x + (Math.random() - 0.5) * 0.5 * sizeMultiplier;
    particlePositions[idx * 3 + 1] = y - 0.25 * sizeMultiplier + (Math.random() - 0.5) * 0.4 * sizeMultiplier;
    particlePositions[idx * 3 + 2] = z - 0.5 * sizeMultiplier + (Math.random() - 0.5) * 0.5 * sizeMultiplier;
    particleAlphas[idx] = 1.0;
    particleIndex = (particleIndex + 1) % particleCount;
  }

  // 6. SCROLL DYNAMICS & CORRIDOR FLIGHT CONTROLLER
  let currentScrollRatio = 0;
  let targetScrollRatio = 0;
  let scrollVelocity = 0;
  let lastScrollY = window.scrollY;

  const aspect = width / height;
  const vHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
  const vWidth = vHeight * aspect;

  const currentPos = new THREE.Vector3(vWidth * 0.32, vHeight * 0.22, 0);
  const targetPos = new THREE.Vector3(vWidth * 0.32, vHeight * 0.22, 0);
  const currentRot = new THREE.Euler(0, -Math.PI / 6, 0);

  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0, active: false };
  window.addEventListener('mousemove', (e) => {
    mouse.targetX = (e.clientX / width) * 2 - 1;
    mouse.targetY = -(e.clientY / height) * 2 + 1;
    mouse.active = true;
  });

  function getFlightPathForScroll(ratio) {
    const t = ratio * Math.PI * 4;
    const x = Math.sin(t * 0.75) * (vWidth * 0.38) + Math.cos(t * 0.35) * (vWidth * 0.1);
    const y = Math.cos(t * 0.6) * (vHeight * 0.35) - (ratio - 0.5) * (vHeight * 0.25);
    const z = Math.sin(t * 1.1) * 3.5;
    return { x, y, z };
  }

  // Interactive Barrel Roll on Click
  let barrelRollProgress = 0;
  let isRolling = false;

  window.addEventListener('click', (e) => {
    const screenPos = currentPos.clone().project(camera);
    const beeScreenX = ((screenPos.x + 1) * width) / 2;
    const beeScreenY = ((-screenPos.y + 1) * height) / 2;

    const dx = e.clientX - beeScreenX;
    const dy = e.clientY - beeScreenY;
    const dist = Math.hypot(dx, dy);

    if (dist < 130 && !isRolling) {
      triggerAcrobaticRoll();
    }
  });

  function triggerAcrobaticRoll() {
    isRolling = true;
    barrelRollProgress = 0;

    for (let k = 0; k < 25; k++) {
      spawnPollenParticle(currentPos.x, currentPos.y, currentPos.z, 1.2);
    }

    if (window.playTshBeep) {
      window.playTshBeep(880, 0.08);
      setTimeout(() => { if (window.playTshBeep) window.playTshBeep(1200, 0.05); }, 90);
    }
  }

  // 7. WEBAUDIO FLIGHT BUZZ & DOPPLER GLIDE
  let audioCtx = null;
  let flightOsc = null;
  let flightGain = null;
  let giantOsc = null;
  let giantGain = null;

  function initFlightAudio() {
    try {
      if (flightGain && flightOsc) {
        if (audioCtx && audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
        return;
      }

      if (window.tshSharedAudioCtx) {
        audioCtx = window.tshSharedAudioCtx;
      } else {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        audioCtx = new AudioContext();
        window.tshSharedAudioCtx = audioCtx;
      }

      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      flightOsc = audioCtx.createOscillator();
      flightOsc.type = 'sawtooth';
      flightOsc.frequency.setValueAtTime(140, audioCtx.currentTime);

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, audioCtx.currentTime);

      flightGain = audioCtx.createGain();
      // Start with comfortable baseline so sound plays automatically as soon as context unlocks
      flightGain.gain.setValueAtTime(0.014, audioCtx.currentTime);

      flightOsc.connect(filter);
      filter.connect(flightGain);
      flightGain.connect(audioCtx.destination);
      flightOsc.start();

      giantOsc = audioCtx.createOscillator();
      giantOsc.type = 'triangle';
      giantOsc.frequency.setValueAtTime(85, audioCtx.currentTime);

      const giantFilter = audioCtx.createBiquadFilter();
      giantFilter.type = 'lowpass';
      giantFilter.frequency.setValueAtTime(240, audioCtx.currentTime);

      giantGain = audioCtx.createGain();
      giantGain.gain.setValueAtTime(0.0001, audioCtx.currentTime);

      giantOsc.connect(giantFilter);
      giantFilter.connect(giantGain);
      giantGain.connect(audioCtx.destination);
      giantOsc.start();
    } catch (err) {
      // Audio policy handled silently
    }
  }

  function updateFlightAudio(speed, giantSpeed, giantDist) {
    if (!audioCtx) return;
    const isMuted = document.body.classList.contains('tsh-sound-muted');
    if (isMuted || audioCtx.state !== 'running') {
      if (flightGain) flightGain.gain.setTargetAtTime(0.00001, audioCtx.currentTime, 0.05);
      if (giantGain) giantGain.gain.setTargetAtTime(0.00001, audioCtx.currentTime, 0.05);
      return;
    }

    if (flightGain) {
      const targetVol = Math.min(0.014 + speed * 0.045, 0.045);
      flightGain.gain.setTargetAtTime(targetVol, audioCtx.currentTime, 0.05);
      if (flightOsc) {
        flightOsc.frequency.setTargetAtTime(140 + speed * 85, audioCtx.currentTime, 0.05);
      }
    }

    if (giantGain && giantSpeed > 0.01) {
      const prox = Math.max(0, 1 - giantDist / 30);
      const giantTargetVol = Math.min(0.05 * prox, 0.048);
      giantGain.gain.setTargetAtTime(giantTargetVol, audioCtx.currentTime, 0.08);
      if (giantOsc) {
        const dopplerFreq = 80 + (1 - giantDist / 25) * 60;
        giantOsc.frequency.setTargetAtTime(dopplerFreq, audioCtx.currentTime, 0.08);
      }
    } else if (giantGain) {
      giantGain.gain.setTargetAtTime(0.00001, audioCtx.currentTime, 0.1);
    }
  }

  function startBeeAudio() {
    initFlightAudio();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    const isMuted = document.body.classList.contains('tsh-sound-muted');
    if (!isMuted && flightGain) {
      flightGain.gain.cancelScheduledValues(audioCtx.currentTime);
      flightGain.gain.setValueAtTime(0.024, audioCtx.currentTime);
      if (flightOsc) {
        flightOsc.frequency.setValueAtTime(155, audioCtx.currentTime);
      }
    }
  }
  window.startBeeAudio = startBeeAudio;

  // Trigger bee flight acoustics the exact instant the site reveals
  window.addEventListener('tsh-site-revealed', startBeeAudio);

  // Eagerly unlock & initialize sound on site reveal and user interactions
  window.addEventListener('load', initFlightAudio);
  window.addEventListener('pointerdown', startBeeAudio);
  window.addEventListener('scroll', startBeeAudio, { passive: true });
  window.addEventListener('mousemove', startBeeAudio, { once: true });
  window.addEventListener('touchstart', startBeeAudio, { once: true });
  window.addEventListener('keydown', startBeeAudio, { once: true });

  // 8. TWO GIANT BEES PERIODIC FLYBY SCHEDULER (Every ~20 seconds)
  let activeGiant = null;
  let giantProgress = 0;
  let giantDuration = 4.2;
  let giantPathIndex = 0;
  let timeUntilNextGiant = 8.0;

  function getGiantBezierPoint(t, pathId) {
    let p0, p1, p2, p3;

    if (pathId === 0) {
      // Path 0: High-Speed Top-Left to Bottom-Right Swoop
      p0 = new THREE.Vector3(-vWidth * 0.85, vHeight * 0.65, 4);
      p1 = new THREE.Vector3(-vWidth * 0.25, vHeight * 0.15, 12);
      p2 = new THREE.Vector3(vWidth * 0.2, -vHeight * 0.35, 14);
      p3 = new THREE.Vector3(vWidth * 0.95, -vHeight * 0.85, -2);
    } else {
      // Path 1: Giant Foreground Climb & Barrel Arc from Bottom-Right to Top-Left
      p0 = new THREE.Vector3(vWidth * 0.9, -vHeight * 0.7, 6);
      p1 = new THREE.Vector3(vWidth * 0.15, -vHeight * 0.1, 14);
      p2 = new THREE.Vector3(-vWidth * 0.3, vHeight * 0.35, 13);
      p3 = new THREE.Vector3(-vWidth * 0.95, vHeight * 0.9, 2);
    }

    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;

    const pt = new THREE.Vector3();
    pt.addScaledVector(p0, uuu);
    pt.addScaledVector(p1, 3 * uu * t);
    pt.addScaledVector(p2, 3 * u * tt);
    pt.addScaledVector(p3, ttt);

    const dpt = new THREE.Vector3();
    const d0 = p1.clone().sub(p0).multiplyScalar(3 * uu);
    const d1 = p2.clone().sub(p1).multiplyScalar(6 * u * t);
    const d2 = p3.clone().sub(p2).multiplyScalar(3 * tt);
    dpt.add(d0).add(d1).add(d2);

    return { pos: pt, tangent: dpt.normalize() };
  }

  function launchGiantFlyby() {
    giantPathIndex = (giantPathIndex + 1) % 2;
    activeGiant = giantPathIndex === 0 ? giantBee1 : giantBee2;

    activeGiant.root.visible = true;
    giantProgress = 0;
    giantDuration = 3.8 + Math.random() * 0.8;
    timeUntilNextGiant = 19 + Math.random() * 5;
  }

  // 9. ANIMATION RENDER LOOP (60 FPS)
  const clock = new THREE.Clock();
  let mainFlapTime = 0;
  let particleSpawnTimer = 0;

  function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.1);
    const elapsedTime = clock.getElapsedTime();

    // ==========================================
    // A. MAIN SCROLL-FOLLOWING BEE DYNAMICS
    // ==========================================
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const targetRatio = window.scrollY / maxScroll;
    targetScrollRatio = targetRatio;

    currentScrollRatio += (targetScrollRatio - currentScrollRatio) * 0.06;

    const currentScrollY = window.scrollY;
    const rawVel = Math.abs(currentScrollY - lastScrollY);
    scrollVelocity += (rawVel - scrollVelocity) * 0.12;
    lastScrollY = currentScrollY;

    const pathPoint = getFlightPathForScroll(currentScrollRatio);

    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;
    const mouseNudgeX = mouse.x * (vWidth * 0.12);
    const mouseNudgeY = mouse.y * (vHeight * 0.12);

    targetPos.x = pathPoint.x + mouseNudgeX * 0.35;
    targetPos.y = pathPoint.y + mouseNudgeY * 0.35;
    targetPos.z = pathPoint.z;

    const hoverTime = elapsedTime * 2.2;
    const hoverX = Math.sin(hoverTime) * 0.35;
    const hoverY = Math.sin(hoverTime * 2.0) * 0.28;
    const hoverZ = Math.cos(hoverTime * 1.5) * 0.2;

    const destX = targetPos.x + hoverX;
    const destY = targetPos.y + hoverY;
    const destZ = targetPos.z + hoverZ;

    const vx = destX - currentPos.x;
    const vy = destY - currentPos.y;
    const vz = destZ - currentPos.z;

    const lerpRate = 0.055 + Math.min(scrollVelocity * 0.002, 0.08);
    currentPos.x += vx * lerpRate;
    currentPos.y += vy * lerpRate;
    currentPos.z += vz * lerpRate;

    mainBee.root.position.copy(currentPos);

    const speed = Math.hypot(vx, vy, vz);
    let targetYaw = Math.atan2(vx, vz + 0.01);
    let targetPitch = -Math.atan2(vy, Math.hypot(vx, vz) + 0.1) * 0.75;
    let targetRoll = -vx * 0.45;

    targetYaw += Math.sin(elapsedTime * 1.4) * 0.2;
    targetPitch += Math.sin(elapsedTime * 2.0) * 0.1;

    if (isRolling) {
      barrelRollProgress += delta * 4.5;
      targetRoll += barrelRollProgress * Math.PI * 2;
      targetPitch += Math.sin(barrelRollProgress * Math.PI * 2) * 0.6;
      if (barrelRollProgress >= 1.0) {
        isRolling = false;
        barrelRollProgress = 0;
      }
    }

    currentRot.y += (targetYaw - currentRot.y) * 0.08;
    currentRot.x += (targetPitch - currentRot.x) * 0.08;
    currentRot.z += (targetRoll - currentRot.z) * 0.08;

    mainBee.root.rotation.set(currentRot.x, currentRot.y, currentRot.z);

    // Hyper-realistic wing stroke plane (flapping + pitching flutter)
    const mainFlapFreq = 52 + Math.min(speed * 32 + scrollVelocity * 0.2, 48);
    mainFlapTime += delta * mainFlapFreq;
    const mainFlapAngle = Math.sin(mainFlapTime) * 0.72;
    const mainWingTwist = Math.cos(mainFlapTime) * 0.28;

    mainBee.leftWingPivot.rotation.z = mainFlapAngle;
    mainBee.leftWingPivot.rotation.y = -0.3 + mainWingTwist;
    mainBee.rightWingPivot.rotation.z = -mainFlapAngle;
    mainBee.rightWingPivot.rotation.y = 0.3 - mainWingTwist;
    mainBee.leftHindPivot.rotation.z = mainFlapAngle * 0.88 + 0.1;
    mainBee.rightHindPivot.rotation.z = -mainFlapAngle * 0.88 - 0.1;

    // Abdominal respiration & antenna micro-twitching
    const breath = 1.0 + Math.sin(elapsedTime * 4.5) * 0.038;
    mainBee.abdomenGroup.scale.set(breath, breath, 1.0 + Math.sin(elapsedTime * 4.5) * 0.022);
    mainBee.leftAntennaPivot.rotation.x = Math.sin(elapsedTime * 7.5) * 0.14;
    mainBee.rightAntennaPivot.rotation.x = Math.sin(elapsedTime * 8.2 + 0.4) * 0.14;

    const legSway = Math.sin(elapsedTime * 6.0) * 0.06 - speed * 0.16;
    mainBee.legHL.rotation.x = -0.55 + legSway;
    mainBee.legHR.rotation.x = -0.55 + legSway;

    // ==========================================
    // B. TWO GIANT BEES FLYBY SYSTEM (Every ~20s)
    // ==========================================
    let giantSpeed = 0;
    let giantDist = 99;

    if (!activeGiant) {
      timeUntilNextGiant -= delta;
      if (timeUntilNextGiant <= 0) {
        launchGiantFlyby();
      }
    } else {
      giantProgress += delta / giantDuration;
      const flyData = getGiantBezierPoint(Math.min(giantProgress, 1.0), giantPathIndex);

      activeGiant.root.position.copy(flyData.pos);

      const tVec = flyData.tangent;
      const gYaw = Math.atan2(tVec.x, tVec.z + 0.01);
      const gPitch = -Math.atan2(tVec.y, Math.hypot(tVec.x, tVec.z) + 0.01);
      const gRoll = -tVec.x * 0.92;

      activeGiant.root.rotation.set(gPitch, gYaw, gRoll);

      activeGiant.flapTime += delta * 82;
      const gFlapAngle = Math.sin(activeGiant.flapTime) * 0.78;
      const gWingTwist = Math.cos(activeGiant.flapTime) * 0.32;

      activeGiant.leftWingPivot.rotation.z = gFlapAngle;
      activeGiant.leftWingPivot.rotation.y = -0.3 + gWingTwist;
      activeGiant.rightWingPivot.rotation.z = -gFlapAngle;
      activeGiant.rightWingPivot.rotation.y = 0.3 - gWingTwist;
      activeGiant.leftHindPivot.rotation.z = gFlapAngle * 0.88;
      activeGiant.rightHindPivot.rotation.z = -gFlapAngle * 0.88;

      spawnPollenParticle(flyData.pos.x, flyData.pos.y, flyData.pos.z, 2.2);
      spawnPollenParticle(flyData.pos.x, flyData.pos.y, flyData.pos.z, 2.5);

      giantSpeed = 1.0;
      giantDist = camera.position.distanceTo(flyData.pos);

      if (giantProgress >= 1.0) {
        activeGiant.root.visible = false;
        activeGiant = null;
      }
    }

    // ==========================================
    // C. POLLEN PARTICLES EMISSION & UPDATE
    // ==========================================
    particleSpawnTimer += delta;
    if (particleSpawnTimer > 0.045 && (speed > 0.05 || Math.random() < 0.25)) {
      spawnPollenParticle(currentPos.x, currentPos.y, currentPos.z, 1.0);
      particleSpawnTimer = 0;
    }

    const pArr = particlePositions;
    for (let i = 0; i < particleCount; i++) {
      if (particleAlphas[i] > 0.01) {
        pArr[i * 3] += particleVelocities[i].x;
        pArr[i * 3 + 1] += particleVelocities[i].y;
        pArr[i * 3 + 2] += particleVelocities[i].z;
        particleAlphas[i] -= delta * 0.8;
      } else {
        pArr[i * 3] = 9999;
      }
    }
    particleGeo.attributes.position.needsUpdate = true;

    // ==========================================
    // D. AUDIO SYNCHRONIZATION
    // ==========================================
    updateFlightAudio(speed, giantSpeed, giantDist);

    // ==========================================
    // E. RENDER
    // ==========================================
    renderer.render(scene, camera);
  }

  // 10. WINDOW RESIZE HANDLER
  window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });

  animate();
})();
