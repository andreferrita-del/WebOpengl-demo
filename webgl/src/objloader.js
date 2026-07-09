// webgl/src/objLoader.js
// Parser Universal de Arquivos 3D - CORRIGIDO (compatível com todos os navegadores)

const OBJLoader = (() => {
  console.log('📦 OBJLoader: parser universal (corrigido)');

  // ==================== BOUNDING BOX ====================
  function calculateBoundingBox(pos) {
    if (!pos || pos.length === 0) return { center: [0, 0, 0], size: [1, 1, 1], min: [0, 0, 0], max: [0, 0, 0] };
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (const p of pos) {
      if (p[0] < minX) minX = p[0];
      if (p[1] < minY) minY = p[1];
      if (p[2] < minZ) minZ = p[2];
      if (p[0] > maxX) maxX = p[0];
      if (p[1] > maxY) maxY = p[1];
      if (p[2] > maxZ) maxZ = p[2];
    }
    return {
      center: [(minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2],
      min: [minX, minY, minZ],
      max: [maxX, maxY, maxZ],
      size: [maxX - minX, maxY - minY, maxZ - minZ]
    };
  }

  // ==================== GLB PARSER ====================
  function parseGLB(arrayBuffer) {
    try {
      const view = new DataView(arrayBuffer);
      const magic = view.getUint32(0, true);
      if (magic !== 0x46546C67) {
        console.error('❌ GLB inválido');
        return null;
      }
      const version = view.getUint32(4, true);
      const totalLength = view.getUint32(8, true);
      console.log('📐 GLB v' + version + ', ' + (totalLength / 1024).toFixed(1) + ' KB');
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
      if (!jsonStr || !binBuffer) {
        console.error('❌ GLB incompleto');
        return null;
      }
      const result = parseGLBMeshData(JSON.parse(jsonStr), binBuffer);
      if (result && result.pos && result.pos.length > 0) {
        result.boundingBox = calculateBoundingBox(result.pos);
      }
      return result;
    } catch (err) {
      console.error('❌ Erro GLB:', err.message);
      return null;
    }
  }

  function parseGLBMeshData(gltf, binBuffer) {
    const positions = [];
    const normals = [];
    const faces = [];
    const colors = [];
    if (!gltf.meshes || gltf.meshes.length === 0) return { pos: [], nrm: [], faces: [], colors: [] };
    let defaultColor = [0.7, 0.7, 0.7];
    if (gltf.materials?.[0]?.pbrMetallicRoughness?.baseColorFactor) {
      const c = gltf.materials[0].pbrMetallicRoughness.baseColorFactor;
      defaultColor = [c[0], c[1], c[2]];
    }
    for (const mesh of gltf.meshes) {
      for (const prim of (mesh.primitives || [])) {
        if (prim.attributes.POSITION === undefined) continue;
        const posAcc = gltf.accessors[prim.attributes.POSITION];
        if (!posAcc) continue;
        const posData = getAccessorData(gltf, posAcc, binBuffer);
        if (!posData || posData.length === 0) continue;
        let normData = null;
        if (prim.attributes.NORMAL !== undefined) {
          const normAcc = gltf.accessors[prim.attributes.NORMAL];
          if (normAcc) normData = getAccessorData(gltf, normAcc, binBuffer);
        }
        let idxData = null;
        if (prim.indices !== undefined) {
          const idxAcc = gltf.accessors[prim.indices];
          if (idxAcc) idxData = getAccessorData(gltf, idxAcc, binBuffer);
        }
        let primColor = defaultColor;
        if (prim.material !== undefined && gltf.materials?.[prim.material]?.pbrMetallicRoughness?.baseColorFactor) {
          const c = gltf.materials[prim.material].pbrMetallicRoughness.baseColorFactor;
          primColor = [c[0], c[1], c[2]];
        }
        if (idxData && idxData.length >= 3) {
          for (let i = 0; i < idxData.length - 2; i += 3) {
            const a = idxData[i], b = idxData[i + 1], c = idxData[i + 2];
            if (a === undefined || b === undefined || c === undefined) continue;
            const a3 = a * 3, b3 = b * 3, c3 = c * 3;
            if (a3 + 2 >= posData.length || b3 + 2 >= posData.length || c3 + 2 >= posData.length) continue;
            positions.push([posData[a3], posData[a3 + 1], posData[a3 + 2]], [posData[b3], posData[b3 + 1], posData[b3 + 2]], [posData[c3], posData[c3 + 1], posData[c3 + 2]]);
            if (normData && normData.length >= Math.max(a3, b3, c3) + 3) {
              normals.push([normData[a3], normData[a3 + 1], normData[a3 + 2]], [normData[b3], normData[b3 + 1], normData[b3 + 2]], [normData[c3], normData[c3 + 1], normData[c3 + 2]]);
            }
            colors.push(primColor, primColor, primColor);
            const base = positions.length - 3;
            faces.push([{ v: base, vt: -1, vn: base }, { v: base + 1, vt: -1, vn: base + 1 }, { v: base + 2, vt: -1, vn: base + 2 }]);
          }
        }
      }
    }
    if (positions.length === 0) return { pos: [], nrm: [], faces: [], colors: [] };
    if (normals.length === 0 || normals.length !== positions.length) {
      normals.length = 0;
      genNormals(positions, normals, faces);
    }
    console.log('✅ GLB: ' + positions.length + ' vértices, ' + faces.length + ' faces');
    return { pos: positions, nrm: normals, faces, colors };
  }

  // ==================== ACESSOR DE DADOS (CORRIGIDO) ====================
  function getAccessorData(gltf, accessor, binBuffer) {
    if (!binBuffer) return null;
    const bufferView = gltf.bufferViews[accessor.bufferView];
    if (!bufferView) return null;
    const byteOffset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
    const count = accessor.count;
    let numComponents = 3;
    switch (accessor.type) {
      case 'SCALAR': numComponents = 1; break;
      case 'VEC2': numComponents = 2; break;
      case 'VEC3': numComponents = 3; break;
      case 'VEC4': numComponents = 4; break;
      case 'MAT2': numComponents = 4; break;
      case 'MAT3': numComponents = 9; break;
      case 'MAT4': numComponents = 16; break;
    }
    const totalElements = count * numComponents;
    const data = [];
    try {
      switch (accessor.componentType) {
        case 5120: { const arr = new Int8Array(binBuffer, byteOffset, totalElements); for (let i = 0; i < totalElements; i++) data.push(arr[i]); break; }
        case 5121: { const arr = new Uint8Array(binBuffer, byteOffset, totalElements); for (let i = 0; i < totalElements; i++) data.push(arr[i]); break; }
        case 5122: { const arr = new Int16Array(binBuffer, byteOffset, totalElements); for (let i = 0; i < totalElements; i++) data.push(arr[i]); break; }
        case 5123: { const arr = new Uint16Array(binBuffer, byteOffset, totalElements); for (let i = 0; i < totalElements; i++) data.push(arr[i]); break; }
        case 5125: { const arr = new Uint32Array(binBuffer, byteOffset, totalElements); for (let i = 0; i < totalElements; i++) data.push(arr[i]); break; }
        case 5126: { const arr = new Float32Array(binBuffer, byteOffset, totalElements); for (let i = 0; i < totalElements; i++) data.push(arr[i]); break; }
        default: console.warn('⚠️ Tipo de componente não suportado:', accessor.componentType); return null;
      }
    } catch (e) {
      console.error('❌ Erro ao acessar dados:', e.message);
      return null;
    }
    return data;
  }

  // ==================== DEMAIS PARSERS E UTILITÁRIOS (mantidos iguais) ====================
  function parseOBJ(text) {
    const pos = [], nrm = [], uv = [], faces = [], colors = [];
    for (let line of text.replace(/\r/g, '').split('\n')) {
      line = line.trim();
      if (!line || line[0] === '#') continue;
      const p = line.split(/[\s\t]+/);
      try {
        if (p[0] === 'v' && p.length >= 4) {
          pos.push([+p[1]||0, +p[2]||0, +p[3]||0]);
          colors.push(p.length >= 7 ? [+p[4]||0.7, +p[5]||0.7, +p[6]||0.7] : [0.7, 0.7, 0.7]);
        } else if (p[0] === 'vn' && p.length >= 4) nrm.push([+p[1]||0, +p[2]||0, +p[3]||0]);
        else if (p[0] === 'vt' && p.length >= 3) uv.push([+p[1]||0, +p[2]||0]);
        else if (p[0] === 'f') {
          const face = [];
          for (let i = 1; i < p.length; i++) {
            const idx = p[i].split('/');
            const vi = parseInt(idx[0]) || 0;
            const v = vi > 0 ? vi - 1 : (vi < 0 ? pos.length + vi : 0);
            let vt = -1, vn = -1;
            if (idx.length > 1 && idx[1] !== '') { const vti = parseInt(idx[1]); if (!isNaN(vti)) vt = vti > 0 ? vti - 1 : -1; }
            if (idx.length > 2 && idx[2] !== '') { const vni = parseInt(idx[2]); if (!isNaN(vni)) vn = vni > 0 ? vni - 1 : -1; }
            face.push({ v, vt, vn });
          }
          if (face.length === 3) faces.push(face);
          else if (face.length === 4) { faces.push([face[0], face[1], face[2]]); faces.push([face[0], face[2], face[3]]); }
          else if (face.length > 4) for (let i = 1; i < face.length - 1; i++) faces.push([face[0], face[i], face[i + 1]]);
        }
      } catch (e) {}
    }
    if (!pos.length) return null;
    if (!nrm.length) genNormals(pos, nrm, faces);
    while (colors.length < pos.length) colors.push([0.7, 0.7, 0.7]);
    const result = { pos, nrm, uv, faces, colors };
    result.boundingBox = calculateBoundingBox(pos);
    return result;
  }

  function parseSTL(text) {
    const pos = [], nrm = [], faces = [], colors = [];
    let cn = [0, 0, 1];
    for (let line of text.split('\n')) {
      line = line.trim();
      if (line.startsWith('facet normal')) { const p = line.split(/\s+/); cn = [+p[2]||0, +p[3]||0, +p[4]||0]; }
      else if (line.startsWith('vertex')) { const p = line.split(/\s+/); pos.push([+p[1]||0, +p[2]||0, +p[3]||0]); colors.push([0.7, 0.7, 0.7]); }
      else if (line.startsWith('endfacet')) { const l = pos.length; if (l >= 3) { faces.push([{v:l-3,vt:-1,vn:l-3},{v:l-2,vt:-1,vn:l-2},{v:l-1,vt:-1,vn:l-1}]); nrm.push([...cn],[...cn],[...cn]); } }
    }
    if (!pos.length) return null;
    const result = { pos, nrm, uv: [], faces, colors };
    result.boundingBox = calculateBoundingBox(pos);
    return result;
  }

  function parsePLY(text) {
    const pos = [], nrm = [], faces = [], colors = [];
    const lines = text.split('\n'); let h = true, vc = 0, fc = 0;
    for (let line of lines) {
      line = line.trim();
      if (h) { if (line.startsWith('element vertex')) vc = +line.split(/\s+/)[2]||0; else if (line.startsWith('element face')) fc = +line.split(/\s+/)[2]||0; else if (line === 'end_header') h = false; continue; }
      if (vc > 0) { const p = line.split(/\s+/).map(Number); if (p.length >= 3 && !isNaN(p[0])) { pos.push([p[0],p[1],p[2]]); colors.push(p.length >= 6 ? [p[3]/255,p[4]/255,p[5]/255] : [0.7,0.7,0.7]); vc--; } }
      else if (fc > 0 && line) { const p = line.split(/\s+/).map(Number); if (p[0] >= 3 && p.length >= 4) { for (let i = 1; i < p[0] - 1; i++) faces.push([{v:p[1],vt:-1,vn:p[1]},{v:p[1+i],vt:-1,vn:p[1+i]},{v:p[2+i],vt:-1,vn:p[2+i]}]); } fc--; }
    }
    if (!pos.length) return null;
    genNormals(pos, nrm, faces);
    const result = { pos, nrm, uv: [], faces, colors };
    result.boundingBox = calculateBoundingBox(pos);
    return result;
  }

  function genNormals(pos, nrm, faces) {
    const vn = Array(pos.length).fill().map(() => [0,0,0]);
    for (const f of faces) {
      const a = pos[f[0].v], b = pos[f[1].v], c = pos[f[2].v];
      if (!a || !b || !c) continue;
      const e1 = [b[0]-a[0], b[1]-a[1], b[2]-a[2]], e2 = [c[0]-a[0], c[1]-a[1], c[2]-a[2]];
      const n = [e1[1]*e2[2]-e1[2]*e2[1], e1[2]*e2[0]-e1[0]*e2[2], e1[0]*e2[1]-e1[1]*e2[0]];
      const l = Math.sqrt(n[0]**2+n[1]**2+n[2]**2)||1; n[0]/=l; n[1]/=l; n[2]/=l;
      for (const v of f) { if (v.v >= 0 && v.v < vn.length) { vn[v.v][0] += n[0]; vn[v.v][1] += n[1]; vn[v.v][2] += n[2]; } }
    }
    vn.forEach(n => { const l = Math.sqrt(n[0]**2+n[1]**2+n[2]**2)||1; n[0]/=l; n[1]/=l; n[2]/=l; });
    nrm.length = 0; nrm.push(...vn);
    faces.forEach(f => f.forEach(v => { if (v.v >= 0) v.vn = v.v; }));
  }

  function normalizeScale(data) {
    if (!data.pos || data.pos.length === 0) return;
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (const p of data.pos) {
      if (p[0] < minX) minX = p[0];
      if (p[1] < minY) minY = p[1];
      if (p[2] < minZ) minZ = p[2];
      if (p[0] > maxX) maxX = p[0];
      if (p[1] > maxY) maxY = p[1];
      if (p[2] > maxZ) maxZ = p[2];
    }
    const sizeX = maxX - minX;
    const sizeY = maxY - minY;
    const sizeZ = maxZ - minZ;
    const maxSize = Math.max(sizeX, sizeY, sizeZ, 0.001);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const centerZ = (minZ + maxZ) / 2;
    const scale = 2.0 / maxSize;
    for (const p of data.pos) {
      p[0] = (p[0] - centerX) * scale;
      p[1] = (p[1] - centerY) * scale;
      p[2] = (p[2] - centerZ) * scale;
    }
    console.log('📏 Modelo normalizado: tamanho', maxSize.toFixed(2), '→ escala', scale.toFixed(3));
  }

  function createMeshFromData(gl, data, defaultColor) {
    if (!data || !data.pos || data.pos.length === 0) return null;
    normalizeScale(data);
    const verts = [];
    const r = defaultColor[0], g = defaultColor[1], b = defaultColor[2];
    const hasColors = data.colors && data.colors.length === data.pos.length;
    for (const f of data.faces) {
      for (const v of f) {
        const p = data.pos[v.v];
        if (!p) continue;
        verts.push(p[0], p[1], p[2]);
        if (v.vn >= 0 && v.vn < data.nrm.length) {
          const n = data.nrm[v.vn]; verts.push(n[0], n[1], n[2]);
        } else verts.push(0, 1, 0);
        if (hasColors && v.v < data.colors.length) {
          const c = data.colors[v.v]; verts.push(c[0], c[1], c[2]);
        } else verts.push(r, g, b);
        verts.push(0, 0);
      }
    }
    if (verts.length === 0) return null;
    console.log('📦 Mesh criada: ' + (verts.length / 11) + ' vértices');
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    return { buffer: buf, count: verts.length / 11, stride: 44, posOffset: 0, normOffset: 12, colOffset: 24, texOffset: 36 };
  }

  function autoDetectAndParse(input, fileName) {
    if (input instanceof ArrayBuffer) return parseGLB(input);
    const text = input;
    const ext = (fileName || '').split('.').pop().toLowerCase();
    if (ext === 'obj' || text.match(/^v\s/m)) return parseOBJ(text);
    if (ext === 'stl' || text.includes('facet normal')) return parseSTL(text);
    if (ext === 'ply' || text.startsWith('ply')) return parsePLY(text);
    try { return parseOBJ(text); } catch(e) {}
    try { return parseSTL(text); } catch(e) {}
    console.error('❌ Formato não reconhecido');
    return { pos: [], nrm: [], faces: [], colors: [] };
  }

  return {
    parseGLB, parseOBJ, parseSTL, parsePLY,
    autoDetectAndParse, createMeshFromData,
    calculateBoundingBox
  };
})();