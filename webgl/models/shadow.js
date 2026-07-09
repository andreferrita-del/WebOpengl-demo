// Modelo Shadow the Hedgehog - Animação Idle Independente
window.GameModel = (() => {
  console.log('🖤 Shadow: animação idle independente');

  function create(gl) {
    const parts = [];
    let time = 0;

    // ==================== CORES ====================
    const blackFur = [0.08, 0.05, 0.08];
    const white = [0.95, 0.95, 0.95];
    const skin = [1.0, 0.82, 0.65];
    const shoeRed = [0.9, 0.05, 0.05];

    // ==================== CABEÇA ====================
    parts.push({
      mesh: Graphics.createSphere(gl, 0.38, 20, 20, blackFur[0], blackFur[1], blackFur[2]),
      baseY: 1.65, offsetX: 0, offsetZ: 0,
      scaleX: 1.0, scaleY: 0.85, scaleZ: 0.9
    });

    // Espinhos (3 atrás)
    for (let i = -1; i <= 1; i++) {
      parts.push({
        mesh: Graphics.createCylinder(gl, 0.04, 0.12, 0.45, 6, blackFur[0], blackFur[1], blackFur[2]),
        baseY: 1.9, offsetX: i * 0.12, offsetZ: -0.2,
        rotX: -0.4, rotY: i * 0.25
      });
    }

    // Olhos
    const eyeWhite = Graphics.createSphere(gl, 0.09, 8, 8, white[0], white[1], white[2]);
    const eyeRed = Graphics.createSphere(gl, 0.04, 6, 6, [0.8, 0.1, 0.1]);
    parts.push({ mesh: eyeWhite, offsetX: -0.1, baseY: 1.72, offsetZ: 0.3, scaleX: 0.6, scaleY: 0.7, scaleZ: 0.4 });
    parts.push({ mesh: eyeRed, offsetX: -0.1, baseY: 1.73, offsetZ: 0.34, scaleX: 0.4, scaleY: 0.5, scaleZ: 0.2 });
    parts.push({ mesh: eyeWhite, offsetX: 0.1, baseY: 1.72, offsetZ: 0.3, scaleX: 0.6, scaleY: 0.7, scaleZ: 0.4 });
    parts.push({ mesh: eyeRed, offsetX: 0.1, baseY: 1.73, offsetZ: 0.34, scaleX: 0.4, scaleY: 0.5, scaleZ: 0.2 });

    // ==================== CORPO ====================
    parts.push({
      mesh: Graphics.createCylinder(gl, 0.22, 0.18, 0.5, 12, blackFur[0], blackFur[1], blackFur[2]),
      baseY: 1.05, offsetX: 0, offsetZ: 0
    });

    // Peito branco
    parts.push({
      mesh: Graphics.createSphere(gl, 0.15, 8, 8, white[0], white[1], white[2]),
      baseY: 1.1, offsetZ: 0.12,
      scaleX: 0.6, scaleY: 0.5, scaleZ: 0.35
    });

    // ==================== BRAÇOS ====================
    // Esquerdo
    parts.push({ mesh: Graphics.createCylinder(gl, 0.07, 0.06, 0.32, 8, blackFur[0], blackFur[1], blackFur[2]), baseY: 1.15, offsetX: -0.28, offsetZ: 0 });
    parts.push({ mesh: Graphics.createCylinder(gl, 0.06, 0.05, 0.28, 8, skin[0], skin[1], skin[2]), baseY: 0.88, offsetX: -0.32, offsetZ: 0 });
    parts.push({ mesh: Graphics.createSphere(gl, 0.07, 6, 6, white[0], white[1], white[2]), baseY: 0.68, offsetX: -0.34, offsetZ: 0 });

    // Direito
    parts.push({ mesh: Graphics.createCylinder(gl, 0.07, 0.06, 0.32, 8, blackFur[0], blackFur[1], blackFur[2]), baseY: 1.15, offsetX: 0.28, offsetZ: 0 });
    parts.push({ mesh: Graphics.createCylinder(gl, 0.06, 0.05, 0.28, 8, skin[0], skin[1], skin[2]), baseY: 0.88, offsetX: 0.32, offsetZ: 0 });
    parts.push({ mesh: Graphics.createSphere(gl, 0.07, 6, 6, white[0], white[1], white[2]), baseY: 0.68, offsetX: 0.34, offsetZ: 0 });

    // ==================== PERNAS ====================
    parts.push({ mesh: Graphics.createCylinder(gl, 0.09, 0.08, 0.35, 8, blackFur[0], blackFur[1], blackFur[2]), baseY: 0.55, offsetX: -0.14, offsetZ: 0 });
    parts.push({ mesh: Graphics.createCylinder(gl, 0.08, 0.07, 0.35, 8, blackFur[0], blackFur[1], blackFur[2]), baseY: 0.25, offsetX: -0.14, offsetZ: 0 });
    parts.push({ mesh: Graphics.createBox(gl, 0.14, 0.07, 0.22, shoeRed[0], shoeRed[1], shoeRed[2]), baseY: 0.05, offsetX: -0.14, offsetZ: 0.06 });

    parts.push({ mesh: Graphics.createCylinder(gl, 0.09, 0.08, 0.35, 8, blackFur[0], blackFur[1], blackFur[2]), baseY: 0.55, offsetX: 0.14, offsetZ: 0 });
    parts.push({ mesh: Graphics.createCylinder(gl, 0.08, 0.07, 0.35, 8, blackFur[0], blackFur[1], blackFur[2]), baseY: 0.25, offsetX: 0.14, offsetZ: 0 });
    parts.push({ mesh: Graphics.createBox(gl, 0.14, 0.07, 0.22, shoeRed[0], shoeRed[1], shoeRed[2]), baseY: 0.05, offsetX: 0.14, offsetZ: 0.06 });

    console.log('✅ Shadow criado com ' + parts.length + ' partes (sem animação)');
    return parts;
  }

  return { create };
})();