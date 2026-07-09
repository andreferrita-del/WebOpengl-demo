// GL2D - Engine 2D nativa WebGL
const GL2D = (() => {
  console.log('🎨 GL2D: Engine 2D inicializada');
  
  let gl, program;
  let canvas, ctx2d;
  let camera = { x: 0, y: 0, zoom: 1.0 };
  let entities = [];
  let textures = {};
  let quadBuffer;
  
  // Quad base
  const quadVertices = new Float32Array([
    -0.5, -0.5,  0.0, 0.0,
     0.5, -0.5,  1.0, 0.0,
     0.5,  0.5,  1.0, 1.0,
    -0.5, -0.5,  0.0, 0.0,
     0.5,  0.5,  1.0, 1.0,
    -0.5,  0.5,  0.0, 1.0,
  ]);

  // ==================== SHADER 2D ====================
  const VERTEX_2D = `
    attribute vec2 aPosition;
    attribute vec2 aTexCoord;
    attribute vec4 aColor;
    
    uniform mat4 uProjection;
    uniform mat4 uModel;
    
    varying vec2 vTexCoord;
    varying vec4 vColor;
    
    void main() {
      gl_Position = uProjection * uModel * vec4(aPosition, 0.0, 1.0);
      vTexCoord = aTexCoord;
      vColor = aColor;
    }
  `;

  const FRAGMENT_2D = `
    precision mediump float;
    
    varying vec2 vTexCoord;
    varying vec4 vColor;
    
    uniform sampler2D uTexture;
    uniform float uAlpha;
    
    void main() {
      vec4 texColor = texture2D(uTexture, vTexCoord);
      vec4 finalColor = texColor * vColor;
      finalColor.a *= uAlpha;
      gl_FragColor = finalColor;
    }
  `;

  // ==================== INICIALIZAÇÃO ====================
  function init(context) {
    gl = context;
    canvas = gl.canvas;
    
    // Compilar shader
    const vs = compileShader(gl.VERTEX_SHADER, VERTEX_2D);
    const fs = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_2D);
    
    if (!vs || !fs) {
      console.error('❌ Falha ao compilar shader 2D');
      return false;
    }
    
    program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('❌ Falha ao linkar programa 2D');
      return false;
    }
    
    // Criar buffer do quad
    quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);
    
    // Criar textura branca padrão
    createDefaultTexture();
    
    console.log('✅ GL2D pronta');
    return true;
  }
  
  function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  }
  
  function createDefaultTexture() {
    const data = new Uint8Array([255, 255, 255, 255]);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    textures['default'] = tex;
  }
  
  function createTextureFromImage(image) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return tex;
  }
  
  function createTextureFromColor(r, g, b, a) {
    const data = new Uint8Array([
      Math.floor(r * 255),
      Math.floor(g * 255),
      Math.floor(b * 255),
      Math.floor((a || 1) * 255)
    ]);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return tex;
  }

  // ==================== ENTIDADES ====================
  function createEntity(options = {}) {
    const entity = {
      id: entities.length,
      x: options.x || 0,
      y: options.y || 0,
      width: options.width || 32,
      height: options.height || 32,
      rotation: options.rotation || 0,
      alpha: options.alpha || 1.0,
      color: options.color || [1, 1, 1, 1],
      texture: options.texture || 'default',
      visible: true,
      vx: options.vx || 0,
      vy: options.vy || 0,
      tag: options.tag || '',
      data: options.data || {},
      update: options.update || null,
      onCollide: options.onCollide || null
    };
    
    entities.push(entity);
    console.log(`🎮 Entidade #${entity.id} criada:`, options.tag || 'sem tag');
    return entity;
  }
  
  function removeEntity(entity) {
    const idx = entities.indexOf(entity);
    if (idx >= 0) {
      entities.splice(idx, 1);
    }
  }
  
  function getEntitiesByTag(tag) {
    return entities.filter(e => e.tag === tag);
  }

  // ==================== FÍSICA ====================
  function checkCollision(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }
  
  function updatePhysics() {
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const a = entities[i];
        const b = entities[j];
        
        if (checkCollision(a, b)) {
          if (a.onCollide) a.onCollide(b);
          if (b.onCollide) b.onCollide(a);
        }
      }
    }
  }

  // ==================== CÂMERA ====================
  function setCamera(x, y, zoom) {
    camera.x = x;
    camera.y = y;
    camera.zoom = zoom || camera.zoom;
  }
  
  function screenToWorld(sx, sy) {
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    return {
      x: (sx - w/2) / camera.zoom + camera.x,
      y: (sy - h/2) / camera.zoom + camera.y
    };
  }

  // ==================== RENDERIZAÇÃO ====================
  function getProjectionMatrix() {
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    const zoom = camera.zoom;
    
    return new Float32Array([
      2 * zoom / w, 0, 0, 0,
      0, -2 * zoom / h, 0, 0,
      0, 0, 1, 0,
      -2 * camera.x * zoom / w - 1,
      2 * camera.y * zoom / h + 1,
      0, 1
    ]);
  }
  
  function getModelMatrix(x, y, w, h, rot = 0) {
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);
    return new Float32Array([
      cos * w, sin * w, 0, 0,
      -sin * h, cos * h, 0, 0,
      0, 0, 1, 0,
      x, y, 0, 1
    ]);
  }
  
  function render() {
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    
    const posLoc = gl.getAttribLocation(program, 'aPosition');
    const texLoc = gl.getAttribLocation(program, 'aTexCoord');
    const colLoc = gl.getAttribLocation(program, 'aColor');
    
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(texLoc);
    gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 16, 8);
    
    const projLoc = gl.getUniformLocation(program, 'uProjection');
    const modelLoc = gl.getUniformLocation(program, 'uModel');
    const texUniLoc = gl.getUniformLocation(program, 'uTexture');
    const alphaLoc = gl.getUniformLocation(program, 'uAlpha');
    
    const projMatrix = getProjectionMatrix();
    gl.uniformMatrix4fv(projLoc, false, projMatrix);
    
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    // Ordenar entidades por Y (pintor)
    const sorted = [...entities]
      .filter(e => e.visible)
      .sort((a, b) => (a.y + a.height) - (b.y + b.height));
    
    for (const entity of sorted) {
      const modelMatrix = getModelMatrix(
        entity.x + entity.width / 2,
        entity.y + entity.height / 2,
        entity.width,
        entity.height,
        entity.rotation
      );
      
      gl.uniformMatrix4fv(modelLoc, false, modelMatrix);
      gl.uniform1f(alphaLoc, entity.alpha);
      
      if (colLoc >= 0) {
        gl.disableVertexAttribArray(colLoc);
        gl.vertexAttrib4f(colLoc,
          entity.color[0],
          entity.color[1],
          entity.color[2],
          entity.color[3]
        );
      }
      
      gl.activeTexture(gl.TEXTURE0);
      const tex = textures[entity.texture] || textures['default'];
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(texUniLoc, 0);
      
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    
    gl.disable(gl.BLEND);
  }
  
  function update(dt) {
    for (const entity of entities) {
      // Atualizar posição
      entity.x += entity.vx * dt;
      entity.y += entity.vy * dt;
      
      // Callback de update
      if (entity.update) {
        entity.update(entity, dt);
      }
    }
    
    updatePhysics();
  }

  // ==================== INPUT 2D ====================
  let mouseX = 0, mouseY = 0;
  let mouseDown = false;
  
  function initInput() {
    canvas.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    
    canvas.addEventListener('mousedown', () => { mouseDown = true; });
    canvas.addEventListener('mouseup', () => { mouseDown = false; });
    
    canvas.addEventListener('touchmove', (e) => {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
    });
    
    canvas.addEventListener('touchstart', () => { mouseDown = true; });
    canvas.addEventListener('touchend', () => { mouseDown = false; });
  }
  
  function getMouseWorld() {
    return screenToWorld(mouseX, mouseY);
  }
  
  function isMouseDown() {
    return mouseDown;
  }

  return {
    init,
    createEntity,
    removeEntity,
    getEntitiesByTag,
    createTextureFromImage,
    createTextureFromColor,
    setCamera,
    screenToWorld,
    getMouseWorld,
    isMouseDown,
    initInput,
    update,
    render,
    getEntities: () => entities
  };
})();