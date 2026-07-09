const Loader = (() => {
  console.log('📝 Loader: usando shaders inline');
  
  function createProgram(gl) {
    const program = Shaders.createProgram(gl, Shaders.VERTEX_3D, Shaders.FRAGMENT_3D);
    if (program) console.log('✅ Shader 3D compilado');
    return program;
  }
  
  function createAllPrograms(gl) {
    return Shaders.createAllPrograms(gl);
  }
  
  function createPixelTexture(gl) {
    const s = 16;
    const data = new Uint8Array(s*s*4);
    for (let i = 0; i < s*s*4; i+=4) {
      const v = 180 + Math.floor(Math.random()*75);
      data[i]=data[i+1]=data[i+2]=v; data[i+3]=255;
    }
    return GL.createTexture(s, s, data);
  }
  
  function createMetalTexture(gl) {
    const s = 8;
    const data = new Uint8Array(s*s*4);
    for (let y=0; y<s; y++) for (let x=0; x<s; x++) {
      const i = (y*s+x)*4;
      const v = (x+y)%2===0 ? 200 : 120;
      data[i]=data[i+1]=data[i+2]=v; data[i+3]=255;
    }
    return GL.createTexture(s, s, data);
  }
  
  return { createProgram, createAllPrograms, createPixelTexture, createMetalTexture };
})();