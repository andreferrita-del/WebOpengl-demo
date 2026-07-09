// Modelo padrão - Cubo colorido que aparece se nenhum modelo for carregado
window.GameModel = (() => {
  console.log('📦 DefaultModel: modelo padrão ativado (cubo colorido)');

  function create(gl) {
    const parts = [];

    // Cubo principal (colorido)
    parts.push({
      mesh: Graphics.createBox(gl, 1.0, 1.0, 1.0, 0.2, 0.6, 1.0),
      baseY: 1.0,
      scaleX: 1, scaleY: 1, scaleZ: 1
    });

    // Esfera em cima (cabeça)
    parts.push({
      mesh: Graphics.createSphere(gl, 0.4, 16, 16, 0.2, 0.8, 0.4),
      baseY: 1.7,
      scaleX: 1, scaleY: 0.8, scaleZ: 1
    });

    // Olhos
    const eyeWhite = Graphics.createSphere(gl, 0.12, 8, 8, 1, 1, 1);
    const eyePupil = Graphics.createSphere(gl, 0.06, 6, 6, 0.1, 0.1, 0.1);
    
    parts.push({ mesh: eyeWhite, offsetX: -0.15, baseY: 1.78, offsetZ: 0.32, scaleX: 0.7, scaleY: 0.8, scaleZ: 0.5 });
    parts.push({ mesh: eyePupil, offsetX: -0.15, baseY: 1.8, offsetZ: 0.38, scaleX: 0.5, scaleY: 0.5, scaleZ: 0.3 });
    parts.push({ mesh: eyeWhite, offsetX: 0.15, baseY: 1.78, offsetZ: 0.32, scaleX: 0.7, scaleY: 0.8, scaleZ: 0.5 });
    parts.push({ mesh: eyePupil, offsetX: 0.15, baseY: 1.8, offsetZ: 0.38, scaleX: 0.5, scaleY: 0.5, scaleZ: 0.3 });

    // Sorriso
    const mouth = Graphics.createCylinder(gl, 0.02, 0.02, 0.15, 6, 0.1, 0.1, 0.1);
    parts.push({
      mesh: mouth,
      baseY: 1.58, offsetZ: 0.35,
      scaleX: 0.7, scaleY: 0.04, scaleZ: 0.4,
      rotX: 0.15
    });

    // Braços (cilindros)
    parts.push({
      mesh: Graphics.createCylinder(gl, 0.08, 0.06, 0.5, 8, 0.2, 0.6, 1.0),
      offsetX: -0.6, baseY: 1.1,
      rotZ: 0.3
    });
    parts.push({
      mesh: Graphics.createCylinder(gl, 0.08, 0.06, 0.5, 8, 0.2, 0.6, 1.0),
      offsetX: 0.6, baseY: 1.1,
      rotZ: -0.3
    });

    // Pernas
    parts.push({
      mesh: Graphics.createCylinder(gl, 0.12, 0.1, 0.5, 8, 0.15, 0.5, 0.8),
      offsetX: -0.2, baseY: 0.5
    });
    parts.push({
      mesh: Graphics.createCylinder(gl, 0.12, 0.1, 0.5, 8, 0.15, 0.5, 0.8),
      offsetX: 0.2, baseY: 0.5
    });

    console.log('✅ Modelo padrão criado com', parts.length, 'partes');
    return parts;
  }

  return { create };
})();