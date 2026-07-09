const Input = (() => {
  console.log('🎮 Input: touch + mouse');
  let mouseMoveEnabled = true;
  let rotCallback = null, zoomCallback = null;

  function init(canvas) {
    let dragging = false, lastX=0, lastY=0;
    canvas.addEventListener('mousedown', e => { dragging=true; lastX=e.clientX; lastY=e.clientY; });
    window.addEventListener('mousemove', e => {
      if (!dragging || !mouseMoveEnabled) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      if (rotCallback) rotCallback(dx*0.01, dy*0.01);
    });
    window.addEventListener('mouseup', () => dragging=false);
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      if (zoomCallback) zoomCallback(e.deltaY*0.01);
    });

    // Touch
    canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      if (e.touches.length === 1) {
        dragging = true; lastX=e.touches[0].clientX; lastY=e.touches[0].clientY;
      }
    });
    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      if (e.touches.length === 1 && dragging) {
        const dx = e.touches[0].clientX - lastX, dy = e.touches[0].clientY - lastY;
        lastX = e.touches[0].clientX; lastY = e.touches[0].clientY;
        if (rotCallback) rotCallback(dx*0.01, dy*0.01);
      }
    });
    canvas.addEventListener('touchend', e => { dragging = false; });
  }

  return {
    init,
    setMouseMoveEnabled: (v) => mouseMoveEnabled = v,
    isMouseMoveEnabled: () => mouseMoveEnabled,
    setRotateCallback: (cb) => rotCallback = cb,
    setZoomCallback: (cb) => zoomCallback = cb
  };
})();