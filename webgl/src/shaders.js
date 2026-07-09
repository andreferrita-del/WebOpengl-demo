// Shaders da Engine (3D, Sprite2D, UI, Glow, GL2D, Particles, Wave, Pixelate)
const Shaders = (() => {
  console.log('🎨 Shaders: compilando shaders inline...');

  // ==================== SHADER 3D PADRÃO (Phong) ====================
  const VERTEX_3D = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec3 aColor;
    attribute vec2 aTexCoord;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform mat3 uNormalMatrix;
    varying vec3 vColor;
    varying vec3 vNormal;
    varying vec2 vTexCoord;
    varying vec3 vPosition;
    void main() {
      vec4 worldPos = uModelViewMatrix * vec4(aPosition, 1.0);
      gl_Position = uProjectionMatrix * worldPos;
      vPosition = worldPos.xyz;
      vNormal = normalize(uNormalMatrix * aNormal);
      vColor = aColor;
      vTexCoord = aTexCoord;
    }
  `;

  const FRAGMENT_3D = `
    precision mediump float;
    varying vec3 vColor;
    varying vec3 vNormal;
    varying vec2 vTexCoord;
    varying vec3 vPosition;
    uniform sampler2D uTexture;
    uniform bool uUseTexture;
    uniform vec3 uLightDirection;
    uniform vec3 uLightColor;
    uniform vec3 uAmbientColor;
    uniform vec3 uCameraPosition;
    uniform float uShininess;
    uniform vec3 uFogColor;
    uniform float uFogNear;
    uniform float uFogFar;
    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(uCameraPosition - vPosition);
      vec3 lightDir = normalize(uLightDirection);
      vec3 baseColor = vColor;
      if (uUseTexture) baseColor = texture2D(uTexture, vTexCoord).rgb;
      float diff = max(dot(normal, lightDir), 0.0);
      vec3 diffuse = diff * uLightColor * baseColor;
      vec3 ambient = uAmbientColor * baseColor;
      vec3 halfDir = normalize(lightDir + viewDir);
      float spec = pow(max(dot(normal, halfDir), 0.0), uShininess);
      vec3 specular = spec * uLightColor * 0.5;
      vec3 color = ambient + diffuse + specular;
      float dist = length(vPosition);
      float fogFactor = clamp((uFogFar - dist) / (uFogFar - uFogNear), 0.0, 1.0);
      color = mix(uFogColor, color, fogFactor);
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  // ==================== SHADER SPRITE 2D ====================
  const VERTEX_SPRITE2D = `
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

  const FRAGMENT_SPRITE2D = `
    precision mediump float;
    varying vec2 vTexCoord;
    varying vec4 vColor;
    uniform sampler2D uTexture;
    uniform float uAlpha;
    uniform float uTime;
    uniform vec3 uTintColor;
    uniform float uGlowIntensity;
    void main() {
      vec4 texColor = texture2D(uTexture, vTexCoord);
      vec4 finalColor = texColor * vColor;
      finalColor.rgb = mix(finalColor.rgb, uTintColor, 0.3);
      finalColor.a *= uAlpha;
      float glow = 0.5 + 0.5 * sin(uTime * 3.0);
      finalColor.rgb += glow * uGlowIntensity * 0.1;
      gl_FragColor = finalColor;
    }
  `;

  // ==================== SHADER UI 2D ====================
  const VERTEX_UI = `
    attribute vec2 aPosition;
    attribute vec2 aTexCoord;
    attribute vec4 aColor;
    uniform mat4 uProjection;
    uniform mat4 uModel;
    varying vec2 vTexCoord;
    varying vec4 vColor;
    varying vec2 vWorldPos;
    void main() {
      vec4 worldPos = uModel * vec4(aPosition, 0.0, 1.0);
      gl_Position = uProjection * worldPos;
      vTexCoord = aTexCoord;
      vColor = aColor;
      vWorldPos = worldPos.xy;
    }
  `;

  const FRAGMENT_UI = `
    precision mediump float;
    varying vec2 vTexCoord;
    varying vec4 vColor;
    varying vec2 vWorldPos;
    uniform sampler2D uTexture;
    uniform float uAlpha;
    uniform vec2 uSize;
    uniform float uBorderRadius;
    uniform vec4 uBorderColor;
    uniform float uBorderWidth;
    uniform float uTime;
    void main() {
      vec2 uv = vTexCoord;
      vec2 halfSize = uSize * 0.5;
      vec2 pos = (uv - 0.5) * uSize;
      float cornerRadius = uBorderRadius;
      float dist = length(max(abs(pos) - halfSize + cornerRadius, 0.0)) - cornerRadius;
      float alpha = 1.0 - smoothstep(-1.0, 1.0, dist);
      float borderDist = length(max(abs(pos) - halfSize + cornerRadius + uBorderWidth, 0.0)) - cornerRadius - uBorderWidth;
      float borderAlpha = 1.0 - smoothstep(-1.0, 1.0, borderDist);
      float border = borderAlpha - alpha;
      vec4 texColor = texture2D(uTexture, vTexCoord);
      vec4 finalColor = texColor * vColor;
      finalColor = mix(finalColor, uBorderColor, border);
      finalColor.a *= uAlpha * alpha;
      gl_FragColor = finalColor;
    }
  `;

  // ==================== SHADER GLOW ====================
  const VERTEX_GLOW = `
    attribute vec2 aPosition;
    attribute vec2 aTexCoord;
    uniform mat4 uProjection;
    uniform mat4 uModel;
    varying vec2 vTexCoord;
    varying vec2 vPos;
    void main() {
      vec4 worldPos = uModel * vec4(aPosition, 0.0, 1.0);
      gl_Position = uProjection * worldPos;
      vTexCoord = aTexCoord;
      vPos = aPosition;
    }
  `;

  const FRAGMENT_GLOW = `
    precision mediump float;
    varying vec2 vTexCoord;
    varying vec2 vPos;
    uniform vec3 uGlowColor;
    uniform float uGlowSize;
    uniform float uTime;
    void main() {
      float dist = length(vPos);
      float glow = exp(-dist * uGlowSize) * 0.5;
      glow += 0.3 * sin(uTime * 4.0 + dist * 10.0);
      gl_FragColor = vec4(uGlowColor, glow);
    }
  `;

  // ==================== SHADER GL2D ====================
  const VERTEX_GL2D = `
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

  const FRAGMENT_GL2D = `
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

  // ==================== SHADER PARTÍCULAS ====================
  const VERTEX_PARTICLES = `
    attribute vec2 aPosition;
    attribute vec2 aTexCoord;
    attribute vec4 aColor;
    attribute float aSize;
    uniform mat4 uProjection;
    uniform mat4 uModel;
    varying vec2 vTexCoord;
    varying vec4 vColor;
    void main() {
      gl_Position = uProjection * uModel * vec4(aPosition * aSize, 0.0, 1.0);
      vTexCoord = aTexCoord;
      vColor = aColor;
    }
  `;

  const FRAGMENT_PARTICLES = `
    precision mediump float;
    varying vec2 vTexCoord;
    varying vec4 vColor;
    uniform sampler2D uTexture;
    uniform float uAlpha;
    void main() {
      vec4 texColor = texture2D(uTexture, vTexCoord);
      vec4 finalColor = texColor * vColor;
      finalColor.a *= uAlpha;
      float dist = length(vTexCoord - 0.5) * 2.0;
      finalColor.a *= 1.0 - smoothstep(0.5, 1.0, dist);
      gl_FragColor = finalColor;
    }
  `;

  // ==================== SHADER WAVE ====================
  const VERTEX_WAVE = `
    attribute vec2 aPosition;
    attribute vec2 aTexCoord;
    uniform mat4 uProjection;
    uniform mat4 uModel;
    varying vec2 vTexCoord;
    varying vec2 vPosition;
    void main() {
      vec4 worldPos = uModel * vec4(aPosition, 0.0, 1.0);
      gl_Position = uProjection * worldPos;
      vTexCoord = aTexCoord;
      vPosition = worldPos.xy;
    }
  `;

  const FRAGMENT_WAVE = `
    precision highp float;
    varying vec2 vTexCoord;
    varying vec2 vPosition;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform sampler2D u_texture;
    uniform float u_flipX;
    uniform float u_flipY;
    const float uSpeed = 1.0;
    const float uFrequency = 10.0;
    const float uWaveAmplitude = 0.05;
    vec2 sineWave(vec2 pt) {
      float x = sin(pt.y * uFrequency + 10.0 * pt.x + u_time * uSpeed) * uWaveAmplitude;
      float y = sin(pt.x * uFrequency + 5.0 * pt.y + u_time * uSpeed) * uWaveAmplitude;
      return vec2(pt.x + x, pt.y + y);
    }
    void main() {
      vec2 uv = vTexCoord;
      if (u_flipX > 0.5) uv.x = 1.0 - uv.x;
      if (u_flipY > 0.5) uv.y = 1.0 - uv.y;
      vec2 distortedUv = sineWave(uv);
      vec4 texColor = texture2D(u_texture, distortedUv);
      if (texColor.a < 0.1) {
        vec2 gridUv = distortedUv * 8.0;
        vec2 grid = abs(fract(gridUv) - 0.5);
        float checker = 1.0 - step(0.25, max(grid.x, grid.y));
        vec3 color1 = vec3(0.1, 0.3, 0.8);
        vec3 color2 = vec3(0.9, 0.6, 0.1);
        texColor = vec4(mix(color1, color2, checker), 1.0);
      }
      gl_FragColor = texColor;
    }
  `;

  // ==================== SHADER PIXELATE ====================
  const VERTEX_PIXELATE = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_uv = (a_position + 1.0) * 0.5;
      v_uv.y = 1.0 - v_uv.y;
    }
  `;

  const FRAGMENT_PIXELATE = `
    precision mediump float;
    varying vec2 v_uv;
    uniform sampler2D u_texture;
    uniform vec2 u_resolution;
    uniform float u_pixelSize;
    void main() {
      vec2 pixelSize = vec2(u_pixelSize);
      vec2 uv = v_uv;
      vec2 pixelatedUV = floor(uv * u_resolution / pixelSize) * pixelSize / u_resolution;
      vec4 color = texture2D(u_texture, pixelatedUV);
      gl_FragColor = color;
    }
  `;

  // ==================== COMPILADOR ====================
  function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('❌ Erro shader:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function createProgram(gl, vertSrc, fragSrc) {
    const vs = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
    if (!vs || !fs) return null;
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('❌ Erro link:', gl.getProgramInfoLog(program));
      return null;
    }
    return program;
  }

  function createAllPrograms(gl) {
    const programs = {};
    programs['3d'] = createProgram(gl, VERTEX_3D, FRAGMENT_3D);
    programs['sprite2d'] = createProgram(gl, VERTEX_SPRITE2D, FRAGMENT_SPRITE2D);
    programs['ui'] = createProgram(gl, VERTEX_UI, FRAGMENT_UI);
    programs['glow'] = createProgram(gl, VERTEX_GLOW, FRAGMENT_GLOW);
    programs['gl2d'] = createProgram(gl, VERTEX_GL2D, FRAGMENT_GL2D);
    programs['particles'] = createProgram(gl, VERTEX_PARTICLES, FRAGMENT_PARTICLES);
    programs['wave'] = createProgram(gl, VERTEX_WAVE, FRAGMENT_WAVE);
    programs['pixelate'] = createProgram(gl, VERTEX_PIXELATE, FRAGMENT_PIXELATE);
    console.log('✅ Shaders:', Object.keys(programs).filter(k => programs[k]).join(', '));
    return programs;
  }

  return {
    createAllPrograms,
    createProgram,
    VERTEX_3D, FRAGMENT_3D,
    VERTEX_SPRITE2D, FRAGMENT_SPRITE2D,
    VERTEX_UI, FRAGMENT_UI,
    VERTEX_GLOW, FRAGMENT_GLOW,
    VERTEX_GL2D, FRAGMENT_GL2D,
    VERTEX_PARTICLES, FRAGMENT_PARTICLES,
    VERTEX_WAVE, FRAGMENT_WAVE,
    VERTEX_PIXELATE, FRAGMENT_PIXELATE
  };
})();