/**
 * Tri State Honey - Hyper-Realistic 3D Honeycomb Fracture & Viscous Honey Drip Opening Engine
 * Built with Three.js (Procedural Wax Prisms, Amber Fluid Physics, Refraction Shaders)
 *
 * Sequence:
 *  0% - 65%: The camera zooms in on a golden, wax-capped natural honeycomb wall.
 *            Thick, viscous liquid honey swells and oozes from hexagonal cells, forming dripping droplets.
 *  65% - 85%: Stress fractures spiderweb across the comb center; the honeycomb bursts and splits apart 
 *            down the middle along an organic fault line.
 *  85% - 100%: The two halves swing outward into 3D camera space, dissolving amidst glowing honey spray, 
 *             seamlessly revealing the live website!
 */
(function () {
  'use strict';

  function dismissOverlayDirectly() {
    const ov = document.getElementById('tshLoaderOverlay');
    if (ov && !ov.classList.contains('is-loaded')) {
      ov.classList.add('is-loaded');
      setTimeout(() => {
        ov.style.display = 'none';
      }, 700);
      try {
        window.dispatchEvent(new CustomEvent('tsh-site-revealed'));
        if (typeof window.startBeeAudio === 'function') {
          window.startBeeAudio();
        }
      } catch (e) {}
    }
  }

  // Global failsafe: Under any circumstance, dismiss after 3.2s
  setTimeout(dismissOverlayDirectly, 3200);

  // Early bind skip button so it works immediately even before 3D loads
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('tshLoaderSkip');
    if (btn) btn.addEventListener('click', dismissOverlayDirectly);
  });

  let threeAttempts = 0;

  // Wait until DOM and Three.js are available
  function init() {
    const overlay = document.getElementById('tshLoaderOverlay');
    if (typeof THREE === 'undefined') {
      threeAttempts++;
      if (threeAttempts > 30) {
        dismissOverlayDirectly();
        return;
      }
      setTimeout(init, 50);
      return;
    }

    const canvas = document.getElementById('tshLoaderCanvas');
    const pctEl = document.getElementById('tshLoaderPct');
    const fillEl = document.getElementById('tshLoaderFill');
    const labelEl = document.getElementById('tshLoaderLabel');
    const skipBtn = document.getElementById('tshLoaderSkip');

    if (!overlay || !canvas) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const isMobile = width < 768;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 10);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: !isMobile,
        powerPreference: 'high-performance'
      });
    } catch (e) {
      dismissOverlayDirectly();
      return;
    }

    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      dismissOverlayDirectly();
    }, false);

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    // 2. Dynamic Lighting (Gilded backlights, caustics & amber speculars)
    const ambientLight = new THREE.AmbientLight(0xfff5dc, 1.4);
    scene.add(ambientLight);

    const keySun = new THREE.DirectionalLight(0xfffaea, 3.2);
    keySun.position.set(6, 9, 8);
    scene.add(keySun);

    const honeyRim = new THREE.PointLight(0xffaa1d, 4.0, 30);
    honeyRim.position.set(-5, -2, 4);
    scene.add(honeyRim);

    const backGlow = new THREE.PointLight(0xffd56b, 5.0, 25);
    backGlow.position.set(0, 0, -2);
    scene.add(backGlow);

    // 3. Procedural Natural Beeswax & Raw Liquid Honey Textures (Organic honeycomb comb wall)
    function createNaturalWaxTexture() {
      const cv = document.createElement('canvas');
      cv.width = 512;
      cv.height = 512;
      const ctx = cv.getContext('2d');

      // Base warm beeswax amber
      const grad = ctx.createLinearGradient(0, 0, 512, 512);
      grad.addColorStop(0, '#e8aa28');
      grad.addColorStop(0.5, '#c98212');
      grad.addColorStop(1, '#9e5a06');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Organic wax crystalline micro-grain texture
      ctx.fillStyle = 'rgba(255, 230, 140, 0.12)';
      for (let i = 0; i < 1800; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const r = Math.random() * 2.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = 'rgba(70, 35, 5, 0.15)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * 512, Math.random() * 512);
        ctx.lineTo(Math.random() * 512, Math.random() * 512);
        ctx.stroke();
      }

      return new THREE.CanvasTexture(cv);
    }

    function createHoneyTexture() {
      const cv = document.createElement('canvas');
      cv.width = 512;
      cv.height = 512;
      const ctx = cv.getContext('2d');

      const grad = ctx.createRadialGradient(256, 256, 15, 256, 256, 250);
      grad.addColorStop(0, '#fff1a8');
      grad.addColorStop(0.25, '#f5b038');
      grad.addColorStop(0.65, '#c8780c');
      grad.addColorStop(1, '#522e03');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Micro air bubbles suspended in golden honey
      for (let i = 0; i < 60; i++) {
        const bx = Math.random() * 512;
        const by = Math.random() * 512;
        const br = 1.5 + Math.random() * 5.5;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 220, 100, 0.45)';
        ctx.beginPath();
        ctx.arc(bx + 1, by + 1, br * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      return new THREE.CanvasTexture(cv);
    }

    const waxTex = createNaturalWaxTexture();
    const honeyTex = createHoneyTexture();

    // 4. Materials
    const waxMaterial = new THREE.MeshStandardMaterial({
      color: 0xdeb038,
      map: waxTex,
      roughness: 0.58,
      metalness: 0.12,
      bumpScale: 0.08
    });

    const honeyLiquidMat = isMobile
      ? new THREE.MeshStandardMaterial({
          color: 0xf5b038,
          roughness: 0.15,
          metalness: 0.12,
          map: honeyTex,
          transparent: true,
          opacity: 0.94
        })
      : new THREE.MeshPhysicalMaterial({
          color: 0xf5b038,
          emissive: 0x4a2a04,
          roughness: 0.06,
          metalness: 0.08,
          transmission: 0.75,
          ior: 1.53, // Honey refractive index ~1.50 - 1.54
          thickness: 2.2,
          map: honeyTex,
          transparent: true,
          opacity: 0.96
        });

    // 5. Build Hexagonal Honeycomb Clusters (Left Half & Right Half)
    const combRoot = new THREE.Group();
    scene.add(combRoot);

    const leftCombHalf = new THREE.Group();
    const rightCombHalf = new THREE.Group();
    combRoot.add(leftCombHalf);
    combRoot.add(rightCombHalf);

    // Natural Hexagon Prism Geometry with organic soft beveling
    function createHexPrismGeometry(radius, depth) {
      const shape = new THREE.Shape();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      }
      shape.closePath();

      return new THREE.ExtrudeGeometry(shape, {
        depth: depth,
        bevelEnabled: true,
        bevelSegments: 4,
        steps: 1,
        bevelSize: 0.05,
        bevelThickness: 0.05
      });
    }

    const hexRadius = 0.58;
    const hexDepth = 0.95;
    const hexGeo = createHexPrismGeometry(hexRadius, hexDepth);
    const innerHoneyGeo = createHexPrismGeometry(hexRadius * 0.88, hexDepth * 0.94);

    const cols = 11;
    const rows = 9;
    const dx = hexRadius * 1.732;
    const dy = hexRadius * 1.5;

    // Build the grid of comb cells with organic natural edge variation
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const posX = (c - (cols - 1) / 2) * dx + ((r % 2) * dx) / 2;
        const posY = (r - (rows - 1) / 2) * dy;

        // Skip outer periphery for an authentic natural bee-comb lobe shape
        if (Math.hypot(posX * 0.85, posY) > 4.6) continue;

        // Outer Wax Chamber
        const waxMesh = new THREE.Mesh(hexGeo, waxMaterial);
        waxMesh.position.set(posX, posY, -hexDepth / 2);

        // Inner Liquid Honey Fill
        const honeyMesh = new THREE.Mesh(innerHoneyGeo, honeyLiquidMat);
        honeyMesh.position.set(posX, posY, -hexDepth / 2 + 0.06);

        // Split cells strictly into Left or Right half along x=0 center fracture line
        if (posX < 0) {
          leftCombHalf.add(waxMesh);
          leftCombHalf.add(honeyMesh);
        } else {
          rightCombHalf.add(waxMesh);
          rightCombHalf.add(honeyMesh);
        }
      }
    }

    // 6. Viscous Honey Dripping Droplets (3D organic teardrops & beads)
    const dripCount = 18;
    const drips = [];
    const sphereGeo = new THREE.SphereGeometry(1, 24, 20);

    for (let i = 0; i < dripCount; i++) {
      const dripMesh = new THREE.Mesh(sphereGeo, honeyLiquidMat);
      const startX = (Math.random() - 0.5) * 5.5;
      const startY = (Math.random() - 0.5) * 3.0 + 0.6;
      const baseScale = 0.14 + Math.random() * 0.22;

      dripMesh.scale.set(baseScale, baseScale * 1.8, baseScale);
      dripMesh.position.set(startX, startY, 0.48);
      scene.add(dripMesh);

      drips.push({
        mesh: dripMesh,
        x: startX,
        y: startY,
        baseScale: baseScale,
        speed: 0.016 + Math.random() * 0.032,
        stretch: 1.0,
        phase: Math.random() * Math.PI * 2
      });
    }

    // 7. Golden Amber Burst Particles (released when the comb fractures)
    const pCount = 120;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(pCount * 3);
    const pVelocities = [];

    for (let i = 0; i < pCount; i++) {
      pPositions[i * 3] = 9999;
      pPositions[i * 3 + 1] = 9999;
      pPositions[i * 3 + 2] = 9999;
      pVelocities.push(new THREE.Vector3());
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));

    const pMat = new THREE.PointsMaterial({
      color: 0xffd56b,
      size: 0.45,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });

    const burstParticles = new THREE.Points(pGeo, pMat);
    scene.add(burstParticles);

    let particlesTriggered = false;
    function triggerBurst() {
      if (particlesTriggered) return;
      particlesTriggered = true;

      const pArr = pPositions;
      for (let i = 0; i < pCount; i++) {
        pArr[i * 3] = (Math.random() - 0.5) * 0.8;
        pArr[i * 3 + 1] = (Math.random() - 0.5) * 4.2;
        pArr[i * 3 + 2] = 0.5 + Math.random() * 0.5;

        const dir = (pArr[i * 3] > 0 ? 1 : -1) * (0.09 + Math.random() * 0.16);
        pVelocities[i].set(dir, (Math.random() - 0.5) * 0.12, (Math.random() - 0.5) * 0.12);
      }
      pGeo.attributes.position.needsUpdate = true;

      if (window.playTshBeep) {
        window.playTshBeep(520, 0.12);
        setTimeout(() => window.playTshBeep && window.playTshBeep(880, 0.08), 90);
      }
    }

    // 8. Progress and Fracture Sequence Controller
    let progress = 0;
    let isComplete = false;
    const totalDuration = 2.8;
    let elapsed = 0;
    const clock = new THREE.Clock();

    function finishLoader() {
      if (isComplete) return;
      isComplete = true;

      overlay.classList.add('is-loaded');
      try {
        window.dispatchEvent(new CustomEvent('tsh-site-revealed'));
        if (typeof window.startBeeAudio === 'function') {
          window.startBeeAudio();
        }
      } catch (e) {}

      // Clean up loader WebGL resources immediately to free GPU memory for main page & bee
      try {
        if (renderer) {
          renderer.forceContextLoss();
          renderer.dispose();
        }
        if (canvas && canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
      } catch (e) {}

      setTimeout(() => {
        overlay.style.display = 'none';
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 700);
    }

    if (skipBtn) {
      skipBtn.addEventListener('click', finishLoader);
    }

    // Safety fallback: Guarantee loading screen dismisses even if WebGL or rendering stalls
    setTimeout(finishLoader, 3400);

    // 9. Main Animation Loop
    function animate() {
      if (!isComplete) {
        requestAnimationFrame(animate);
      }

      const delta = Math.min(clock.getDelta(), 0.05);
      elapsed += delta;

      let normTime = Math.min(elapsed / totalDuration, 1.0);
      progress = normTime;

      const pctDisplay = Math.min(Math.round(progress * 100), 100);
      if (pctEl) pctEl.textContent = pctDisplay + '%';
      if (fillEl) fillEl.style.width = pctDisplay + '%';

      if (normTime < 0.35 && labelEl) {
        labelEl.textContent = 'Harmonizing Floral Reserves...';
      } else if (normTime < 0.65 && labelEl) {
        labelEl.textContent = 'Pressurizing Honeycomb Cavities...';
      } else if (normTime < 0.85 && labelEl) {
        labelEl.textContent = 'Fracturing Comb Architecture...';
      } else if (labelEl) {
        labelEl.textContent = 'Pure Liquid Gold Unveiled';
      }

      // 3D Camera zooms close to the natural honeycomb wall
      camera.position.z = 10 - normTime * 3.4;

      combRoot.rotation.y = Math.sin(elapsed * 1.5) * 0.06;
      combRoot.rotation.x = Math.cos(elapsed * 1.2) * 0.04;

      // Honey Drip Drops
      drips.forEach((d) => {
        d.phase += delta * 4;
        d.y -= d.speed * (1 + normTime * 3.5);
        d.stretch = 1.0 + Math.sin(d.phase) * 0.35 + d.speed * 20;

        d.mesh.scale.set(d.baseScale, d.baseScale * d.stretch, d.baseScale);
        d.mesh.position.y = d.y;

        if (d.y < -4.5) {
          d.y = 3.5 + Math.random() * 0.5;
        }
      });

      // 10. THE FRACTURE & BREAK OPEN EFFECT (65% - 100%)
      if (normTime >= 0.65) {
        triggerBurst();

        const fractureProg = (normTime - 0.65) / 0.35;
        const easeFracture = Math.pow(fractureProg, 2.2);

        // Left Half slides left and swings open outward
        leftCombHalf.position.x = -easeFracture * 7.5;
        leftCombHalf.position.z = easeFracture * 2.0;
        leftCombHalf.rotation.y = -easeFracture * 1.1;

        // Right Half slides right and swings open outward
        rightCombHalf.position.x = easeFracture * 7.5;
        rightCombHalf.position.z = easeFracture * 2.0;
        rightCombHalf.rotation.y = easeFracture * 1.1;

        honeyLiquidMat.opacity = Math.max(0, 0.96 - fractureProg * 1.2);
        waxMaterial.opacity = Math.max(0, 1.0 - fractureProg * 1.2);
        waxMaterial.transparent = true;
      }

      if (particlesTriggered) {
        const pArr = pPositions;
        for (let i = 0; i < pCount; i++) {
          pArr[i * 3] += pVelocities[i].x;
          pArr[i * 3 + 1] += pVelocities[i].y;
          pArr[i * 3 + 2] += pVelocities[i].z;
          pVelocities[i].y -= 0.003;
        }
        pGeo.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);

      if (normTime >= 1.0) {
        finishLoader();
      }
    }

    animate();

    window.addEventListener('resize', () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

