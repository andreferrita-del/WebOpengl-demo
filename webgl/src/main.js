// webgl/src/main.js
(function() {
  console.log('🎯 Main: 2D normal + 3D com texturas');

  const gl = GL.init('glCanvas');
  if (!gl) return;
  const canvas = GL.getCanvas();

  // ==================== PIXELADO PERMANENTE ====================
  const PIXEL_SCALE = 1.;

  function applyPixelatedSize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.max(1, Math.floor(w / PIXEL_SCALE));
    canvas.height = Math.max(1, Math.floor(h / PIXEL_SCALE));
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    //canvas.style.imageRendering = 'pixelated';
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  applyPixelatedSize();
  window.addEventListener('resize', applyPixelatedSize);

  // ==================== SHADER 3D ====================
  const prog3D = Loader.createProgram(gl);
  if (!prog3D) return;
  Render.init(gl, prog3D);

  // ==================== 2D ====================
  let hasSprite2D = false, shaderPrograms = null;

  try {
    shaderPrograms = Loader.createAllPrograms(gl);
    if (shaderPrograms?.sprite2d) {
      Sprite2D.init(gl, shaderPrograms);
      hasSprite2D = true;
    }
  } catch(e) {}

  let modelParts3D = [], parts2D = null;
  const defaultColor = [0.7, 0.7, 0.7];
  let time = 0, currentMode = '3d';

  // ==================== LOGO ====================
  let logo = null;
  if (typeof LogoOpenGL !== 'undefined' && Sprite2D) {
    logo = new LogoOpenGL(gl, Sprite2D);
    logo.load('webgl/img/opengl-logo.png')
        .setSize(96)
        .setPosition('bottom-left');
    console.log('🖼️ Logo OpenGL inicializada');
  }

  // ==================== MODELOS ====================
  function loadModel3D() {
    if (window.__glbData) {
      try {
        const data = OBJLoader.parseGLB(window.__glbData);
        if (data?.pos?.length) {
          modelParts3D = [{ mesh: OBJLoader.createMeshFromData(gl, data, defaultColor), baseY:1, scaleX:1, scaleY:1, scaleZ:1 }];
          return true;
        }
      } catch(e) {}
    }
    if (typeof GameModel !== 'undefined') {
      try {
        const result = GameModel.create(gl);
        if (Array.isArray(result)) {
          modelParts3D = result;
        } else if (result && result.parts) {
          modelParts3D = result.parts;
        } else if (result && result.mesh) {
          modelParts3D = [result];
        } else {
          modelParts3D = result;
        }
        console.log('✅ GameModel carregado:', modelParts3D.length, 'partes');
        return true;
      } catch(e) { console.error('Erro GameModel:', e.message); }
    }
    modelParts3D = [{ mesh: Graphics.createBox(gl, 1,1,1, 0.2,0.6,1), baseY:1, scaleX:1, scaleY:1, scaleZ:1 }];
    return true;
  }
  loadModel3D();

  function loadModel2D() {
    if (typeof GameModel2D !== 'undefined') {
      try {
        parts2D = GameModel2D.create(gl, Sprite2D);
        console.log('✅ Modelo 2D carregado');
        return true;
      } catch(e) {}
    }
    return false;
  }
  if (typeof GameModel2D !== 'undefined') loadModel2D();

  // ==================== EVENTOS ====================
  window.addEventListener('modechange', e => {
    currentMode = e.detail;
    console.log('🔄 Modo:', currentMode);
    if (currentMode === '2d' && !parts2D && typeof GameModel2D !== 'undefined') {
      loadModel2D();
    }
  });

  // Drag & Drop, duplo clique (mantidos)
  ['dragenter','dragover','dragleave','drop'].forEach(ev =>
    canvas.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); })
  );
  canvas.addEventListener('dragenter', () => canvas.style.border = '3px solid #00ffcc');
  canvas.addEventListener('dragleave', () => canvas.style.border = 'none');
  canvas.addEventListener('drop', async e => {
    canvas.style.border = 'none';
    const file = e.dataTransfer.files[0]; if (!file) return;
    try {
      const ext = file.name.split('.').pop().toLowerCase();
      let data;
      if (ext === 'glb') data = OBJLoader.parseGLB(await file.arrayBuffer());
      else data = OBJLoader.autoDetectAndParse(await file.text(), file.name);
      if (data?.pos?.length) modelParts3D = [{ mesh: OBJLoader.createMeshFromData(gl, data, defaultColor), baseY:1, scaleX:1, scaleY:1, scaleZ:1 }];
    } catch(err) {}
  });
  canvas.addEventListener('dblclick', () => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.obj,.stl,.ply,.fbx,.glb,.usd,.usda,.dae';
    inp.onchange = async e => {
      const file = e.target.files[0]; if (!file) return;
      try {
        const ext = file.name.split('.').pop().toLowerCase();
        let data;
        if (ext === 'glb') data = OBJLoader.parseGLB(await file.arrayBuffer());
        else data = OBJLoader.autoDetectAndParse(await file.text(), file.name);
        if (data?.pos?.length) modelParts3D = [{ mesh: OBJLoader.createMeshFromData(gl, data, defaultColor), baseY:1, scaleX:1, scaleY:1, scaleZ:1 }];
      } catch(err) {}
    };
    inp.click();
  });

  // ==================== LOOP ====================
  function loop() {
    time += 0.016;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height); // ← viewport normal sempre

    if (currentMode === '3d') {
      gl.useProgram(prog3D);
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);

      if (modelParts3D.length > 0) {
        const floatY = Math.sin(time * 2.0) * 0.03;
        const breath = 1.0 + Math.sin(time * 2.5) * 0.01;

        for (const p of modelParts3D) {
          if (p._texture && p._useTexture) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, p._texture);
          }
          Render.drawMesh(
            p.mesh,
            p.offsetX || 0, (p.baseY || 0) + floatY, p.offsetZ || 0,
            p.rotX || 0, p.rotY || 0, p.rotZ || 0,
            (p.scaleX || 1) * breath, (p.scaleY || 1) * breath, (p.scaleZ || 1) * breath,
            p._useTexture || false
          );
        }
      }
    } else {
      // MODO 2D – COMPORTAMENTO ORIGINAL, SEM ALTERAÇÕES
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.CULL_FACE);

      if (parts2D?.render) {
        // passa o tamanho real do canvas, como sempre foi
        parts2D.render(time, canvas.width, canvas.height);
      } else if (hasSprite2D) {
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        Sprite2D.drawRect(0, 0, w, h, [0.05, 0.03, 0.1, 1]);
        Sprite2D.drawGlow(w/2, h/2, 100, [0, 1, 0.8], time);
      }

      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);
    }

    // Logo
    if (logo) {
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      logo.render(w, h);
    }

    requestAnimationFrame(loop);
  }

  loop();

  console.log('✅ Engine rodando – 2D normal, 3D com texturas');
})();