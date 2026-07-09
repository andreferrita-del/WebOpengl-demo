// webgl/2Dmodels/waveShader.js
// Shader Wave com fundo xadrez azul e amarelo (sem imagem)
window.GameModel2D = (() => {
  console.log('🌊 Wave Shader 2D - Xadrez Azul/Amarelo');

  function create(gl, sprite2D) {
    // Vertex shader
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_uv = (a_position + 1.0) * 0.5;
        v_uv.y = 1.0 - v_uv.y;
      }
    `);
    gl.compileShader(vs);

    // Fragment shader (apenas xadrez com onda, sem textura)
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, `
      precision highp float;
      varying vec2 v_uv;
      uniform float u_time;
      uniform float u_flipX;
      uniform float u_flipY;

      const float uSpeed = 0.5;
      const float uFrequency = 5.5;
      const float uWaveAmplitude = 0.1;

      vec2 sineWave(vec2 pt) {
        float x = sin(pt.y * uFrequency + u_time * uSpeed) * (uWaveAmplitude / pt.x * pt.y);
        float y = sin(pt.x * uFrequency - u_time * uSpeed) * (uWaveAmplitude / pt.y * pt.x);
        return vec2(pt.x + x, pt.y + y);
      }

      void main() {
        vec2 uv = v_uv;
        if (u_flipX > 0.5) uv.x = 1.0 - uv.x;
        if (u_flipY > 0.5) uv.y = 1.0 - uv.y;

        vec2 distortedUv = sineWave(uv);

        // Xadrez azul e amarelo
        vec2 gridUv = distortedUv * 8.0;
        vec2 grid = abs(fract(gridUv) - 0.5);
        float checker = 1.0 - step(0.25, max(grid.x, grid.y));
        vec3 color1 = vec3(0.1, 0.3, 0.9);   // azul
        vec3 color2 = vec3(0.9, 0.85, 0.1);  // amarelo
        vec4 color = vec4(mix(color1, color2, checker), 1.0);

        gl_FragColor = color;
      }
    `);
    gl.compileShader(fs);

    // Programa
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('❌ Link falhou:', gl.getProgramInfoLog(program));
      return { render: function() {} };
    }

    console.log('✅ Wave Shader (sem imagem) compilado');

    // Quad fullscreen
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1,-1, 1,-1, 1,1,
      -1,-1, 1,1, -1,1
    ]), gl.STATIC_DRAW);

    const attribPosition = gl.getAttribLocation(program, 'a_position');

    return {
      render: function(time, w, h) {
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, quad);
        gl.enableVertexAttribArray(attribPosition);
        gl.vertexAttribPointer(attribPosition, 2, gl.FLOAT, false, 0, 0);

        gl.uniform1f(gl.getUniformLocation(program, 'u_time'), time);
        //gl.uniform1f(gl.getUniformLocation(program, 'u_flipX'), Math.sin(time * 0.5) > 0 ? 1.0 : 0.0);
        //gl.uniform1f(gl.getUniformLocation(program, 'u_flipY'), Math.cos(time * 0.7) > 0 ? 1.0 : 0.0);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
    };
  }

  return { create };
})();