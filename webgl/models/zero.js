<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Conversor 3D → GameModel</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', sans-serif;
      background: #1a1a2e;
      color: #e0e0e0;
      min-height: 100vh;
      padding: 20px;
    }
    .container { max-width: 800px; margin: 0 auto; }
    h1 { text-align: center; color: #00ffcc; margin-bottom: 20px; }
    .card {
      background: #16213e;
      border: 1px solid #0f3460;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
    }
    .card h2 { color: #00ffcc; margin-bottom: 12px; font-size: 1.1em; }
    label { display: block; margin: 10px 0 4px; color: #aaa; font-size: 11px; text-transform: uppercase; }
    input[type="file"] {
      display: block; width: 100%; padding: 12px;
      background: #0f3460; border: 2px dashed #1a508b;
      border-radius: 8px; color: #fff; cursor: pointer;
    }
    input[type="text"], input[type="number"] {
      width: 100%; padding: 8px 12px;
      background: #0a1628; border: 1px solid #1a508b;
      border-radius: 6px; color: #fff; font-size: 13px;
    }
    .row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    button {
      display: block; width: 100%; padding: 12px;
      border: none; border-radius: 8px;
      font-size: 14px; font-weight: bold; cursor: pointer;
      margin-top: 8px; text-transform: uppercase;
    }
    .btn-convert { background: #00ffcc; color: #1a1a2e; }
    .btn-convert:hover { background: #00ccaa; }
    .btn-copy { background: #0077ff; color: white; }
    .btn-download { background: #444; color: white; }
    #status {
      padding: 10px; border-radius: 8px; margin: 12px 0;
      display: none; font-weight: bold; text-align: center;
    }
    .ok { background: #003322; color: #00ffcc; display: block; }
    .erro { background: #330000; color: #ff4444; display: block; }
    .info { background: #001a33; color: #44aaff; display: block; }
    pre {
      background: #0a0a1a; padding: 16px; border-radius: 8px;
      font-size: 11px; color: #00ffcc; max-height: 400px;
      overflow: auto; white-space: pre-wrap;
    }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px; }
    .stat { background: #0a1628; padding: 10px; border-radius: 6px; text-align: center; }
    .stat .num { font-size: 20px; color: #00ffcc; font-weight: bold; }
    .stat .lbl { font-size: 10px; color: #888; }
    #actions { display: none; margin-top: 10px; }
    #actions.show { display: block; }
    #debugLog {
      background: #0a0a1a; color: #ffaa00; font-size: 10px;
      max-height: 150px; overflow-y: auto; padding: 8px;
      border-radius: 6px; margin-top: 8px; font-family: monospace;
      white-space: pre-wrap; display: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔄 Conversor 3D → GameModel</h1>

    <div class="card">
      <h2>📁 Arquivo 3D (OBJ/STL/PLY/GLB)</h2>
      <input type="file" id="fileInput" accept=".obj,.stl,.ply,.glb">
      <div class="stats" id="stats" style="display:none;">
        <div class="stat"><div class="num" id="vOrig">0</div><div class="lbl">Vértices</div></div>
        <div class="stat"><div class="num" id="fOrig">0</div><div class="lbl">Faces</div></div>
        <div class="stat"><div class="num" id="fmt">-</div><div class="lbl">Formato</div></div>
      </div>
      <div id="debugLog"></div>
    </div>

    <div class="card">
      <h2>⚙️ Configurações</h2>
      <label>Nome do modelo:</label>
      <input type="text" id="modelName" value="MeuModelo">
      <label>Cor padrão (RGB):</label>
      <div class="row">
        <div><label>R</label><input type="number" id="colorR" value="0.7" min="0" max="1" step="0.1"></div>
        <div><label>G</label><input type="number" id="colorG" value="0.7" min="0" max="1" step="0.1"></div>
        <div><label>B</label><input type="number" id="colorB" value="0.7" min="0" max="1" step="0.1"></div>
      </div>
      <label>Escala:</label>
      <div class="row">
        <div><label>X</label><input type="number" id="scaleX" value="1.0" step="0.1"></div>
        <div><label>Y</label><input type="number" id="scaleY" value="1.0" step="0.1"></div>
        <div><label>Z</label><input type="number" id="scaleZ" value="1.0" step="0.1"></div>
      </div>
    </div>

    <button class="btn-convert" id="convertBtn">🔧 Converter</button>
    <div id="status"></div>
    <div id="actions">
      <button class="btn-copy" id="copyBtn">📋 Copiar Código</button>
      <button class="btn-download" id="downloadBtn">💾 Baixar Arquivo</button>
    </div>
    <div class="card" id="previewCard" style="display:none;">
      <h2>📄 Código Gerado</h2>
      <pre id="codePreview"></pre>
    </div>
  </div>

  <script>
    // ==================== PARSER OBJ ====================
    function parseOBJ(text) {
      const positions = [];
      const normals = [];
      const texCoords = [];
      const faces = [];
      const colors = [];
      
      const cleanText = text.replace(/\r/g, '').replace(/\t/g, ' ');
      const lines = cleanText.split('\n');
      
      let vCount = 0, vnCount = 0, vtCount = 0, fCount = 0;
      
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (line === '' || line.startsWith('#')) continue;
        
        const parts = line.split(/\s+/);
        if (parts.length === 0) continue;
        
        const type = parts[0].toLowerCase();
        
        try {
          if (type === 'v' && parts.length >= 4) {
            const x = parseFloat(parts[1]);
            const y = parseFloat(parts[2]);
            const z = parseFloat(parts[3]);
            
            if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
              positions.push([x, y, z]);
              vCount++;
              
              if (parts.length >= 7) {
                const cr = parseFloat(parts[4]);
                const cg = parseFloat(parts[5]);
                const cb = parseFloat(parts[6]);
                colors.push([!isNaN(cr)?cr:0.7, !isNaN(cg)?cg:0.7, !isNaN(cb)?cb:0.7]);
              } else {
                colors.push([0.7, 0.7, 0.7]);
              }
            }
          }
          else if (type === 'vn' && parts.length >= 4) {
            const nx = parseFloat(parts[1]);
            const ny = parseFloat(parts[2]);
            const nz = parseFloat(parts[3]);
            if (!isNaN(nx) && !isNaN(ny) && !isNaN(nz)) {
              normals.push([nx, ny, nz]);
              vnCount++;
            }
          }
          else if (type === 'vt' && parts.length >= 3) {
            const u = parseFloat(parts[1]);
            const v = parseFloat(parts[2]);
            if (!isNaN(u) && !isNaN(v)) {
              texCoords.push([u, v]);
              vtCount++;
            }
          }
          else if (type === 'f') {
            const face = [];
            for (let j = 1; j < parts.length; j++) {
              const indices = parts[j].split('/');
              const vIdx = parseInt(indices[0]);
              if (isNaN(vIdx)) continue;
              
              let v = vIdx;
              if (v > 0) v = v - 1;
              else if (v < 0) v = positions.length + v;
              else continue;
              
              let vt = -1;
              if (indices.length > 1 && indices[1] !== '') {
                const vtIdx = parseInt(indices[1]);
                if (!isNaN(vtIdx)) vt = vtIdx > 0 ? vtIdx - 1 : (vtIdx < 0 ? texCoords.length + vtIdx : -1);
              }
              
              let vn = -1;
              if (indices.length > 2 && indices[2] !== '') {
                const vnIdx = parseInt(indices[2]);
                if (!isNaN(vnIdx)) vn = vnIdx > 0 ? vnIdx - 1 : (vnIdx < 0 ? normals.length + vnIdx : -1);
              }
              
              face.push({ v, vt, vn });
            }
            
            if (face.length === 3) { faces.push(face); fCount++; }
            else if (face.length === 4) {
              faces.push([face[0], face[1], face[2]]);
              faces.push([face[0], face[2], face[3]]);
              fCount += 2;
            } else if (face.length > 4) {
              for (let j = 1; j < face.length - 1; j++) {
                faces.push([face[0], face[j], face[j + 1]]);
                fCount++;
              }
            }
          }
        } catch (err) {}
      }
      
      if (positions.length === 0) throw new Error('Nenhum vértice encontrado!');
      if (faces.length === 0) throw new Error('Nenhuma face encontrada!');
      
      if (normals.length === 0) generateNormals(positions, normals, faces);
      while (colors.length < positions.length) colors.push([0.7, 0.7, 0.7]);
      
      return { pos: positions, nrm: normals, uv: texCoords, faces, colors };
    }

    // ==================== PARSER STL ====================
    function parseSTL(text) {
      const positions = [];
      const normals = [];
      const faces = [];
      const colors = [];
      
      let currentNormal = [0, 0, 1];
      const lines = text.split('\n');
      
      for (let line of lines) {
        line = line.trim();
        
        if (line.startsWith('facet normal')) {
          const parts = line.split(/\s+/);
          currentNormal = [parseFloat(parts[2])||0, parseFloat(parts[3])||0, parseFloat(parts[4])||0];
        } else if (line.startsWith('vertex')) {
          const parts = line.split(/\s+/);
          positions.push([parseFloat(parts[1])||0, parseFloat(parts[2])||0, parseFloat(parts[3])||0]);
          colors.push([0.7, 0.7, 0.7]);
        } else if (line.startsWith('endfacet')) {
          const len = positions.length;
          if (len >= 3) {
            faces.push([
              { v: len - 3, vt: -1, vn: len - 3 },
              { v: len - 2, vt: -1, vn: len - 2 },
              { v: len - 1, vt: -1, vn: len - 1 }
            ]);
            normals.push([...currentNormal], [...currentNormal], [...currentNormal]);
          }
        }
      }
      
      if (positions.length === 0) throw new Error('STL vazio');
      return { pos: positions, nrm: normals, uv: [], faces, colors };
    }

    // ==================== PARSER PLY ====================
    function parsePLY(text) {
      const positions = [];
      const normals = [];
      const faces = [];
      const colors = [];
      
      const lines = text.split('\n');
      let header = true;
      let vertexCount = 0;
      let faceCount = 0;
      
      for (let line of lines) {
        line = line.trim();
        
        if (header) {
          if (line.startsWith('element vertex')) vertexCount = parseInt(line.split(/\s+/)[2]) || 0;
          else if (line.startsWith('element face')) faceCount = parseInt(line.split(/\s+/)[2]) || 0;
          else if (line === 'end_header') header = false;
          continue;
        }
        
        if (vertexCount > 0) {
          const parts = line.split(/\s+/).map(Number);
          if (parts.length >= 3 && !isNaN(parts[0])) {
            positions.push([parts[0], parts[1], parts[2]]);
            colors.push(parts.length >= 6 ? [parts[3]/255, parts[4]/255, parts[5]/255] : [0.7, 0.7, 0.7]);
            vertexCount--;
          }
        } else if (faceCount > 0 && line) {
          const parts = line.split(/\s+/).map(Number);
          const count = parts[0];
          if (count >= 3 && parts.length >= 4) {
            for (let i = 1; i < count - 1; i++) {
              faces.push([
                { v: parts[1], vt: -1, vn: parts[1] },
                { v: parts[1 + i], vt: -1, vn: parts[1 + i] },
                { v: parts[2 + i], vt: -1, vn: parts[2 + i] }
              ]);
            }
          }
          faceCount--;
        }
      }
      
      if (positions.length === 0) throw new Error('PLY vazio');
      generateNormals(positions, normals, faces);
      return { pos: positions, nrm: normals, uv: [], faces, colors };
    }

    // ==================== PARSER GLB ====================
    function parseGLB(arrayBuffer) {
      const view = new DataView(arrayBuffer);
      
      const magic = view.getUint32(0, true);
      if (magic !== 0x46546C67) throw new Error('GLB inválido');
      
      const version = view.getUint32(4, true);
      const totalLength = view.getUint32(8, true);
      log('📐 GLB v' + version + ', ' + (totalLength/1024).toFixed(1) + ' KB');
      
      let offset = 12;
      let jsonStr = null;
      let binBuffer = null;
      
      while (offset < totalLength) {
        const chunkLen = view.getUint32(offset, true);
        const chunkType = view.getUint32(offset + 4, true);
        const chunkData = new Uint8Array(arrayBuffer, offset + 8, chunkLen);
        
        if (chunkType === 0x4E4F534A) jsonStr = new TextDecoder().decode(chunkData);
        else if (chunkType === 0x004E4942) binBuffer = chunkData.buffer.slice(chunkData.byteOffset, chunkData.byteOffset + chunkData.byteLength);
        offset += 8 + chunkLen;
      }
      
      if (!jsonStr || !binBuffer) throw new Error('GLB incompleto');
      
      const gltf = JSON.parse(jsonStr);
      return extractGLBMesh(gltf, binBuffer);
    }

    function extractGLBMesh(gltf, binBuffer) {
      const positions = [];
      const normals = [];
      const faces = [];
      const colors = [];
      
      if (!gltf.meshes || gltf.meshes.length === 0) throw new Error('GLB sem meshes');
      
      let defaultColor = [0.7, 0.7, 0.7];
      if (gltf.materials && gltf.materials[0]?.pbrMetallicRoughness?.baseColorFactor) {
        const c = gltf.materials[0].pbrMetallicRoughness.baseColorFactor;
        defaultColor = [c[0], c[1], c[2]];
      }
      
      for (const mesh of gltf.meshes) {
        for (const prim of (mesh.primitives || [])) {
          if (prim.attributes.POSITION === undefined) continue;
          
          const posAcc = gltf.accessors[prim.attributes.POSITION];
          if (!posAcc) continue;
          
          const posView = gltf.bufferViews[posAcc.bufferView];
          if (!posView) continue;
          
          const posOffset = (posView.byteOffset || 0) + (posAcc.byteOffset || 0);
          const posData = new Float32Array(binBuffer, posOffset, posAcc.count * 3);
          
          let normData = null;
          if (prim.attributes.NORMAL !== undefined) {
            const normAcc = gltf.accessors[prim.attributes.NORMAL];
            const normView = gltf.bufferViews[normAcc.bufferView];
            if (normView) {
              const normOffset = (normView.byteOffset || 0) + (normAcc.byteOffset || 0);
              normData = new Float32Array(binBuffer, normOffset, normAcc.count * 3);
            }
          }
          
          let idxData = null;
          if (prim.indices !== undefined) {
            const idxAcc = gltf.accessors[prim.indices];
            const idxView = gltf.bufferViews[idxAcc.bufferView];
            if (idxView) {
              const idxOffset = (idxView.byteOffset || 0) + (idxAcc.byteOffset || 0);
              if (idxAcc.componentType === 5123) idxData = new Uint16Array(binBuffer, idxOffset, idxAcc.count);
              else if (idxAcc.componentType === 5125) idxData = new Uint32Array(binBuffer, idxOffset, idxAcc.count);
            }
          }
          
          let matColor = defaultColor;
          if (prim.material !== undefined && gltf.materials[prim.material]?.pbrMetallicRoughness?.baseColorFactor) {
            const c = gltf.materials[prim.material].pbrMetallicRoughness.baseColorFactor;
            matColor = [c[0], c[1], c[2]];
          }
          
          if (idxData) {
            for (let i = 0; i < idxData.length - 2; i += 3) {
              const a = idxData[i], b = idxData[i+1], c = idxData[i+2];
              if (a === undefined || b === undefined || c === undefined) continue;
              
              positions.push(
                [posData[a*3], posData[a*3+1], posData[a*3+2]],
                [posData[b*3], posData[b*3+1], posData[b*3+2]],
                [posData[c*3], posData[c*3+1], posData[c*3+2]]
              );
              
              if (normData) {
                normals.push(
                  [normData[a*3], normData[a*3+1], normData[a*3+2]],
                  [normData[b*3], normData[b*3+1], normData[b*3+2]],
                  [normData[c*3], normData[c*3+1], normData[c*3+2]]
                );
              }
              
              colors.push(matColor, matColor, matColor);
              
              const base = positions.length - 3;
              faces.push([
                {v: base, vt: -1, vn: base},
                {v: base+1, vt: -1, vn: base+1},
                {v: base+2, vt: -1, vn: base+2}
              ]);
            }
          }
        }
      }
      
      if (positions.length === 0) throw new Error('GLB sem vértices');
      if (normals.length === 0) generateNormals(positions, normals, faces);
      
      return { pos: positions, nrm: normals, uv: [], faces, colors };
    }

    // ==================== GERADOR DE NORMAIS ====================
    function generateNormals(positions, normals, faces) {
      const vertexNormals = Array(positions.length).fill().map(() => [0, 0, 0]);
      
      for (const face of faces) {
        const a = positions[face[0].v];
        const b = positions[face[1].v];
        const c = positions[face[2].v];
        if (!a || !b || !c) continue;
        
        const edge1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
        const edge2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
        
        const normal = [
          edge1[1] * edge2[2] - edge1[2] * edge2[1],
          edge1[2] * edge2[0] - edge1[0] * edge2[2],
          edge1[0] * edge2[1] - edge1[1] * edge2[0]
        ];
        
        const length = Math.sqrt(normal[0] ** 2 + normal[1] ** 2 + normal[2] ** 2) || 1;
        normal[0] /= length; normal[1] /= length; normal[2] /= length;
        
        for (const vertex of face) {
          if (vertex.v >= 0 && vertex.v < vertexNormals.length) {
            vertexNormals[vertex.v][0] += normal[0];
            vertexNormals[vertex.v][1] += normal[1];
            vertexNormals[vertex.v][2] += normal[2];
          }
        }
      }
      
      vertexNormals.forEach(n => {
        const length = Math.sqrt(n[0] ** 2 + n[1] ** 2 + n[2] ** 2) || 1;
        n[0] /= length; n[1] /= length; n[2] /= length;
      });
      
      normals.length = 0;
      normals.push(...vertexNormals);
      faces.forEach(face => face.forEach(vertex => { if (vertex.v >= 0) vertex.vn = vertex.v; }));
    }

    // ==================== INTERFACE ====================
    const fileInput = document.getElementById('fileInput');
    const convertBtn = document.getElementById('convertBtn');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const statusDiv = document.getElementById('status');
    const previewCard = document.getElementById('previewCard');
    const codePreview = document.getElementById('codePreview');
    const actions = document.getElementById('actions');
    const debugLog = document.getElementById('debugLog');

    let currentData = null;
    let generatedCode = '';

    function log(msg) {
      debugLog.style.display = 'block';
      debugLog.textContent += msg + '\n';
      debugLog.scrollTop = debugLog.scrollHeight;
      console.log(msg);
    }

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      debugLog.textContent = '';
      debugLog.style.display = 'block';
      
      log('📂 Arquivo: ' + file.name);
      log('📏 Tamanho: ' + (file.size / 1024).toFixed(1) + ' KB');
      
      showStatus('🔍 Analisando arquivo...', 'info');
      
      try {
        const ext = file.name.split('.').pop().toLowerCase();
        let data;
        
        if (ext === 'glb') {
          log('✅ Detectado: GLB (binário)');
          const arrayBuffer = await file.arrayBuffer();
          data = parseGLB(arrayBuffer);
          document.getElementById('fmt').textContent = 'GLB';
        } else {
          const text = await file.text();
          const head = text.substring(0, 200).trim();
          log('📄 Primeiros 200 caracteres:');
          log(head);
          
          if (head.match(/^v\s/m) || head.match(/\nv\s/m) || head.startsWith('v ')) {
            log('✅ Detectado: OBJ');
            data = parseOBJ(text);
            document.getElementById('fmt').textContent = 'OBJ';
          } else if (head.startsWith('solid ') || head.includes('facet normal')) {
            log('✅ Detectado: STL');
            data = parseSTL(text);
            document.getElementById('fmt').textContent = 'STL';
          } else if (head.startsWith('ply')) {
            log('✅ Detectado: PLY');
            data = parsePLY(text);
            document.getElementById('fmt').textContent = 'PLY';
          } else if (ext === 'obj') {
            log('⚠️ Forçando OBJ pela extensão...');
            data = parseOBJ(text);
            document.getElementById('fmt').textContent = 'OBJ (forçado)';
          } else {
            throw new Error('Formato não reconhecido. Use OBJ, STL, PLY ou GLB.');
          }
        }
        
        if (!data || data.pos.length === 0) throw new Error('Nenhum vértice encontrado!');
        
        currentData = data;
        
        document.getElementById('vOrig').textContent = data.pos.length;
        document.getElementById('fOrig').textContent = data.faces.length;
        document.getElementById('stats').style.display = 'grid';
        
        const suggestedName = file.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');
        document.getElementById('modelName').value = suggestedName || 'MeuModelo';
        
        previewCard.style.display = 'none';
        actions.classList.remove('show');
        generatedCode = '';
        
        showStatus('✅ ' + data.pos.length + ' vértices, ' + data.faces.length + ' faces', 'ok');
        log('✅ Sucesso! ' + data.pos.length + ' vértices, ' + data.faces.length + ' faces');
        
      } catch (err) {
        log('❌ ERRO: ' + err.message);
        showStatus('❌ ' + err.message, 'erro');
        currentData = null;
        document.getElementById('stats').style.display = 'none';
      }
    });

    convertBtn.addEventListener('click', () => {
      if (!currentData) { showStatus('❌ Carregue um arquivo primeiro!', 'erro'); return; }

      try {
        const name = document.getElementById('modelName').value.trim() || 'modelo';
        const r = parseFloat(document.getElementById('colorR').value) || 0.7;
        const g = parseFloat(document.getElementById('colorG').value) || 0.7;
        const b = parseFloat(document.getElementById('colorB').value) || 0.7;
        const sx = parseFloat(document.getElementById('scaleX').value) || 1;
        const sy = parseFloat(document.getElementById('scaleY').value) || 1;
        const sz = parseFloat(document.getElementById('scaleZ').value) || 1;

        log('🔧 Gerando código...');
        
        generatedCode = `// Modelo: ${name}\n// Vértices: ${currentData.pos.length} | Faces: ${currentData.faces.length}\nwindow.GameModel = (() => {\n  function create(gl) {\n    const parts = [];\n    const pos = ${JSON.stringify(currentData.pos)};\n    const nrm = ${JSON.stringify(currentData.nrm)};\n    const faces = ${JSON.stringify(currentData.faces)};\n    const verts = [];\n    for (const f of faces) for (const v of f) {\n      const p = pos[v.v];\n      verts.push(p[0]*${sx}, p[1]*${sy}, p[2]*${sz});\n      if (v.vn >= 0 && v.vn < nrm.length) {\n        const n = nrm[v.vn];\n        verts.push(n[0], n[1], n[2]);\n      } else {\n        verts.push(0, 1, 0);\n      }\n      verts.push(${r.toFixed(3)}, ${g.toFixed(3)}, ${b.toFixed(3)}, 0, 0);\n    }\n    const buf = gl.createBuffer();\n    gl.bindBuffer(gl.ARRAY_BUFFER, buf);\n    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);\n    parts.push({\n      mesh: {\n        buffer: buf,\n        count: verts.length / 11,\n        stride: 44,\n        posOffset: 0,\n        normOffset: 12,\n        colOffset: 24,\n        texOffset: 36\n      },\n      baseY: 1\n    });\n    return parts;\n  }\n  return { create };\n})();`;

        codePreview.textContent = generatedCode;
        previewCard.style.display = 'block';
        actions.classList.add('show');
        showStatus('✅ Convertido!', 'ok');

        const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
        const blob = new Blob([generatedCode], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = safeName + '.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        log('✅ Download: ' + safeName + '.js');
        
      } catch (err) {
        showStatus('❌ Erro: ' + err.message, 'erro');
        log('❌ ' + err.message);
      }
    });

    copyBtn.addEventListener('click', async () => {
      if (!generatedCode) { showStatus('❌ Nada para copiar!', 'erro'); return; }

      try {
        await navigator.clipboard.writeText(generatedCode);
        showStatus('✅ Copiado!', 'ok');
        return;
      } catch (e) {}

      const textarea = document.createElement('textarea');
      textarea.value = generatedCode;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      
      try {
        document.execCommand('copy');
        showStatus('✅ Copiado! (fallback)', 'ok');
      } catch (e) {
        showStatus('❌ Falha ao copiar. Selecione o código e use Ctrl+C.', 'erro');
      }
      
      document.body.removeChild(textarea);
    });

    downloadBtn.addEventListener('click', () => {
      if (!generatedCode) { showStatus('❌ Nada para baixar!', 'erro'); return; }
      
      const name = document.getElementById('modelName').value.trim().replace(/[^a-zA-Z0-9_-]/g, '_') || 'modelo';
      const blob = new Blob([generatedCode], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name + '.js';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showStatus('💾 Baixado!', 'ok');
    });

    function showStatus(msg, type) {
      statusDiv.textContent = msg;
      statusDiv.className = type;
      statusDiv.style.display = 'block';
    }
  </script>
</body>
</html>