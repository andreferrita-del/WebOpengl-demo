const Logo = (() => {
  console.log('🖼️ Logo: módulo carregado');

  let gl = null;
  let sprite2D = null;
  let texture = null;
  let loaded = false;
  let size = 96;
  let alpha = 0.9;
  let visible = true;
  let margin = 12;
  let position = 'bottom-left';

  function init(context, s2d) {
    gl = context;
    sprite2D = s2d;

    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 0]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  function load(src = 'webgl/img/opengl-logo.png') {
    if (!gl) return;
    const img = new Image();
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      loaded = true;
      console.log('✅ Logo carregada:', img.width, 'x', img.height);
    };
    img.onerror = () => {
      console.warn('⚠️ Logo não encontrada, usando fallback');
      createFallbackTexture();
    };
    img.src = src;
  }

  function createFallbackTexture() {
    if (!gl) return;
    const s = 128;
    const data = new Uint8Array(s * s * 4);
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const i = (y * s + x) * 4;
        const border = 8;
        const isBorder = x < border || x >= s - border || y < border || y >= s - border;
        if (isBorder) {
          data[i] = 0; data[i+1] = 200; data[i+2] = 150; data[i+3] = 255;
        } else {
          data[i] = 20; data[i+1] = 80; data[i+2] = 60; data[i+3] = 220;
        }
      }
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, s, s, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    loaded = true;
  }

  function setPosition(pos) { position = pos; }
  function setSize(s) { size = s; }
  function setAlpha(a) { alpha = Math.max(0, Math.min(1, a)); }
  function show() { visible = true; }
  function hide() { visible = false; }

  function render(canvasWidth, canvasHeight) {
    if (!gl || !visible || !loaded || !sprite2D) return;

    let x, y;
    const half = size / 2;
    switch (position) {
      case 'bottom-left':
        x = margin + half;
        y = canvasHeight - margin - half;
        break;
      case 'bottom-right':
        x = canvasWidth - margin - half;
        y = canvasHeight - margin - half;
        break;
      case 'top-left':
        x = margin + half;
        y = margin + half;
        break;
      case 'top-right':
        x = canvasWidth - margin - half;
        y = margin + half;
        break;
      default:
        x = margin + half;
        y = canvasHeight - margin - half;
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    sprite2D.drawSprite(texture, x, y, size, size, {
      alpha: alpha,
      color: [1, 1, 1, 1],
      rotation: 0,
      time: 0
    });

    gl.disable(gl.BLEND);
  }

  return {
    init,
    load,
    render,
    setPosition,
    setSize,
    setAlpha,
    show,
    hide
  };
})();