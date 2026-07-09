// webgl/src/gl.js
// Módulo GL: inicialização robusta + HUD de FPS (fundo azul claro)
const GL = (() => {
  let canvas = null;
  let gl = null;
  let _supported = true;

  // ==================== ESTATÍSTICAS ====================
  let _fps = 0;
  let _frameCount = 0;
  let _lastFpsTime = performance.now();

  // ==================== ELEMENTO DE HUD ====================
  let _hudElement = null;

  function _createHUD() {
    _hudElement = document.createElement('div');
    _hudElement.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.6);
      color: #00ffcc;
      padding: 6px 12px;
      border-radius: 6px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      z-index: 9999;
      pointer-events: none;
      border: 1px solid rgba(0, 255, 204, 0.3);
    `;
    document.body.appendChild(_hudElement);
  }

  function _updateHUD() {
    if (!_hudElement) return;

    _frameCount++;
    const now = performance.now();
    
    if (now - _lastFpsTime >= 1000) {
      _fps = Math.round(_frameCount / ((now - _lastFpsTime) / 1000));
      _frameCount = 0;
      _lastFpsTime = now;
    }

    _hudElement.textContent = `⚡ ${_fps} FPS`;
    requestAnimationFrame(_updateHUD);
  }

  // ==================== INICIALIZAÇÃO ====================
  function init(canvasId) {
    canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.error('❌ Canvas não encontrado:', canvasId);
      _supported = false;
      return null;
    }

    const contextOptions = {
      alpha: false,
      antialias: true,
      premultipliedAlpha: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false
    };

    gl = canvas.getContext('webgl2', contextOptions) ||
         canvas.getContext('webgl', contextOptions) ||
         canvas.getContext('experimental-webgl', contextOptions);

    if (!gl) {
      console.error('❌ WebGL não suportado neste navegador.');
      _supported = false;
      canvas.style.display = 'none';
      const msg = document.createElement('div');
      msg.style.cssText = 'color:white;text-align:center;margin-top:100px;font-size:18px;';
      msg.textContent = '⚠️ WebGL não é suportado pelo seu navegador.';
      document.body.appendChild(msg);
      return null;
    }

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    
    // Fundo AZUL CLARO
    gl.clearColor(0.3, 0.5, 0.8, 1.0);

    console.log('🎮 WebGL inicializado com sucesso');

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', () => setTimeout(resize, 100));

    _supported = true;
    return gl;
  }

  function resize() {
    if (!canvas || !gl || !_supported) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function getContext() { return gl; }
  function getCanvas() { return canvas; }
  function isSupported() { return _supported && gl !== null; }

  function createTexture(width, height, data) {
    if (!gl || !_supported) return null;
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return texture;
  }

  function createSolidTexture(r, g, b, a = 1.0) {
    const data = new Uint8Array([
      Math.floor(r * 255),
      Math.floor(g * 255),
      Math.floor(b * 255),
      Math.floor(a * 255)
    ]);
    return createTexture(1, 1, data);
  }

  function clear() {
    if (!gl || !_supported) return;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  function startHUD() {
    if (!_hudElement) _createHUD();
    _updateHUD();
  }

  if (document.readyState === 'complete') {
    setTimeout(startHUD, 100);
  } else {
    window.addEventListener('load', () => setTimeout(startHUD, 100));
  }

  return {
    init,
    getContext,
    getCanvas,
    resize,
    isSupported,
    createTexture,
    createSolidTexture,
    clear
  };
})();