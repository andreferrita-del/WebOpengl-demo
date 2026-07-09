// Modelo 3D: Sistema Solar - CORRIGIDO
window.GameModel = (() => {
  console.log('🌌 Sistema Solar - Anéis Corrigidos');

  function create(gl) {
    const parts = [];
    let time = 0;

    // ==================== CORES ====================
    const sunYellow    = [1.0, 0.85, 0.1];
    const sunOrange    = [1.0, 0.5, 0.05];
    const mercuryGray  = [0.6, 0.6, 0.65];
    const venusYellow  = [0.9, 0.8, 0.5];
    const earthBlue    = [0.2, 0.4, 0.9];
    const marsRed      = [0.85, 0.3, 0.1];
    const jupiterColor = [0.85, 0.65, 0.4];
    const jupiterBrown = [0.6, 0.4, 0.2];
    const saturnColor  = [0.9, 0.8, 0.5];
    const uranusColor  = [0.4, 0.8, 0.9];
    const neptuneColor = [0.2, 0.3, 0.9];
    const white        = [1.0, 1.0, 1.0];

    // ==================== ESTRELAS ====================
    for (let i = 0; i < 80; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const dist = 3.5 + Math.random() * 1.5;
      const brightness = 0.5 + Math.random() * 0.5;
      parts.push({
        mesh: Graphics.createSphere(gl, 0.01 + Math.random() * 0.03, 4, 4,
          white[0] * brightness, white[1] * brightness, white[2] * brightness),
        baseY: 1.5 + Math.cos(phi) * dist,
        offsetX: Math.sin(phi) * Math.cos(theta) * dist,
        offsetZ: Math.sin(phi) * Math.sin(theta) * dist,
        scaleX: 1, scaleY: 1, scaleZ: 1
      });
    }

    // ==================== SOL ====================
    parts.push({
      mesh: Graphics.createSphere(gl, 0.35, 32, 32, sunYellow[0], sunYellow[1], sunYellow[2]),
      baseY: 1.5, offsetX: 0, offsetZ: 0,
      scaleX: 1, scaleY: 1, scaleZ: 1
    });

    // ==================== PLANETAS ====================
    
    // Mercúrio
    const mercury = { _angle: 0, _radius: 0.55, _speed: 4.0 };
    parts.push({
      mesh: Graphics.createSphere(gl, 0.04, 12, 12, mercuryGray[0], mercuryGray[1], mercuryGray[2]),
      baseY: 1.5, offsetX: mercury._radius, offsetZ: 0,
      scaleX: 1, scaleY: 1, scaleZ: 1,
      _planet: mercury
    });

    // Vênus
    const venus = { _angle: 0.5, _radius: 0.75, _speed: 3.0 };
    parts.push({
      mesh: Graphics.createSphere(gl, 0.06, 16, 16, venusYellow[0], venusYellow[1], venusYellow[2]),
      baseY: 1.5, offsetX: venus._radius, offsetZ: 0,
      scaleX: 1, scaleY: 1, scaleZ: 1,
      _planet: venus
    });

    // Terra
    const earth = { _angle: 1.0, _radius: 0.95, _speed: 2.0 };
    const earthMesh = {
      mesh: Graphics.createSphere(gl, 0.065, 20, 20, earthBlue[0], earthBlue[1], earthBlue[2]),
      baseY: 1.5, offsetX: earth._radius, offsetZ: 0,
      scaleX: 1, scaleY: 1, scaleZ: 1,
      _planet: earth
    };
    parts.push(earthMesh);

    // Lua da Terra
    const moon = { _angle: 0, _radius: 0.08, _speed: 8.0, _parent: earthMesh };
    parts.push({
      mesh: Graphics.createSphere(gl, 0.02, 8, 8, white[0], white[1], white[2]),
      baseY: 1.5, offsetX: earth._radius + moon._radius, offsetZ: 0,
      scaleX: 1, scaleY: 1, scaleZ: 1,
      _moon: moon
    });

    // Marte
    const mars = { _angle: 2.0, _radius: 1.2, _speed: 1.5 };
    parts.push({
      mesh: Graphics.createSphere(gl, 0.05, 14, 14, marsRed[0], marsRed[1], marsRed[2]),
      baseY: 1.5, offsetX: mars._radius, offsetZ: 0,
      scaleX: 1, scaleY: 1, scaleZ: 1,
      _planet: mars
    });

    // Júpiter
    const jupiter = { _angle: 3.0, _radius: 1.6, _speed: 0.8 };
    parts.push({
      mesh: Graphics.createSphere(gl, 0.14, 24, 24, jupiterColor[0], jupiterColor[1], jupiterColor[2]),
      baseY: 1.5, offsetX: jupiter._radius, offsetZ: 0,
      scaleX: 1, scaleY: 1, scaleZ: 1,
      _planet: jupiter
    });

    // Faixas de Júpiter
    for (let i = -2; i <= 2; i++) {
      parts.push({
        mesh: Graphics.createCylinder(gl, 0.13, 0.13, 0.015, 16, jupiterBrown[0], jupiterBrown[1], jupiterBrown[2]),
        baseY: 1.5 + i * 0.05, offsetX: jupiter._radius, offsetZ: 0,
        scaleX: 1, scaleY: 1, scaleZ: 1,
        rotX: Math.PI / 2,
        _follow: jupiter
      });
    }

    // Saturno
    const saturn = { _angle: 4.0, _radius: 2.0, _speed: 0.6 };
    const saturnMesh = {
      mesh: Graphics.createSphere(gl, 0.11, 20, 20, saturnColor[0], saturnColor[1], saturnColor[2]),
      baseY: 1.5, offsetX: saturn._radius, offsetZ: 0,
      scaleX: 1, scaleY: 1, scaleZ: 1,
      _planet: saturn
    };
    parts.push(saturnMesh);

    // ANÉIS DE SATURNO (CORRIGIDOS)
    const ringColors = [
      [0.9, 0.8, 0.5],
      [0.85, 0.75, 0.45],
      [0.8, 0.7, 0.4],
    ];
    for (let i = 0; i < 3; i++) {
      const ringR = 0.14 + i * 0.04;
      parts.push({
        mesh: Graphics.createCylinder(gl, ringR, ringR + 0.01, 0.01, 24,
          ringColors[i][0], ringColors[i][1], ringColors[i][2]),
        baseY: 1.5, offsetX: saturn._radius, offsetZ: 0,
        scaleX: 1, scaleY: 1, scaleZ: 1,
        rotX: Math.PI / 2.5,
        _ring: saturn  // ← seguir os dados de saturn
      });
    }

    // Urano
    const uranus = { _angle: 5.0, _radius: 2.4, _speed: 0.4 };
    parts.push({
      mesh: Graphics.createSphere(gl, 0.08, 16, 16, uranusColor[0], uranusColor[1], uranusColor[2]),
      baseY: 1.5, offsetX: uranus._radius, offsetZ: 0,
      scaleX: 1, scaleY: 1, scaleZ: 1,
      _planet: uranus
    });

    // Netuno
    const neptune = { _angle: 6.0, _radius: 2.75, _speed: 0.3 };
    parts.push({
      mesh: Graphics.createSphere(gl, 0.075, 16, 16, neptuneColor[0], neptuneColor[1], neptuneColor[2]),
      baseY: 1.5, offsetX: neptune._radius, offsetZ: 0,
      scaleX: 1, scaleY: 1, scaleZ: 1,
      _planet: neptune
    });

    // ==================== ATUALIZAÇÃO ====================
    setInterval(() => {
      time += 0.016;

      // Atualizar todos os elementos
      for (const p of parts) {
        // Planetas
        if (p._planet) {
          const pl = p._planet;
          pl._angle += pl._speed * 0.016;
          p.offsetX = Math.cos(pl._angle) * pl._radius;
          p.offsetZ = Math.sin(pl._angle) * pl._radius;
        }
        
        // Lua
        if (p._moon) {
          const m = p._moon;
          m._angle += m._speed * 0.016;
          const parent = m._parent;
          p.offsetX = parent.offsetX + Math.cos(m._angle) * m._radius;
          p.offsetZ = parent.offsetZ + Math.sin(m._angle) * m._radius;
        }
        
        // Anéis e faixas (seguem o planeta)
        if (p._follow) {
          p.offsetX = Math.cos(p._follow._angle) * p._follow._radius;
          p.offsetZ = Math.sin(p._follow._angle) * p._follow._radius;
        }
        if (p._ring) {
          const r = p._ring;
          p.offsetX = Math.cos(r._angle) * r._radius;
          p.offsetZ = Math.sin(r._angle) * r._radius;
        }
      }
    }, 16);

    console.log('✅ Sistema Solar Corrigido - ' + parts.length + ' partes');
    return parts;
  }

  return { create };
})();