window.GameModel = (() => {
  console.log('🌟 Kirby carregado');
  function create(gl) {
    const parts = [];
    const pink = [1.0, 0.75, 0.85];
    const darkPink = [0.95, 0.45, 0.6];
    const blushColor = [1.0, 0.6, 0.7];
    const white = [1.0, 1.0, 1.0];
    const black = [0.15, 0.1, 0.15];
    const blue = [0.3, 0.5, 1.0];
    const mouthColor = [0.6, 0.2, 0.3];

    // Corpo
    parts.push({ mesh: Graphics.createSphere(gl, 0.7, 32, 32, pink[0], pink[1], pink[2]), baseY: 1.0, scaleX:1.05, scaleY:0.9, scaleZ:0.95 });
    // Pés
    parts.push({ mesh: Graphics.createSphere(gl, 0.22, 16, 16, darkPink[0], darkPink[1], darkPink[2]), offsetX:-0.3, baseY:0.3, offsetZ:0.15, scaleX:0.8, scaleY:0.35, scaleZ:0.6 });
    parts.push({ mesh: Graphics.createSphere(gl, 0.22, 16, 16, darkPink[0], darkPink[1], darkPink[2]), offsetX:0.3, baseY:0.3, offsetZ:0.15, scaleX:0.8, scaleY:0.35, scaleZ:0.6 });
    // Braços
    parts.push({ mesh: Graphics.createSphere(gl, 0.18, 16, 16, pink[0], pink[1], pink[2]), offsetX:-0.75, baseY:1.0, offsetZ:0, scaleX:0.5, scaleY:0.7, scaleZ:0.5 });
    parts.push({ mesh: Graphics.createSphere(gl, 0.18, 16, 16, pink[0], pink[1], pink[2]), offsetX:0.75, baseY:1.0, offsetZ:0, scaleX:0.5, scaleY:0.7, scaleZ:0.5 });
    // Olhos
    const eyeWhite = Graphics.createSphere(gl, 0.16, 16, 16, white[0], white[1], white[2]);
    const eyeIris = Graphics.createSphere(gl, 0.09, 16, 16, blue[0], blue[1], blue[2]);
    const eyePupil = Graphics.createSphere(gl, 0.05, 8, 8, black[0], black[1], black[2]);
    const eyeHighlight = Graphics.createSphere(gl, 0.03, 8, 8, 1,1,1);
    // Esquerdo
    parts.push({ mesh: eyeWhite, offsetX:-0.22, baseY:1.25, offsetZ:0.55, scaleX:0.75, scaleY:0.9, scaleZ:0.5 });
    parts.push({ mesh: eyeIris, offsetX:-0.22, baseY:1.26, offsetZ:0.64, scaleX:0.7, scaleY:0.8, scaleZ:0.3 });
    parts.push({ mesh: eyePupil, offsetX:-0.22, baseY:1.27, offsetZ:0.68, scaleX:0.7, scaleY:0.8, scaleZ:0.2 });
    parts.push({ mesh: eyeHighlight, offsetX:-0.25, baseY:1.28, offsetZ:0.7, scaleX:0.5, scaleY:0.5, scaleZ:0.1 });
    // Direito
    parts.push({ mesh: eyeWhite, offsetX:0.22, baseY:1.25, offsetZ:0.55, scaleX:0.75, scaleY:0.9, scaleZ:0.5 });
    parts.push({ mesh: eyeIris, offsetX:0.22, baseY:1.26, offsetZ:0.64, scaleX:0.7, scaleY:0.8, scaleZ:0.3 });
    parts.push({ mesh: eyePupil, offsetX:0.22, baseY:1.27, offsetZ:0.68, scaleX:0.7, scaleY:0.8, scaleZ:0.2 });
    parts.push({ mesh: eyeHighlight, offsetX:0.19, baseY:1.28, offsetZ:0.7, scaleX:0.5, scaleY:0.5, scaleZ:0.1 });
    // Bochechas
    const blush = Graphics.createSphere(gl, 0.1, 8, 8, blushColor[0], blushColor[1], blushColor[2]);
    parts.push({ mesh: blush, offsetX:-0.4, baseY:1.05, offsetZ:0.5, scaleX:0.6, scaleY:0.5, scaleZ:0.3 });
    parts.push({ mesh: blush, offsetX:0.4, baseY:1.05, offsetZ:0.5, scaleX:0.6, scaleY:0.5, scaleZ:0.3 });
    // Boca
    const mouth = Graphics.createCylinder(gl, 0.015, 0.015, 0.12, 8, mouthColor[0], mouthColor[1], mouthColor[2]);
    parts.push({ mesh: mouth, offsetX:0, baseY:0.95, offsetZ:0.66, scaleX:0.8, scaleY:0.08, scaleZ:0.5, rotX:0.1 });
    return parts;
  }
  return { create };
})();