import * as THREE from 'three';

/**
 * Procedural PBR Canvas Texture Generators
 * Fully self-contained in code, zero external network or image file dependencies.
 */

// Soft radial contact shadow texture to ground 3D objects
export function createContactShadowTexture(size = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  );
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
  gradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.45)');
  gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.15)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Omani Ophiolite / Samail Peridotite (Ultramafic oceanic mantle rock)
export function createOphioliteTexture(size = 512): { map: THREE.CanvasTexture; roughnessMap: THREE.CanvasTexture } {
  const mapCanvas = document.createElement('canvas');
  mapCanvas.width = size;
  mapCanvas.height = size;
  const mapCtx = mapCanvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const roughCtx = roughCanvas.getContext('2d')!;

  // Base dark ultramafic body
  mapCtx.fillStyle = '#17211b';
  mapCtx.fillRect(0, 0, size, size);

  roughCtx.fillStyle = '#666666';
  roughCtx.fillRect(0, 0, size, size);

  // Olivine and pyroxene crystals
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const rad = 0.5 + Math.random() * 2.5;

    const r = Math.random();
    if (r < 0.4) {
      mapCtx.fillStyle = '#1c2e24'; // deep olivine green
    } else if (r < 0.7) {
      mapCtx.fillStyle = '#263b30'; // serpentine tint
    } else if (r < 0.9) {
      mapCtx.fillStyle = '#0f1713'; // chromite black
    } else {
      mapCtx.fillStyle = '#8a7738'; // subtle metallic sulfide speck
    }

    mapCtx.beginPath();
    mapCtx.arc(x, y, rad, 0, Math.PI * 2);
    mapCtx.fill();

    roughCtx.fillStyle = r > 0.9 ? '#111111' : '#888888';
    roughCtx.beginPath();
    roughCtx.arc(x, y, rad, 0, Math.PI * 2);
    roughCtx.fill();
  }

  // Hydrothermal serpentine veins (World-famous in Wadi al Jizzi and Samail)
  mapCtx.strokeStyle = 'rgba(74, 133, 102, 0.4)';
  mapCtx.lineWidth = 1.5;
  for (let v = 0; v < 7; v++) {
    mapCtx.beginPath();
    let cx = Math.random() * size;
    let cy = Math.random() * size;
    mapCtx.moveTo(cx, cy);
    for (let s = 0; s < 8; s++) {
      cx += (Math.random() - 0.5) * 80;
      cy += (Math.random() - 0.5) * 80;
      mapCtx.lineTo(cx, cy);
    }
    mapCtx.stroke();
  }

  const map = new THREE.CanvasTexture(mapCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;

  return { map, roughnessMap };
}

// Omani Fossiliferous Limestone (Sedimentary rock with stratified layers)
export function createLimestoneTexture(size = 512): { map: THREE.CanvasTexture; roughnessMap: THREE.CanvasTexture } {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Warm cream/beige limestone base
  ctx.fillStyle = '#dfd3c3';
  ctx.fillRect(0, 0, size, size);

  // Horizontal sedimentary bedding planes
  for (let y = 0; y < size; y += 4) {
    const alpha = 0.05 + Math.sin(y * 0.08) * 0.05 + Math.random() * 0.05;
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(180, 160, 140, ${alpha})` : `rgba(235, 225, 210, ${alpha})`;
    ctx.fillRect(0, y, size, 4);
  }

  // Calcitic sand grains & microfossil specks
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const rad = 0.5 + Math.random() * 2;
    ctx.fillStyle = Math.random() > 0.4 ? 'rgba(165, 145, 125, 0.4)' : 'rgba(255, 250, 240, 0.6)';
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fossil cavity outlines (Nummulites & coral fragments typical of Jebel Akhdar)
  ctx.strokeStyle = 'rgba(130, 110, 95, 0.35)';
  ctx.lineWidth = 1;
  for (let f = 0; f < 12; f++) {
    const fx = 30 + Math.random() * (size - 60);
    const fy = 30 + Math.random() * (size - 60);
    ctx.beginPath();
    ctx.ellipse(fx, fy, 8 + Math.random() * 6, 5 + Math.random() * 4, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.stroke();
  }

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;

  const roughnessMap = new THREE.CanvasTexture(canvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;

  return { map, roughnessMap };
}

// Omani Granite (Mirbat / Salalah basement complex)
export function createGraniteTexture(size = 512): { map: THREE.CanvasTexture; roughnessMap: THREE.CanvasTexture } {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Pinkish-gray granitic groundmass
  ctx.fillStyle = '#caa398';
  ctx.fillRect(0, 0, size, size);

  // Large interlocking crystal grains
  const colors = [
    '#dfada1', // pink orthoclase feldspar
    '#9da1a8', // translucent quartz
    '#22252a', // black biotite mica
    '#f5ece6', // white plagioclase
    '#4b515d'  // hornblende
  ];

  for (let i = 0; i < 4500; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const w = 2 + Math.random() * 6;
    const h = 2 + Math.random() * 6;
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fill();
  }

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;

  const roughnessMap = new THREE.CanvasTexture(canvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;

  return { map, roughnessMap };
}

// Omani Marble (Metamorphic polished stone with flowing veins)
export function createMarbleTexture(size = 512): { map: THREE.CanvasTexture; roughnessMap: THREE.CanvasTexture } {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Soft polished cream foundation
  ctx.fillStyle = '#f5efe6';
  ctx.fillRect(0, 0, size, size);

  // Flowing calcite and mineral veining
  ctx.strokeStyle = 'rgba(175, 145, 120, 0.45)';
  ctx.lineWidth = 2.5;
  for (let v = 0; v < 5; v++) {
    ctx.beginPath();
    let x = (v / 5) * size + (Math.random() - 0.5) * 40;
    let y = 0;
    ctx.moveTo(x, y);
    while (y < size) {
      y += 15 + Math.random() * 20;
      x += (Math.random() - 0.5) * 35 + Math.sin(y * 0.02) * 20;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Finer accent branching veins
  ctx.strokeStyle = 'rgba(140, 115, 95, 0.3)';
  ctx.lineWidth = 1;
  for (let v = 0; v < 8; v++) {
    ctx.beginPath();
    let x = Math.random() * size;
    let y = Math.random() * size;
    ctx.moveTo(x, y);
    for (let s = 0; s < 5; s++) {
      x += (Math.random() - 0.5) * 60;
      y += (Math.random() - 0.5) * 60;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;

  const roughnessMap = new THREE.CanvasTexture(canvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;

  return { map, roughnessMap };
}

// Desert Sandstone (Sharqiya Sands / Wahiba & Empty Quarter cross-bedding)
export function createSandstoneTexture(size = 512): { map: THREE.CanvasTexture; roughnessMap: THREE.CanvasTexture } {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Golden-red dune sand
  ctx.fillStyle = '#e59a59';
  ctx.fillRect(0, 0, size, size);

  // Wavy wind-ripple laminae
  for (let y = 0; y < size; y += 3) {
    const wave = Math.sin(y * 0.05) * 15;
    const alpha = 0.08 + Math.random() * 0.06;
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(180, 80, 30, ${alpha})` : `rgba(240, 180, 110, ${alpha})`;
    ctx.fillRect(wave, y, size, 3);
  }

  // Quartz sand grains
  for (let i = 0; i < 3500; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.fillStyle = Math.random() > 0.3 ? 'rgba(215, 120, 60, 0.5)' : 'rgba(255, 230, 180, 0.7)';
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;

  const roughnessMap = new THREE.CanvasTexture(canvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;

  return { map, roughnessMap };
}

// Earth Core & Mantle interior cross-section texture
export function createEarthMantleTexture(size = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Convective fiery magma swirl
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#f97316');
  gradient.addColorStop(0.3, '#dc2626');
  gradient.addColorStop(0.7, '#7f1d1d');
  gradient.addColorStop(1, '#450a0a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Convective plume swirls
  ctx.strokeStyle = 'rgba(254, 215, 170, 0.35)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 15; i++) {
    ctx.beginPath();
    ctx.arc(
      size / 2 + (Math.random() - 0.5) * 200,
      size / 2 + (Math.random() - 0.5) * 200,
      30 + Math.random() * 80,
      0, Math.PI * 1.5
    );
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Topographic relief texture for Oman 3D Terrain
export function createOmanReliefTexture(size = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Coastal waters (Sea of Oman / Arabian Sea)
  ctx.fillStyle = '#0e4359';
  ctx.fillRect(0, 0, size, size);

  // Oman Landmass silhouette gradient
  const landGrad = ctx.createLinearGradient(size * 0.1, size * 0.1, size * 0.9, size * 0.9);
  landGrad.addColorStop(0, '#105238'); // Musandam & Batinah greens
  landGrad.addColorStop(0.35, '#855d3e'); // Hajar mountain rock (Jebel Akhdar)
  landGrad.addColorStop(0.65, '#c78446'); // Interior deserts & plains
  landGrad.addColorStop(1, '#1d5e45'); // Dhofar monsoon green (Salalah)

  ctx.fillStyle = landGrad;
  ctx.beginPath();
  // Simplified coastline of the Sultanate
  ctx.moveTo(size * 0.45, size * 0.05); // Musandam tip
  ctx.lineTo(size * 0.55, size * 0.15); // Strait of Hormuz
  ctx.lineTo(size * 0.75, size * 0.35); // Muscat & Gulf of Oman coast
  ctx.lineTo(size * 0.85, size * 0.55); // Ras al Hadd
  ctx.lineTo(size * 0.7, size * 0.75); // Duqm & Arabian Sea
  ctx.lineTo(size * 0.4, size * 0.92); // Dhofar coast
  ctx.lineTo(size * 0.15, size * 0.85); // Yemen border
  ctx.lineTo(size * 0.2, size * 0.5);  // Empty quarter border
  ctx.lineTo(size * 0.35, size * 0.2); // UAE border
  ctx.closePath();
  ctx.fill();

  // Mountain ridges shading
  ctx.strokeStyle = '#4a3221';
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(size * 0.46, size * 0.12);
  ctx.lineTo(size * 0.58, size * 0.28);
  ctx.lineTo(size * 0.72, size * 0.4);
  ctx.stroke();

  // Text label: "سلطنة عمان"
  ctx.font = 'bold 22px Cairo, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.textAlign = 'center';
  ctx.fillText('سلطنة عمان', size * 0.48, size * 0.55);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 3D Globe with Tectonic Plates texture
export function createGlobeTectonicTexture(size = 1024): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size / 2;
  const ctx = canvas.getContext('2d')!;

  // Oceans
  ctx.fillStyle = '#0f2744';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Continents (approximate procedural landmasses)
  ctx.fillStyle = '#225239';

  // Africa & Arabia
  ctx.beginPath();
  ctx.ellipse(canvas.width * 0.52, canvas.height * 0.55, canvas.width * 0.12, canvas.height * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Arabian Peninsula (Oman & Gulf)
  ctx.fillStyle = '#8f683a';
  ctx.beginPath();
  ctx.ellipse(canvas.width * 0.62, canvas.height * 0.45, canvas.width * 0.05, canvas.height * 0.12, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Eurasia
  ctx.fillStyle = '#2d5e3f';
  ctx.beginPath();
  ctx.ellipse(canvas.width * 0.68, canvas.height * 0.28, canvas.width * 0.22, canvas.height * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Americas
  ctx.beginPath();
  ctx.ellipse(canvas.width * 0.25, canvas.height * 0.32, canvas.width * 0.1, canvas.height * 0.2, -0.2, 0, Math.PI * 2);
  ctx.ellipse(canvas.width * 0.32, canvas.height * 0.7, canvas.width * 0.08, canvas.height * 0.22, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Tectonic Plate Boundaries (Red glowing dashed lines)
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([6, 4]);

  // Arabian Plate Boundary (Zagros / Makran / Red Sea / Owen Fracture Zone)
  ctx.beginPath();
  ctx.ellipse(canvas.width * 0.62, canvas.height * 0.46, canvas.width * 0.07, canvas.height * 0.15, 0.2, 0, Math.PI * 2);
  ctx.stroke();

  // Pacific Ring of Fire
  ctx.beginPath();
  ctx.arc(canvas.width * 0.88, canvas.height * 0.5, canvas.width * 0.18, -Math.PI * 0.5, Math.PI * 0.5);
  ctx.stroke();

  // Tropic of Cancer (Passing through Oman at 23.5° N)
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  const tropicY = canvas.height * (0.5 - 23.5 / 180);
  ctx.beginPath();
  ctx.moveTo(0, tropicY);
  ctx.lineTo(canvas.width, tropicY);
  ctx.stroke();

  // Equator
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height * 0.5);
  ctx.lineTo(canvas.width, canvas.height * 0.5);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
