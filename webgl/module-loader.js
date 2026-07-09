(function() {
  const BASE_SRC = 'webgl/src/';
  const BASE_MODELS = 'webgl/models/';
  const BASE_2DMODELS = 'webgl/2Dmodels/';

  const coreModules = [
    'gl.js',
    'shaders.js',
    'loader.js',
    'graphics.js',
    'objLoader.js',
    'input.js',
    'sprite2D.js',
    'gl2d.js',
    'render.js',
    'defaultModel.js',
    'logoOpengl.js'            // ← logo carregada como módulo principal
  ];

  const canvas = document.getElementById('glCanvas');
  let loadedCount = 0;
  let totalModules = coreModules.length + 1; // + main

  function loadScript(src) {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src + '?t=' + Date.now();
      script.onload = () => {
        loadedCount++;
        console.log(`✅ [${loadedCount}/${totalModules}] ${src}`);
        resolve();
      };
      script.onerror = () => {
        console.warn(`⚠️ Não encontrado: ${src}`);
        resolve();
      };
      document.body.appendChild(script);
    });
  }

  function loadGLBviaFileInput(filename) {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.glb';
      input.style.display = 'none';
      document.body.appendChild(input);

      const loading = document.getElementById('loading');
      if (loading) {
        loading.textContent = '📂 Selecione o arquivo: ' + filename;
        loading.style.display = 'block';
        loading.style.cursor = 'pointer';
        loading.style.color = '#00ffcc';
        loading.style.border = '2px solid #00ffcc';
        loading.style.padding = '15px 30px';
        loading.style.fontSize = '16px';
        loading.onclick = () => input.click();
      }

      setTimeout(() => input.click(), 500);

      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) {
          if (loading) {
            loading.textContent = '⚠️ Nenhum arquivo. Usando modelo padrão...';
            loading.style.cursor = 'default';
            loading.style.border = 'none';
            loading.style.color = '#ffaa00';
            setTimeout(() => { loading.style.display = 'none'; }, 2000);
          }
          resolve(null);
          return;
        }

        const reader = new FileReader();
        reader.onload = (re) => {
          if (loading) {
            loading.textContent = '✅ ' + file.name + ' carregado!';
            loading.style.cursor = 'default';
            loading.style.border = 'none';
            loading.style.color = '#00ffcc';
            setTimeout(() => { loading.style.display = 'none'; }, 1500);
          }
          resolve(re.target.result);
        };
        reader.onerror = () => {
          if (loading) loading.style.display = 'none';
          resolve(null);
        };
        reader.readAsArrayBuffer(file);
      };
    });
  }

  async function loadGLBFile(basePath, filename) {
    try {
      const resp = await fetch(basePath + filename);
      if (resp.ok) {
        const data = await resp.arrayBuffer();
        console.log('✅ GLB carregado via fetch:', filename);
        return data;
      }
    } catch(e) {}

    return await loadGLBviaFileInput(filename);
  }

  function getParams() {
    return new URLSearchParams(window.location.search);
  }

  async function loadAllModules() {
    console.log('🚀 Iniciando carregamento...');

    try {
      // 1. Carregar TODOS os módulos principais (inclui a logo)
      for (const mod of coreModules) {
        await loadScript(BASE_SRC + mod);
      }

      const params = getParams();

      // 2. Modelo 3D (opcional)
      const model3D = params.get('model') || localStorage.getItem('currentModel3D');
      if (model3D) {
        totalModules++;
        console.log('🎯 Modelo 3D:', model3D);
        const ext = model3D.split('.').pop().toLowerCase();
        if (ext === 'glb') {
          const glbData = await loadGLBFile(BASE_MODELS, model3D);
          if (glbData) window.__glbData = glbData;
        } else if (ext === 'js') {
          await loadScript(BASE_MODELS + model3D);
        }
      }

      // 3. Modelo 2D (opcional)
      const model2D = params.get('2dmodel') || localStorage.getItem('currentModel2D');
      if (model2D) {
        totalModules++;
        console.log('🎯 Modelo 2D:', model2D);
        const ext = model2D.split('.').pop().toLowerCase();
        if (ext === 'glb') {
          const glb2DData = await loadGLBFile(BASE_2DMODELS, model2D);
          if (glb2DData) window.__glb2DData = glb2DData;
        } else if (ext === 'js') {
          await loadScript(BASE_2DMODELS + model2D);
        }
      }

      // 4. Main.js
      await loadScript(BASE_SRC + 'main.js');

      console.log('✅ Engine pronta!');
      const loading = document.getElementById('loading');
      if (loading) loading.style.display = 'none';
      canvas.style.display = 'block';

    } catch (err) {
      console.error('❌ Erro fatal:', err);
      const loading = document.getElementById('loading');
      if (loading) {
        loading.textContent = 'Erro: ' + err.message;
        loading.style.color = '#ff4444';
      }
    }
  }

  loadAllModules();
})();