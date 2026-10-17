/**
 * hero3d.js — Three.js hero scene
 * Floating geometric mesh + particle cloud
 * Optimized: low-poly, instanced where possible
 */

class HeroScene {
  constructor(canvasEl) {
    this.canvas = canvasEl;
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.clock = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.meshGroup = null;
    this.particles = null;
    this.wireframe = null;
    this.animId = null;
    this.isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.init();
  }

  init() {
    if (!window.THREE) return;
    const THREE = window.THREE;

    // Clock
    this.clock = new THREE.Clock();

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      55,
      this.canvas.clientWidth / this.canvas.clientHeight,
      0.1,
      200
    );
    this.camera.position.set(0, 0, 7);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.setClearColor(0x000000, 0);

    // Fog
    this.scene.fog = new THREE.FogExp2(0x0c0c0e, 0.04);

    // Build scene objects
    this.meshGroup = new THREE.Group();
    this.scene.add(this.meshGroup);

    this._createGeometricMeshes();
    this._createParticleCloud();
    this._createWireframeSphere();

    // Lighting
    const ambient = new THREE.AmbientLight(0x1a1a22, 1);
    this.scene.add(ambient);

    const pointLight1 = new THREE.PointLight(0xC8A96E, 12, 20);
    pointLight1.position.set(4, 3, 3);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x4466aa, 6, 15);
    pointLight2.position.set(-4, -2, 2);
    this.scene.add(pointLight2);

    // Events
    window.addEventListener('mousemove', this._onMouseMove.bind(this));
    window.addEventListener('resize', this._onResize.bind(this));

    this._animate();
  }

  _createGeometricMeshes() {
    const THREE = window.THREE;

    // Central icosahedron
    const icoGeo = new THREE.IcosahedronGeometry(1.4, 1);
    const icoMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a22,
      metalness: 0.85,
      roughness: 0.25,
      wireframe: false,
    });
    this.icosahedron = new THREE.Mesh(icoGeo, icoMat);
    this.icosahedron.position.set(2.2, -0.3, -1);
    this.meshGroup.add(this.icosahedron);

    // Wireframe over icosahedron
    const icoWireGeo = new THREE.IcosahedronGeometry(1.42, 1);
    const icoWireMat = new THREE.MeshBasicMaterial({
      color: 0xC8A96E,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    this.icoWire = new THREE.Mesh(icoWireGeo, icoWireMat);
    this.icoWire.position.copy(this.icosahedron.position);
    this.meshGroup.add(this.icoWire);

    // Torus knot — smaller, accent
    const torusGeo = new THREE.TorusKnotGeometry(0.55, 0.16, 80, 14, 2, 3);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0xC8A96E,
      metalness: 0.9,
      roughness: 0.15,
      emissive: 0x3a2a10,
      emissiveIntensity: 0.4,
    });
    this.torusKnot = new THREE.Mesh(torusGeo, torusMat);
    this.torusKnot.position.set(-2.4, 1.2, -0.5);
    this.meshGroup.add(this.torusKnot);

    // Octahedron — upper right
    const octaGeo = new THREE.OctahedronGeometry(0.6, 0);
    const octaMat = new THREE.MeshStandardMaterial({
      color: 0x242430,
      metalness: 0.7,
      roughness: 0.3,
      wireframe: false,
    });
    this.octahedron = new THREE.Mesh(octaGeo, octaMat);
    this.octahedron.position.set(-1.2, -2.0, 0.5);
    this.meshGroup.add(this.octahedron);

    // Small floating cubes
    const cubeGeo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
    const cubeMat = new THREE.MeshStandardMaterial({
      color: 0xC8A96E,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.7,
    });

    const cubePositions = [
      [1.0, 2.2, 0.5],
      [-2.8, -0.5, 0.2],
      [3.0, 1.5, -1.2],
      [-0.5, -2.8, 0.8],
      [2.5, -2.0, -0.3],
    ];

    this.cubes = cubePositions.map(([x, y, z]) => {
      const c = new THREE.Mesh(cubeGeo, cubeMat);
      c.position.set(x, y, z);
      c.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      this.meshGroup.add(c);
      return c;
    });
  }

  _createParticleCloud() {
    const THREE = window.THREE;
    const count = 280;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Distribute in a sphere shell
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3 + Math.random() * 5;

      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi) - 1;
      sizes[i] = Math.random() * 2.5 + 0.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      color: 0xC8A96E,
      size: 0.04,
      transparent: true,
      opacity: 0.45,
      sizeAttenuation: true,
    });

    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
  }

  _createWireframeSphere() {
    const THREE = window.THREE;
    const geo = new THREE.SphereGeometry(3.8, 16, 12);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xC8A96E,
      wireframe: true,
      transparent: true,
      opacity: 0.05,
    });
    this.wireframe = new THREE.Mesh(geo, mat);
    this.wireframe.position.set(0, 0, -2);
    this.scene.add(this.wireframe);
  }

  _onMouseMove(e) {
    this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    this.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  }

  _onResize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  _animate() {
    this.animId = requestAnimationFrame(this._animate.bind(this));
    const t = this.clock.getElapsedTime();

    // Smooth mouse lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.04;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.04;

    if (!this.isReduced) {
      // Camera parallax from mouse
      this.camera.position.x += (this.mouse.x * 0.5 - this.camera.position.x) * 0.02;
      this.camera.position.y += (-this.mouse.y * 0.3 - this.camera.position.y) * 0.02;
      this.camera.lookAt(0, 0, 0);

      // Icosahedron rotation
      if (this.icosahedron) {
        this.icosahedron.rotation.x = t * 0.12;
        this.icosahedron.rotation.y = t * 0.18;
        this.icosahedron.position.y = -0.3 + Math.sin(t * 0.5) * 0.15;
      }

      if (this.icoWire) {
        this.icoWire.rotation.copy(this.icosahedron.rotation);
        this.icoWire.position.y = this.icosahedron.position.y;
      }

      // Torus knot
      if (this.torusKnot) {
        this.torusKnot.rotation.x = t * 0.3;
        this.torusKnot.rotation.y = t * 0.22;
        this.torusKnot.position.y = 1.2 + Math.sin(t * 0.7 + 1) * 0.2;
      }

      // Octahedron
      if (this.octahedron) {
        this.octahedron.rotation.x = t * 0.2;
        this.octahedron.rotation.z = t * 0.15;
        this.octahedron.position.y = -2.0 + Math.sin(t * 0.6 + 2) * 0.18;
      }

      // Floating cubes
      if (this.cubes) {
        this.cubes.forEach((c, i) => {
          c.rotation.x += 0.008;
          c.rotation.y += 0.012;
          c.position.y += Math.sin(t * 0.4 + i * 1.2) * 0.003;
        });
      }

      // Particles slow rotation
      if (this.particles) {
        this.particles.rotation.y = t * 0.025;
        this.particles.rotation.x = Math.sin(t * 0.02) * 0.1;
      }

      // Wireframe sphere
      if (this.wireframe) {
        this.wireframe.rotation.y = t * 0.015;
        this.wireframe.rotation.z = t * 0.008;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    cancelAnimationFrame(this.animId);
    window.removeEventListener('mousemove', this._onMouseMove.bind(this));
    window.removeEventListener('resize', this._onResize.bind(this));
    this.renderer.dispose();
  }
}

window.HeroScene = HeroScene;
