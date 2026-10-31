import * as THREE from 'three';
import {
  createContactShadowTexture,
  createOphioliteTexture,
  createLimestoneTexture,
  createGraniteTexture,
  createMarbleTexture,
  createSandstoneTexture,
  createEarthMantleTexture,
  createOmanReliefTexture,
  createGlobeTectonicTexture
} from './proceduralTextures.ts';
import { RockSpecimenId } from './types.ts';

// ---------------------------------------------------------------------------
// 1. EARTH LAYERS COMPOSITE MODEL (3-12 PART PROCEDURAL CUTAWAY WITH EXPLODED VIEW)
// ---------------------------------------------------------------------------

export interface EarthLayersController {
  group: THREE.Group;
  setExplosionFactor: (factor: number) => void;
  dispose: () => void;
}

export function buildEarthLayersModel(): EarthLayersController {
  const group = new THREE.Group();
  group.name = 'EarthLayersRoot';

  const parts: Array<{ mesh: THREE.Object3D; basePos: THREE.Vector3; explodeDir: THREE.Vector3 }> = [];

  // Ground radial contact shadow
  const shadowGeo = new THREE.PlaneGeometry(7, 7);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: createContactShadowTexture(256),
    transparent: true,
    depthWrite: false,
    opacity: 0.5
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = -2.1;
  group.add(shadowMesh);

  // Center pivot: object sits grounded
  const centerGroup = new THREE.Group();
  centerGroup.position.y = 0.2;
  group.add(centerGroup);

  // --- PART 1: INNER CORE (Solid Iron-Nickel, 6000°C) ---
  const innerCoreGeo = new THREE.SphereGeometry(0.55, 32, 24);
  const innerCoreMat = new THREE.MeshStandardMaterial({
    color: 0xffe066,
    emissive: 0xff9900,
    emissiveIntensity: 0.6,
    roughness: 0.2,
    metalness: 0.8
  });
  const innerCoreMesh = new THREE.Mesh(innerCoreGeo, innerCoreMat);
  innerCoreMesh.castShadow = true;
  centerGroup.add(innerCoreMesh);
  parts.push({ mesh: innerCoreMesh, basePos: new THREE.Vector3(0, 0, 0), explodeDir: new THREE.Vector3(0, 0, 0) });

  // --- PART 2: OUTER CORE (Liquid convective iron, 4500°C) - Cutaway Shell ---
  // Represented by a 3/4 sphere shell
  const outerCoreGeo = new THREE.SphereGeometry(0.95, 32, 24, 0, Math.PI * 1.5, 0, Math.PI);
  const outerCoreMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0x991b1b,
    emissiveIntensity: 0.35,
    roughness: 0.35,
    metalness: 0.7,
    side: THREE.DoubleSide
  });
  const outerCoreMesh = new THREE.Mesh(outerCoreGeo, outerCoreMat);
  centerGroup.add(outerCoreMesh);
  parts.push({ mesh: outerCoreMesh, basePos: new THREE.Vector3(0, 0, 0), explodeDir: new THREE.Vector3(-0.4, 0.2, -0.4) });

  // --- PART 3: LOWER MANTLE / MESOSPHERE (Dense silicate rock) ---
  const lowerMantleGeo = new THREE.SphereGeometry(1.4, 32, 24, 0, Math.PI * 1.5, 0, Math.PI);
  const lowerMantleMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.75,
    metalness: 0.15,
    map: createEarthMantleTexture(256),
    side: THREE.DoubleSide
  });
  const lowerMantleMesh = new THREE.Mesh(lowerMantleGeo, lowerMantleMat);
  centerGroup.add(lowerMantleMesh);
  parts.push({ mesh: lowerMantleMesh, basePos: new THREE.Vector3(0, 0, 0), explodeDir: new THREE.Vector3(0.5, 0.3, -0.5) });

  // --- PART 4: UPPER MANTLE & ASTHENOSPHERE (Convective semi-molten layer) ---
  const upperMantleGeo = new THREE.SphereGeometry(1.75, 32, 24, 0, Math.PI * 1.5, 0, Math.PI);
  const upperMantleMat = new THREE.MeshStandardMaterial({
    color: 0x92400e,
    roughness: 0.8,
    metalness: 0.1,
    side: THREE.DoubleSide
  });
  const upperMantleMesh = new THREE.Mesh(upperMantleGeo, upperMantleMat);
  centerGroup.add(upperMantleMesh);
  parts.push({ mesh: upperMantleMesh, basePos: new THREE.Vector3(0, 0, 0), explodeDir: new THREE.Vector3(-0.6, 0.4, 0.6) });

  // --- PART 5: CRUST & LITHOSPHERE (Continental & Oceanic Crust with Oman topography) ---
  const crustGeo = new THREE.SphereGeometry(2.0, 48, 36, 0, Math.PI * 1.5, 0, Math.PI);
  const crustMat = new THREE.MeshStandardMaterial({
    color: 0x15803d,
    roughness: 0.85,
    metalness: 0.05,
    map: createGlobeTectonicTexture(1024),
    side: THREE.DoubleSide
  });
  const crustMesh = new THREE.Mesh(crustGeo, crustMat);
  crustMesh.castShadow = true;
  centerGroup.add(crustMesh);
  parts.push({ mesh: crustMesh, basePos: new THREE.Vector3(0, 0, 0), explodeDir: new THREE.Vector3(0.8, 0.5, 0.8) });

  // --- PART 6: CUTAWAY CROSS-SECTION DISC FACES (Showing layer strata inside the wedge) ---
  const discGeo = new THREE.PlaneGeometry(2.0, 2.0);
  const discMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.7,
    side: THREE.DoubleSide
  });
  const discMesh1 = new THREE.Mesh(discGeo, discMat);
  discMesh1.rotation.y = Math.PI / 2;
  discMesh1.position.set(0, 0, 1.0);
  centerGroup.add(discMesh1);
  parts.push({ mesh: discMesh1, basePos: new THREE.Vector3(0, 0, 1.0), explodeDir: new THREE.Vector3(0.2, 0.2, 0.5) });

  // --- PART 7: ATMOSPHERE SHELL (Cyan-blue glow halo) ---
  const atmoGeo = new THREE.SphereGeometry(2.12, 32, 24);
  const atmoMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.18,
    roughness: 0.1,
    metalness: 0.1,
    side: THREE.BackSide
  });
  const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
  centerGroup.add(atmoMesh);
  parts.push({ mesh: atmoMesh, basePos: new THREE.Vector3(0, 0, 0), explodeDir: new THREE.Vector3(0, 0, 0) });

  const setExplosionFactor = (factor: number) => {
    parts.forEach(({ mesh, basePos, explodeDir }) => {
      mesh.position.x = basePos.x + explodeDir.x * factor * 1.5;
      mesh.position.y = basePos.y + explodeDir.y * factor * 1.5;
      mesh.position.z = basePos.z + explodeDir.z * factor * 1.5;
    });
  };

  const dispose = () => {
    innerCoreGeo.dispose();
    innerCoreMat.dispose();
    outerCoreGeo.dispose();
    outerCoreMat.dispose();
    lowerMantleGeo.dispose();
    lowerMantleMat.dispose();
    upperMantleGeo.dispose();
    upperMantleMat.dispose();
    crustGeo.dispose();
    crustMat.dispose();
    discGeo.dispose();
    discMat.dispose();
    atmoGeo.dispose();
    atmoMat.dispose();
    shadowGeo.dispose();
    shadowMat.dispose();
  };

  return { group, setExplosionFactor, dispose };
}

// ---------------------------------------------------------------------------
// 2. OMAN 3D TOPOGRAPHIC RELIEF TERRAIN MODEL (WITH MOUNTAIN PEAKS & BEACONS)
// ---------------------------------------------------------------------------

export interface OmanReliefController {
  group: THREE.Group;
  beacons: THREE.Mesh[];
  dispose: () => void;
}

export function buildOmanReliefModel(): OmanReliefController {
  const group = new THREE.Group();
  group.name = 'OmanReliefRoot';

  // Ground radial contact shadow
  const shadowGeo = new THREE.PlaneGeometry(8, 8);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: createContactShadowTexture(256),
    transparent: true,
    depthWrite: false,
    opacity: 0.45
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = -0.52;
  group.add(shadowMesh);

  // --- PART 1: 3D TERRAIN MESH WITH TOPOGRAPHIC ELEVATION (Hajar Mountains & Musandam) ---
  const width = 6;
  const height = 6;
  const segments = 64;
  const terrainGeo = new THREE.PlaneGeometry(width, height, segments, segments);
  const posAttr = terrainGeo.attributes.position;

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i); // In PlaneGeometry, Y is the other horizontal axis before rotation

    // Procedural elevation formula tailored to Oman's real geography:
    // Hajar Mountains: ridge stretching northwest to southeast
    const distToHajarRidge = Math.abs(y - 0.4 * x + 0.3);
    let elevation = 0;

    if (distToHajarRidge < 1.4 && x > -2.2 && x < 1.8 && y > -1.2 && y < 2.0) {
      // Mountain backbone
      const ridgeProfile = Math.max(0, 1.4 - distToHajarRidge);
      // Jebel Shams peak apex around x = -0.5, y = 0.5
      const peakDist = Math.hypot(x - (-0.5), y - 0.5);
      const jebelShams = Math.max(0, 1.2 - peakDist) * 0.9;

      elevation = (ridgeProfile * 0.55 + jebelShams) * (0.8 + Math.sin(x * 6) * Math.cos(y * 6) * 0.2);
    }

    // Musandam peninsula (Northern fjords)
    const musandamDist = Math.hypot(x - (-1.8), y - 2.1);
    if (musandamDist < 0.9) {
      elevation += Math.max(0, 0.9 - musandamDist) * 0.7;
    }

    // Dhofar mountains (Southern arc)
    const dhofarDist = Math.hypot(x - 1.6, y - (-1.8));
    if (dhofarDist < 1.2) {
      elevation += Math.max(0, 1.2 - dhofarDist) * 0.5;
    }

    // Z in PlaneGeometry is height before rotation
    posAttr.setZ(i, elevation);
  }

  terrainGeo.computeVertexNormals();

  const terrainMat = new THREE.MeshStandardMaterial({
    map: createOmanReliefTexture(512),
    roughness: 0.85,
    metalness: 0.1,
    flatShading: true,
    side: THREE.DoubleSide
  });

  const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
  terrainMesh.rotation.x = -Math.PI / 2;
  terrainMesh.position.y = -0.5;
  terrainMesh.receiveShadow = true;
  terrainMesh.castShadow = true;
  group.add(terrainMesh);

  // --- PART 2: OCEAN & GULF OF OMAN WATER PLANE ---
  const oceanGeo = new THREE.PlaneGeometry(6.6, 6.6);
  const oceanMat = new THREE.MeshStandardMaterial({
    color: 0x0369a1,
    roughness: 0.15,
    metalness: 0.6,
    transparent: true,
    opacity: 0.75
  });
  const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
  oceanMesh.rotation.x = -Math.PI / 2;
  oceanMesh.position.y = -0.48;
  group.add(oceanMesh);

  // --- PART 3: TERRAIN BASE PLINTH (Extruded foundation pedestal) ---
  const plinthGeo = new THREE.BoxGeometry(6.2, 0.3, 6.2);
  const plinthMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.5,
    metalness: 0.3
  });
  const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
  plinthMesh.position.y = -0.66;
  group.add(plinthMesh);

  // --- PART 4: INTERACTIVE 3D BEACONS & PINS (Pivoted bottom-center on peaks) ---
  const beacons: THREE.Mesh[] = [];
  const beaconLocations = [
    { name: 'جبل شمس (3009 م)', x: -0.5, z: -0.5, y: 0.65, color: 0xf59e0b },
    { name: 'مضيق هرمز (مسندم)', x: -1.8, z: -2.1, y: 0.45, color: 0x38bdf8 },
    { name: 'محافظة مسقط والعاصمة', x: 0.6, z: -0.8, y: 0.25, color: 0x10b981 },
    { name: 'المنطقة الاقتصادية بالدقم', x: 1.2, z: 0.6, y: 0.15, color: 0x8b5cf6 },
    { name: 'صلالة ومحافظة ظفار', x: 1.6, z: 1.8, y: 0.35, color: 0xec4899 }
  ];

  beaconLocations.forEach(loc => {
    const beaconGroup = new THREE.Group();
    beaconGroup.position.set(loc.x, loc.y, loc.z);

    // Pin stem
    const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.25, 8);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.1 });
    const stemMesh = new THREE.Mesh(stemGeo, stemMat);
    stemMesh.position.y = 0.125;
    beaconGroup.add(stemMesh);

    // Glowing beacon jewel on top
    const jewelGeo = new THREE.OctahedronGeometry(0.08, 0);
    const jewelMat = new THREE.MeshStandardMaterial({
      color: loc.color,
      emissive: loc.color,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.5
    });
    const jewelMesh = new THREE.Mesh(jewelGeo, jewelMat);
    jewelMesh.position.y = 0.28;
    beaconGroup.add(jewelMesh);
    beacons.push(jewelMesh);

    group.add(beaconGroup);
  });

  const dispose = () => {
    terrainGeo.dispose();
    terrainMat.dispose();
    oceanGeo.dispose();
    oceanMat.dispose();
    plinthGeo.dispose();
    plinthMat.dispose();
    shadowGeo.dispose();
    shadowMat.dispose();
  };

  return { group, beacons, dispose };
}

// ---------------------------------------------------------------------------
// 3. 3D ROCKS & MINERALS MULTI-PART PROCEDURAL SPECIMEN
// ---------------------------------------------------------------------------

export interface RockSpecimenController {
  group: THREE.Group;
  dispose: () => void;
}

export function buildRockSpecimenModel(specimenId: RockSpecimenId): RockSpecimenController {
  const group = new THREE.Group();
  group.name = `RockSpecimen_${specimenId}`;

  // Ground radial contact shadow
  const shadowGeo = new THREE.PlaneGeometry(3.5, 3.5);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: createContactShadowTexture(256),
    transparent: true,
    depthWrite: false,
    opacity: 0.45
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = -1.0;
  group.add(shadowMesh);

  // Pedestal base
  const baseGeo = new THREE.CylinderGeometry(1.6, 1.7, 0.18, 32);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.4,
    metalness: 0.4
  });
  const baseMesh = new THREE.Mesh(baseGeo, baseMat);
  baseMesh.position.y = -0.9;
  baseMesh.receiveShadow = true;
  group.add(baseMesh);

  // Composite 3-12 parts cluster
  const rockGroup = new THREE.Group();
  rockGroup.position.y = -0.8; // Flush on top of pedestal
  group.add(rockGroup);

  let textures: { map: THREE.CanvasTexture; roughnessMap: THREE.CanvasTexture };
  let primaryColor = 0xffffff;
  let metalness = 0.1;
  let roughness = 0.7;

  if (specimenId === 'ophiolite') {
    textures = createOphioliteTexture(512);
    primaryColor = 0x1a2920;
    metalness = 0.4;
    roughness = 0.45;
  } else if (specimenId === 'limestone') {
    textures = createLimestoneTexture(512);
    primaryColor = 0xdfd3c3;
    metalness = 0.05;
    roughness = 0.85;
  } else if (specimenId === 'granite') {
    textures = createGraniteTexture(512);
    primaryColor = 0xcaa398;
    metalness = 0.15;
    roughness = 0.65;
  } else if (specimenId === 'marble') {
    textures = createMarbleTexture(512);
    primaryColor = 0xf5efe6;
    metalness = 0.08;
    roughness = 0.2; // High polish
  } else if (specimenId === 'quartz') {
    textures = createMarbleTexture(512); // Translucent crystalline look
    primaryColor = 0xffffff;
    metalness = 0.1;
    roughness = 0.15;
  } else {
    // sandstone
    textures = createSandstoneTexture(512);
    primaryColor = 0xe59a59;
    metalness = 0.05;
    roughness = 0.9;
  }

  // --- PART 1: PRIMARY SILHOUETTE (Main Faceted Rock Body) ---
  const mainGeo = new THREE.DodecahedronGeometry(1.0, 1);
  // Deform vertices slightly to make organic rock morphology
  const pos = mainGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    const noise = (Math.sin(vx * 5) + Math.cos(vy * 5) + Math.sin(vz * 5)) * 0.08;
    pos.setXYZ(i, vx + noise, vy + noise * 1.2 + 0.9, vz + noise); // Pivot bottom-center
  }
  mainGeo.computeVertexNormals();

  const mainMat = new THREE.MeshStandardMaterial({
    map: textures.map,
    roughnessMap: textures.roughnessMap,
    color: primaryColor,
    roughness,
    metalness,
    flatShading: specimenId !== 'marble'
  });
  const mainMesh = new THREE.Mesh(mainGeo, mainMat);
  mainMesh.castShadow = true;
  mainMesh.receiveShadow = true;
  rockGroup.add(mainMesh);

  // --- PART 2: SECONDARY READ (Fracture Flakes & Interlocking Crystals) ---
  const flakeGeo = new THREE.OctahedronGeometry(0.45, 0);
  const flakeMat = new THREE.MeshStandardMaterial({
    map: textures.map,
    color: primaryColor,
    roughness: Math.max(0.1, roughness - 0.25), // Vary roughness by >= 0.25 per skill directive!
    metalness: metalness + 0.25,
    flatShading: true
  });

  const flakePositions = [
    { x: 0.7, y: 0.6, z: 0.5, rot: 0.4 },
    { x: -0.6, y: 0.8, z: 0.4, rot: -0.6 },
    { x: 0.2, y: 1.4, z: -0.5, rot: 0.8 },
    { x: -0.4, y: 0.4, z: -0.7, rot: -0.3 }
  ];

  flakePositions.forEach(fl => {
    const flakeMesh = new THREE.Mesh(flakeGeo, flakeMat);
    flakeMesh.position.set(fl.x, fl.y, fl.z);
    flakeMesh.rotation.set(fl.rot, fl.rot * 1.5, fl.rot * 0.7);
    flakeMesh.scale.set(0.9, 1.2, 0.7);
    flakeMesh.castShadow = true;
    rockGroup.add(flakeMesh);
  });

  // --- PART 3: ACCENT CRYSTALS / MINERAL VEIN DETAILS ---
  if (specimenId === 'quartz' || specimenId === 'ophiolite') {
    // Hexagonal crystal prisms
    const prismGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.65, 6);
    const prismMat = new THREE.MeshPhysicalMaterial({
      color: specimenId === 'quartz' ? 0xffffff : 0x4ade80,
      transmission: 0.85,
      roughness: 0.1,
      ior: 1.55,
      metalness: 0.1
    });

    for (let c = 0; c < 5; c++) {
      const prismMesh = new THREE.Mesh(prismGeo, prismMat);
      prismMesh.position.set(
        (Math.random() - 0.5) * 0.8,
        1.0 + Math.random() * 0.6,
        (Math.random() - 0.5) * 0.8
      );
      prismMesh.rotation.set(Math.random(), Math.random(), Math.random());
      prismMesh.castShadow = true;
      rockGroup.add(prismMesh);
    }
  }

  const dispose = () => {
    mainGeo.dispose();
    mainMat.dispose();
    flakeGeo.dispose();
    flakeMat.dispose();
    baseGeo.dispose();
    baseMat.dispose();
    shadowGeo.dispose();
    shadowMat.dispose();
  };

  return { group, dispose };
}

// ---------------------------------------------------------------------------
// 4. TECTONIC FAULT & GEOLOGICAL FOLD 3D BLOCK DIAGRAM
// ---------------------------------------------------------------------------

export interface FaultModelController {
  group: THREE.Group;
  setDisplacement: (val: number) => void;
  dispose: () => void;
}

export function buildTectonicFaultModel(faultType: 'normal' | 'reverse' | 'folded'): FaultModelController {
  const group = new THREE.Group();
  group.name = `TectonicFault_${faultType}`;

  // Ground radial contact shadow
  const shadowGeo = new THREE.PlaneGeometry(6, 6);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: createContactShadowTexture(256),
    transparent: true,
    depthWrite: false,
    opacity: 0.45
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = -1.1;
  group.add(shadowMesh);

  // Strata layer colors:
  // 1. Top Soil & Limestone (الغطاء الكلسي)
  // 2. Sandstone (الحجر الرملي)
  // 3. Shale / Silt (الطفل والغرين)
  // 4. Basaltic Basement (القاعدة البازلتية)
  const strataColors = [0x166534, 0xd97706, 0x854d0e, 0x334155];

  // Footwall (الحائط السفلي الثابت)
  const footwallGroup = new THREE.Group();
  footwallGroup.position.set(-1.2, 0, 0);
  group.add(footwallGroup);

  // Hanging wall (الحائط العلوي المتحرك على سطح الصدع)
  const hangingWallGroup = new THREE.Group();
  hangingWallGroup.position.set(1.2, 0, 0);
  group.add(hangingWallGroup);

  // Build 4 distinct strata slabs in both footwall and hanging wall (8 parts total)
  strataColors.forEach((col, idx) => {
    const yPos = 0.6 - idx * 0.45;
    const slabGeo = new THREE.BoxGeometry(2.2, 0.4, 3.2);
    const slabMat = new THREE.MeshStandardMaterial({
      color: col,
      roughness: 0.75 + idx * 0.05,
      metalness: 0.1
    });

    // Footwall slab
    const fwMesh = new THREE.Mesh(slabGeo, slabMat);
    fwMesh.position.y = yPos;
    fwMesh.castShadow = true;
    fwMesh.receiveShadow = true;
    footwallGroup.add(fwMesh);

    // Hanging wall slab
    const hwMesh = new THREE.Mesh(slabGeo, slabMat);
    hwMesh.position.y = yPos;
    hwMesh.castShadow = true;
    hwMesh.receiveShadow = true;
    hangingWallGroup.add(hwMesh);
  });

  // Fault plane marker line (سطح الفالق المائل)
  const faultPlaneGeo = new THREE.PlaneGeometry(0.1, 2.2);
  const faultPlaneMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide });
  const faultLineMesh = new THREE.Mesh(faultPlaneGeo, faultPlaneMat);
  faultLineMesh.rotation.y = Math.PI / 2;
  faultLineMesh.position.set(0, -0.2, 0);
  group.add(faultLineMesh);

  const setDisplacement = (val: number) => {
    // Normal fault: Hanging wall slips downward along fault dip
    // Reverse fault: Hanging wall gets pushed upward
    const dir = faultType === 'normal' ? -1 : 1;
    hangingWallGroup.position.y = val * dir * 0.6;
    hangingWallGroup.position.x = 1.2 + val * 0.2;
  };

  const dispose = () => {
    shadowGeo.dispose();
    shadowMat.dispose();
    faultPlaneGeo.dispose();
    faultPlaneMat.dispose();
  };

  return { group, setDisplacement, dispose };
}
