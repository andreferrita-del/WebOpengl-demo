const Render = (() => {
  console.log('🖼️ Render: pipeline original');

  let gl, program, canvas;
  let uniforms, attribs;
  let camAngleX = 0.3, camAngleY = 0.5, camDist = 4.5;
  const target = [0, 1.0, 0];

  function mat4() { return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]); }
  function multiplyMat4(a, b) {
    const r = new Float32Array(16);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      r[i + j*4] = 0;
      for (let k = 0; k < 4; k++) r[i + j*4] += a[i + k*4] * b[k + j*4];
    }
    return r;
  }
  function perspective(fov, aspect, near, far) {
    const f = 1.0 / Math.tan(fov / 2), nf = 1 / (near - far);
    const m = mat4();
    m[0] = f / aspect; m[5] = f; m[10] = (far + near) * nf; m[11] = -1; m[14] = 2 * far * near * nf; m[15] = 0;
    return m;
  }
  function lookAt(ex, ey, ez, tx, ty, tz, ux, uy, uz) {
    let zx = ex - tx, zy = ey - ty, zz = ez - tz;
    const zl = Math.sqrt(zx*zx + zy*zy + zz*zz); zx /= zl; zy /= zl; zz /= zl;
    let xx = uy * zz - uz * zy, xy = uz * zx - ux * zz, xz = ux * zy - uy * zx;
    const xl = Math.sqrt(xx*xx + xy*xy + xz*xz); xx /= xl; xy /= xl; xz /= xl;
    const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    const m = mat4();
    m[0] = xx; m[1] = yx; m[2] = zx; m[3] = 0;
    m[4] = xy; m[5] = yy; m[6] = zy; m[7] = 0;
    m[8] = xz; m[9] = yz; m[10] = zz; m[11] = 0;
    m[12] = -(xx*ex + xy*ey + xz*ez);
    m[13] = -(yx*ex + yy*ey + yz*ez);
    m[14] = -(zx*ex + zy*ey + zz*ez);
    m[15] = 1;
    return m;
  }
  function translate(m, x, y, z) { const t = mat4(); t[12] = x; t[13] = y; t[14] = z; return multiplyMat4(t, m); }
  function rotateY(m, a) { const c = Math.cos(a), s = Math.sin(a), r = mat4(); r[0] = c; r[2] = s; r[8] = -s; r[10] = c; return multiplyMat4(r, m); }
  function rotateX(m, a) { const c = Math.cos(a), s = Math.sin(a), r = mat4(); r[5] = c; r[6] = -s; r[9] = s; r[10] = c; return multiplyMat4(r, m); }

  function init(context, prog) {
    gl = context; program = prog; canvas = GL.getCanvas();
    attribs = {
      pos: gl.getAttribLocation(program, 'aPosition'),
      norm: gl.getAttribLocation(program, 'aNormal'),
      col: gl.getAttribLocation(program, 'aColor'),
      tex: gl.getAttribLocation(program, 'aTexCoord')
    };
    uniforms = {
      mv: gl.getUniformLocation(program, 'uModelViewMatrix'),
      proj: gl.getUniformLocation(program, 'uProjectionMatrix'),
      normMat: gl.getUniformLocation(program, 'uNormalMatrix'),
      tex: gl.getUniformLocation(program, 'uTexture'),
      useTex: gl.getUniformLocation(program, 'uUseTexture'),
      lightDir: gl.getUniformLocation(program, 'uLightDirection'),
      lightCol: gl.getUniformLocation(program, 'uLightColor'),
      amb: gl.getUniformLocation(program, 'uAmbientColor'),
      camPos: gl.getUniformLocation(program, 'uCameraPosition'),
      shine: gl.getUniformLocation(program, 'uShininess'),
      fogCol: gl.getUniformLocation(program, 'uFogColor'),
      fogNear: gl.getUniformLocation(program, 'uFogNear'),
      fogFar: gl.getUniformLocation(program, 'uFogFar')
    };
    Input.setRotateCallback((dx, dy) => { camAngleY += dx; camAngleX += dy; if (camAngleX > 1.2) camAngleX = 1.2; if (camAngleX < -1.2) camAngleX = -1.2; });
    Input.setZoomCallback(d => { camDist += d; if (camDist < 2.5) camDist = 2.5; if (camDist > 8) camDist = 8; });
    Input.init(canvas);
    console.log('✅ Render original pronto');
  }

  function drawMesh(mesh, px, py, pz, rx, ry, rz, sx, sy, sz, useTex = false) {
    if (!mesh) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffer);
    gl.enableVertexAttribArray(attribs.pos);
    gl.vertexAttribPointer(attribs.pos, 3, gl.FLOAT, false, mesh.stride, mesh.posOffset);
    gl.enableVertexAttribArray(attribs.norm);
    gl.vertexAttribPointer(attribs.norm, 3, gl.FLOAT, false, mesh.stride, mesh.normOffset);
    gl.enableVertexAttribArray(attribs.col);
    gl.vertexAttribPointer(attribs.col, 3, gl.FLOAT, false, mesh.stride, mesh.colOffset);
    gl.enableVertexAttribArray(attribs.tex);
    gl.vertexAttribPointer(attribs.tex, 2, gl.FLOAT, false, mesh.stride, mesh.texOffset);

    let model = mat4();
    model = translate(model, px, py, pz);
    model = rotateY(model, ry);
    model = rotateX(model, rx);
    const scale = mat4();
    scale[0] = sx; scale[5] = sy; scale[10] = sz;
    model = multiplyMat4(scale, model);

    const eyeX = target[0] + camDist * Math.sin(camAngleY) * Math.cos(camAngleX);
    const eyeY = target[1] + camDist * Math.sin(camAngleX);
    const eyeZ = target[2] + camDist * Math.cos(camAngleY) * Math.cos(camAngleX);
    const view = lookAt(eyeX, eyeY, eyeZ, target[0], target[1], target[2], 0, 1, 0);
    const mv = multiplyMat4(view, model);
    const aspect = canvas.width / canvas.height;
    const proj = perspective(Math.PI / 4, aspect, 0.1, 50);

    const nMat = new Float32Array(9);
    nMat[0] = mv[0]; nMat[1] = mv[1]; nMat[2] = mv[2];
    nMat[3] = mv[4]; nMat[4] = mv[5]; nMat[5] = mv[6];
    nMat[6] = mv[8]; nMat[7] = mv[9]; nMat[8] = mv[10];

    gl.uniformMatrix4fv(uniforms.mv, false, mv);
    gl.uniformMatrix4fv(uniforms.proj, false, proj);
    gl.uniformMatrix3fv(uniforms.normMat, false, nMat);
    gl.uniform1i(uniforms.tex, 0);
    gl.uniform1i(uniforms.useTex, useTex ? 1 : 0);
    gl.uniform3f(uniforms.lightDir, 0.4, 0.8, 0.5);
    gl.uniform3f(uniforms.lightCol, 1.0, 0.98, 0.95);
    gl.uniform3f(uniforms.amb, 0.5, 0.45, 0.55);
    gl.uniform3f(uniforms.camPos, eyeX, eyeY, eyeZ);
    gl.uniform1f(uniforms.shine, 50.0);
    gl.uniform3f(uniforms.fogCol, 0.3, 0.5, 0.8);
    gl.uniform1f(uniforms.fogNear, 3.0);
    gl.uniform1f(uniforms.fogFar, 15.0);

    gl.drawArrays(gl.TRIANGLES, 0, mesh.count);
  }

  function clear() { gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); }

  return { init, drawMesh, clear };
})();