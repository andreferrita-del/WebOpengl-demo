// Renderizador 2D (Sprites, UI, Glow)
const Sprite2D = (() => {
  console.log('🎨 Sprite2D: inicializado');
  let gl, programs, quadBuffer;

  const quadVertices = new Float32Array([
    -0.5, -0.5, 0.0, 0.0,
     0.5, -0.5, 1.0, 0.0,
     0.5,  0.5, 1.0, 1.0,
    -0.5, -0.5, 0.0, 0.0,
     0.5,  0.5, 1.0, 1.0,
    -0.5,  0.5, 0.0, 1.0,
  ]);

  function init(context, shaderPrograms) {
    gl = context;
    programs = shaderPrograms;
    quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);
    console.log('✅ Sprite2D pronto');
  }

  function updateProjection() {
    const w = gl.canvas.width;
    const h = gl.canvas.height;
    return new Float32Array([
      2/w, 0, 0, 0,
      0, -2/h, 0, 0,
      0, 0, 1, 0,
      -1, 1, 0, 1
    ]);
  }

  function createModelMatrix(x, y, w, h, rot = 0) {
    const cos = Math.cos(rot), sin = Math.sin(rot);
    return new Float32Array([
      cos*w, sin*w, 0, 0,
      -sin*h, cos*h, 0, 0,
      0, 0, 1, 0,
      x, y, 0, 1
    ]);
  }

  function drawSprite(texture, x, y, w, h, opts = {}) {
    const prog = programs['sprite2d'];
    if (!prog) return;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    const posLoc = gl.getAttribLocation(prog, 'aPosition');
    const texLoc = gl.getAttribLocation(prog, 'aTexCoord');
    const colLoc = gl.getAttribLocation(prog, 'aColor');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(texLoc);
    gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 16, 8);
    if (colLoc >= 0) {
      gl.disableVertexAttribArray(colLoc);
      gl.vertexAttrib4f(colLoc, (opts.color||[1,1,1,1])[0], (opts.color||[1,1,1,1])[1], (opts.color||[1,1,1,1])[2], (opts.color||[1,1,1,1])[3]);
    }
    const proj = updateProjection();
    gl.uniformMatrix4fv(gl.getUniformLocation(prog, 'uProjection'), false, proj);
    gl.uniformMatrix4fv(gl.getUniformLocation(prog, 'uModel'), false, createModelMatrix(x, y, w, h, opts.rotation||0));
    gl.uniform1f(gl.getUniformLocation(prog, 'uAlpha'), opts.alpha||1);
    gl.uniform1f(gl.getUniformLocation(prog, 'uTime'), opts.time||0);
    gl.uniform3fv(gl.getUniformLocation(prog, 'uTintColor'), opts.tintColor||[1,1,1]);
    gl.uniform1f(gl.getUniformLocation(prog, 'uGlowIntensity'), opts.glowIntensity||0.5);
    gl.activeTexture(gl.TEXTURE0);
    if (texture) gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(gl.getUniformLocation(prog, 'uTexture'), 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function drawRect(x, y, w, h, color, opts = {}) {
    const prog = programs['ui'];
    if (!prog) return;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    const posLoc = gl.getAttribLocation(prog, 'aPosition');
    const texLoc = gl.getAttribLocation(prog, 'aTexCoord');
    const colLoc = gl.getAttribLocation(prog, 'aColor');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(texLoc);
    gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 16, 8);
    if (colLoc >= 0) {
      gl.disableVertexAttribArray(colLoc);
      gl.vertexAttrib4f(colLoc, color[0], color[1], color[2], color[3]||1);
    }
    const proj = updateProjection();
    gl.uniformMatrix4fv(gl.getUniformLocation(prog, 'uProjection'), false, proj);
    gl.uniformMatrix4fv(gl.getUniformLocation(prog, 'uModel'), false, createModelMatrix(x, y, w, h));
    gl.uniform1f(gl.getUniformLocation(prog, 'uAlpha'), opts.alpha||1);
    gl.uniform2f(gl.getUniformLocation(prog, 'uSize'), w, h);
    gl.uniform1f(gl.getUniformLocation(prog, 'uBorderRadius'), opts.borderRadius||0);
    gl.uniform4fv(gl.getUniformLocation(prog, 'uBorderColor'), opts.borderColor||[1,1,1,1]);
    gl.uniform1f(gl.getUniformLocation(prog, 'uBorderWidth'), opts.borderWidth||0);
    gl.uniform1f(gl.getUniformLocation(prog, 'uTime'), opts.time||0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function drawGlow(x, y, size, color, time = 0) {
    const prog = programs['glow'];
    if (!prog) return;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    const posLoc = gl.getAttribLocation(prog, 'aPosition');
    const texLoc = gl.getAttribLocation(prog, 'aTexCoord');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(texLoc);
    gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 16, 8);
    const proj = updateProjection();
    gl.uniformMatrix4fv(gl.getUniformLocation(prog, 'uProjection'), false, proj);
    gl.uniformMatrix4fv(gl.getUniformLocation(prog, 'uModel'), false, createModelMatrix(x, y, size, size));
    gl.uniform3fv(gl.getUniformLocation(prog, 'uGlowColor'), color);
    gl.uniform1f(gl.getUniformLocation(prog, 'uGlowSize'), 5.0);
    gl.uniform1f(gl.getUniformLocation(prog, 'uTime'), time);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  return { init, drawSprite, drawRect, drawGlow };
})();