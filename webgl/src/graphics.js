const Graphics = (() => {
  console.log('🎨 Graphics: fábrica de geometrias');

  function createBox(gl, w, h, d, r, g, b) {
    const hw = w/2, hh = h/2, hd = d/2;
    const verts = [];
    const add = (ax,ay,az, bx,by,bz, cx,cy,cz, dx,dy,dz, nx,ny,nz, u1,v1, u2,v2, u3,v3, u4,v4) => {
      verts.push(ax,ay,az, nx,ny,nz, r,g,b, u1,v1);
      verts.push(bx,by,bz, nx,ny,nz, r,g,b, u2,v2);
      verts.push(cx,cy,cz, nx,ny,nz, r,g,b, u3,v3);
      verts.push(ax,ay,az, nx,ny,nz, r,g,b, u1,v1);
      verts.push(cx,cy,cz, nx,ny,nz, r,g,b, u3,v3);
      verts.push(dx,dy,dz, nx,ny,nz, r,g,b, u4,v4);
    };
    add(-hw,-hh, hd,  hw,-hh, hd,  hw, hh, hd, -hw, hh, hd,  0,0,1,  0,0,1,0,1,1,0,1);
    add( hw,-hh,-hd, -hw,-hh,-hd, -hw, hh,-hd,  hw, hh,-hd,  0,0,-1, 0,0,1,0,1,1,0,1);
    add(-hw, hh, hd,  hw, hh, hd,  hw, hh,-hd, -hw, hh,-hd,  0,1,0,  0,0,1,0,1,1,0,1);
    add(-hw,-hh,-hd,  hw,-hh,-hd,  hw,-hh, hd, -hw,-hh, hd,  0,-1,0, 0,0,1,0,1,1,0,1);
    add( hw,-hh, hd,  hw,-hh,-hd,  hw, hh,-hd,  hw, hh, hd,  1,0,0,  0,0,1,0,1,1,0,1);
    add(-hw,-hh,-hd, -hw,-hh, hd, -hw, hh, hd, -hw, hh,-hd, -1,0,0,  0,0,1,0,1,1,0,1);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    return { buffer: buf, count: verts.length/11, stride: 11*4, posOffset: 0, normOffset: 3*4, colOffset: 6*4, texOffset: 9*4 };
  }

  function createCylinder(gl, rTop, rBot, h, segs, r, g, b) {
    const verts = [];
    const half = h/2;
    for (let i=0; i<segs; i++) {
      const a0 = (i/segs)*Math.PI*2, a1 = ((i+1)/segs)*Math.PI*2;
      const x0=Math.cos(a0), z0=Math.sin(a0), x1=Math.cos(a1), z1=Math.sin(a1);
      const u0=i/segs, u1=(i+1)/segs;
      // lateral
      verts.push(x0*rBot, -half, z0*rBot, x0,0,z0, r,g,b, u0,0);
      verts.push(x1*rBot, -half, z1*rBot, x1,0,z1, r,g,b, u1,0);
      verts.push(x1*rTop,  half, z1*rTop, x1,0,z1, r,g,b, u1,1);
      verts.push(x0*rBot, -half, z0*rBot, x0,0,z0, r,g,b, u0,0);
      verts.push(x1*rTop,  half, z1*rTop, x1,0,z1, r,g,b, u1,1);
      verts.push(x0*rTop,  half, z0*rTop, x0,0,z0, r,g,b, u0,1);
      // tampas
      verts.push(0, half,0, 0,1,0, r,g,b, 0.5,0.5);
      verts.push(x0*rTop, half, z0*rTop, 0,1,0, r,g,b, x0*0.5+0.5, z0*0.5+0.5);
      verts.push(x1*rTop, half, z1*rTop, 0,1,0, r,g,b, x1*0.5+0.5, z1*0.5+0.5);
      verts.push(0, -half,0, 0,-1,0, r,g,b, 0.5,0.5);
      verts.push(x1*rBot, -half, z1*rBot, 0,-1,0, r,g,b, x1*0.5+0.5, z1*0.5+0.5);
      verts.push(x0*rBot, -half, z0*rBot, 0,-1,0, r,g,b, x0*0.5+0.5, z0*0.5+0.5);
    }
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    return { buffer: buf, count: verts.length/11, stride: 11*4, posOffset: 0, normOffset: 3*4, colOffset: 6*4, texOffset: 9*4 };
  }

  function createSphere(gl, radius, latSeg, lonSeg, r, g, b) {
    const verts = [];
    for (let lat=0; lat<latSeg; lat++) {
      for (let lon=0; lon<lonSeg; lon++) {
        const t0 = (lat/latSeg)*Math.PI, t1 = ((lat+1)/latSeg)*Math.PI;
        const p0 = (lon/lonSeg)*Math.PI*2, p1 = ((lon+1)/lonSeg)*Math.PI*2;
        const x0=Math.sin(t0)*Math.cos(p0), y0=Math.cos(t0), z0=Math.sin(t0)*Math.sin(p0);
        const x1=Math.sin(t0)*Math.cos(p1), y1=Math.cos(t0), z1=Math.sin(t0)*Math.sin(p1);
        const x2=Math.sin(t1)*Math.cos(p1), y2=Math.cos(t1), z2=Math.sin(t1)*Math.sin(p1);
        const x3=Math.sin(t1)*Math.cos(p0), y3=Math.cos(t1), z3=Math.sin(t1)*Math.sin(p0);
        const u0=lon/lonSeg, v0=lat/latSeg, u1=(lon+1)/lonSeg, v1=(lat+1)/latSeg;
        verts.push(x0*radius, y0*radius, z0*radius, x0,y0,z0, r,g,b, u0,v0);
        verts.push(x1*radius, y1*radius, z1*radius, x1,y1,z1, r,g,b, u1,v0);
        verts.push(x2*radius, y2*radius, z2*radius, x2,y2,z2, r,g,b, u1,v1);
        verts.push(x0*radius, y0*radius, z0*radius, x0,y0,z0, r,g,b, u0,v0);
        verts.push(x2*radius, y2*radius, z2*radius, x2,y2,z2, r,g,b, u1,v1);
        verts.push(x3*radius, y3*radius, z3*radius, x3,y3,z3, r,g,b, u0,v1);
      }
    }
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    return { buffer: buf, count: verts.length/11, stride: 11*4, posOffset: 0, normOffset: 3*4, colOffset: 6*4, texOffset: 9*4 };
  }

  return { createBox, createCylinder, createSphere };
})();