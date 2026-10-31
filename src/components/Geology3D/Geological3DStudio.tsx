import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  SceneMode,
  RockSpecimenId,
  EarthLayerInfo,
  RockSpecimenInfo,
  FaultModelInfo
} from './types.ts';
import {
  buildEarthLayersModel,
  EarthLayersController,
  buildOmanReliefModel,
  OmanReliefController,
  buildRockSpecimenModel,
  RockSpecimenController,
  buildTectonicFaultModel,
  FaultModelController
} from './proceduralModels.ts';
import { playGeologySound } from './audioSynthesizer.ts';
import {
  Layers, Mountain, Compass, RotateCcw, Eye,
  Volume2, VolumeX, Maximize2, Sparkles, ChevronDown, ChevronUp,
  Download, Printer, Info, CheckCircle2, Bookmark, Share2
} from 'lucide-react';
import { exportUnifiedPdf } from '../../utils/pdfExport.ts';
import { useSchoolProfile } from '../../hooks/useSchoolProfile.ts';

// Pre-allocated scratch helpers at module scope to ensure zero GC in animation loop
const _vec3 = new THREE.Vector3();

// Educational reference data for Earth Layers
const EARTH_LAYERS_DATA: EarthLayerInfo[] = [
  {
    id: 'crust',
    nameAr: 'القشرة الأرضية (Crust)',
    nameEn: 'Earth Crust & Lithosphere',
    depthKm: '0 - 70 كم',
    temperatureC: '20°C - 500°C',
    density: '2.7 - 3.0 جم/سم³',
    composition: 'جرانيت في القارات وبازلت وأفيوليت في المحيطات',
    characteristics: 'الطبقة الصلبة الرقيقة الخارجية التي يعيش عليها الإنسان، وتتميز سلطنة عمان بظهور أفيوليت سمائل (قشرة محيطية) على السطح.',
    color: '#15803d',
    pedagogicalTip: 'منهاج الصف العاشر والثاني عشر: صخور الأفيوليت دلالة قاطعة على انغراس صفيحة تكتونية محيطية.'
  },
  {
    id: 'mantle_upper',
    nameAr: 'الوشاح العلوي والأسينوسفير (Upper Mantle)',
    nameEn: 'Asthenosphere & Upper Mantle',
    depthKm: '70 - 660 كم',
    temperatureC: '500°C - 900°C',
    density: '3.4 - 4.4 جم/سم³',
    composition: 'صخور البيريدوتيت والسيليكات اللدنة',
    characteristics: 'طبقة شبه منصهرة ولزجة تجري فيها تيارات الحمل الحراري المسؤولة عن تحريك الصفائح التكتونية وتباعدها واصطدامها.',
    color: '#92400e',
    pedagogicalTip: 'تيارات الحمل الصاعدة تسبب تباعد الصفائح (مثل البحر الأحمر)، بينما التيارات الهابطة تسبب حفر الخنادق.'
  },
  {
    id: 'mantle_lower',
    nameAr: 'الوشاح السفلي (Lower Mantle / Mesosphere)',
    nameEn: 'Lower Mantle',
    depthKm: '660 - 2,890 كم',
    temperatureC: '1,000°C - 3,000°C',
    density: '4.5 - 5.6 جم/سم³',
    composition: 'سيليكات الماغنيسيوم والحديد فائقة الكثافة (بريدجمانيت)',
    characteristics: 'تمثل أكثر من 55% من حجم الكرة الأرضية، وهي صلبة بسبب الضغط الهائل رغم الحرارة الشديدة.',
    color: '#d97706',
    pedagogicalTip: 'تسهم في نقل الحرارة من اللب إلى الوشاح العلوي عبر الأعمدة الصهارية العميقة.'
  },
  {
    id: 'core_outer',
    nameAr: 'اللب الخارجي (Outer Core)',
    nameEn: 'Outer Core',
    depthKm: '2,890 - 5,150 كم',
    temperatureC: '4,000°C - 5,000°C',
    density: '9.9 - 12.2 جم/سم³',
    composition: 'سائل مصهور من الحديد والنيكل مع الكبريت والأكسجين',
    characteristics: 'حركة دوران وتيارات هذا السائل المنصهر حول اللب الداخلي هي المولد الأساسي للمجال المغناطيسي للأرض الذي يحمي الغلاف الجوي.',
    color: '#dc2626',
    pedagogicalTip: 'بدون اللب الخارجي السائل ومجاله المغناطيسي لجردت الرياح الشمسية كوكب الأرض من غلافه الجوي.'
  },
  {
    id: 'core_inner',
    nameAr: 'اللب الداخلي (Inner Core)',
    nameEn: 'Inner Core',
    depthKm: '5,150 - 6,371 كم',
    temperatureC: '5,500°C - 6,000°C (حرارة سطح الشمس)',
    density: '12.8 - 13.1 جم/سم³',
    composition: 'سبيكة بلورية صلبة جداً من الحديد والنيكل',
    characteristics: 'صلب تماماً بفعل الضغط الكوكبي الفائق الذي يبلغ 3.6 مليون ضغط جوي، ويدور بسرعة مستقلة طفيفة.',
    color: '#eab308',
    pedagogicalTip: 'مركز الأرض يبعد 6371 كم من السطح، وهو القلب الحراري الكثيف لكوكبنا.'
  }
];

// Educational reference data for Omani Rock Specimens
const ROCKS_DATA: Record<RockSpecimenId, RockSpecimenInfo> = {
  ophiolite: {
    id: 'ophiolite',
    nameAr: 'صخور الأفيوليت العمانية (سمائل)',
    nameEn: 'Samail Ophiolite (Peridotite & Gabbro)',
    type: 'ناري (Igneous)',
    formation: 'قشرة محيطية قديمة وستار علوي اندفعا فوق القارة قبل 70 مليون سنة',
    mohsHardness: '5.5 - 6.5',
    density: '3.1 - 3.3 جم/سم³',
    omanLocation: 'سلسلة جبال الحجر، وادي الجزي، سمائل، ولاية صحار',
    importance: 'أكبر وأكمل قطاع مكشوف للقشرة المحيطية في العالم، ومقصد لعلماء الجيولوجيا ووكالة ناسا لدراسة امتصاص ثاني أكسيد الكربون.',
    curriculumLink: 'هذا وطني (الصف 12): جيولوجيا سلطنة عمان الفريدة وتنوع الموارد الطبيعية.',
    color: '#1a2920'
  },
  limestone: {
    id: 'limestone',
    nameAr: 'الحجر الجيري العماني والأحافير',
    nameEn: 'Omani Fossiliferous Limestone',
    type: 'رسوبي (Sedimentary)',
    formation: 'ترسيب كربونات الكالسيوم وهياكل الكائنات البحرية القديمة في بحر التيثس',
    mohsHardness: '3.0 (مقياس موهس)',
    density: '2.5 - 2.7 جم/سم³',
    omanLocation: 'الجبل الأخضر، جبل شمس، شبه جزيرة مسندم، محافظة الظاهرة',
    importance: 'خزان استراتيجي للمياه الجوفية والنفط، ومصدر أساسي لصناعة الأسمنت ومواد البناء الوطنية.',
    curriculumLink: 'الدراسات الاجتماعية: التكوينات الرسوبية ومصادر المياه والأفلاج العمانية.',
    color: '#dfd3c3'
  },
  granite: {
    id: 'granite',
    nameAr: 'الجرانيت الناري (مرباط / صلالة)',
    nameEn: 'Mirbat Basement Complex Granite',
    type: 'ناري (Igneous)',
    formation: 'تبريد بطيء للصهير الماغماتي في أعماق القشرة الأرضية (صخور بلورية جوفية)',
    mohsHardness: '6.0 - 7.0',
    density: '2.65 - 2.75 جم/سم³',
    omanLocation: 'سهل مرباط، جبال ظفار، سدح (الصخور الأساسية القديمة)',
    importance: 'أقدم الصخور عمراً في سلطنة عمان (يتجاوز عمرها 800 مليون سنة، ما قبل الكامبري)، صلبة ومقاومة للتعرية.',
    curriculumLink: 'الجغرافيا الطبيعية: الصخور الجوفية النارية وتاريخ شبه الجزيرة العربية الجيولوجي.',
    color: '#caa398'
  },
  marble: {
    id: 'marble',
    nameAr: 'الرخام العماني الفاخر',
    nameEn: 'Omani Polished Marble (Desert Rose)',
    type: 'متحول (Metamorphic)',
    formation: 'تحول الحجر الجيري النقي تحت وطأة الحرارة الشديدة والضغط التكتوني في باطن الأرض',
    mohsHardness: '3.5 - 4.5',
    density: '2.7 - 2.85 جم/سم³',
    omanLocation: 'عبري (محافظة الظاهرة)، صحار، نزوى',
    importance: 'ثروة وطنية كبرى وصناعة تصديرية عالمية ضمن قطاع التعدين برؤية عمان 2040.',
    curriculumLink: 'رؤية عمان 2040 والتنويع الاقتصادي: استثمار الثروات التعدينية والمحاجر المستدامة.',
    color: '#f5efe6'
  },
  quartz: {
    id: 'quartz',
    nameAr: 'الكوارتز والكريستال الجبلي',
    nameEn: 'Crystalline Quartz & Geodes',
    type: 'متحول (Metamorphic)',
    formation: 'تبلور محاليل السيليكا الحارة في شقوق وفجوات الصخور البركانية والرسوبية',
    mohsHardness: '7.0 (شديد الصلابة)',
    density: '2.65 جم/سم³',
    omanLocation: 'كهوف جبال الحجر، جبال ينقل، صحراء الوسطى',
    importance: 'عنصر رئيسي في صناعات البصريات الدقيقة، الإلكترونيات، والخلايا الكهروضوئية للطاقة الشمسية.',
    curriculumLink: 'المفاهيم الجيولوجية: مقياس موهس للصلابة والخصائص الفيزيائية للمعادن.',
    color: '#ffffff'
  },
  sandstone: {
    id: 'sandstone',
    nameAr: 'الحجر الرملي وتكوينات الكثبان',
    nameEn: 'Desert Sandstone & Dunes Matrix',
    type: 'رسوبي (Sedimentary)',
    formation: 'التحام وتماسك حبيبات الرمل الكوارتزية بفعل الضغط والمواد اللاحمة الكلسية والحديدية',
    mohsHardness: '6.0 - 6.5',
    density: '2.2 - 2.6 جم/سم³',
    omanLocation: 'رمال الشرقية (وهيبة)، صحراء الربع الخالي، سيح الرول',
    importance: 'الخزان الجيولوجي الرئيسي لحقول النفط والغاز العمانية ومكامن المياه العميقة.',
    curriculumLink: 'دراسات البيئة الصحراوية: أشكال الترسيب الهوائي والكثبان الطولية والهلالية.',
    color: '#e59a59'
  }
};

// Educational reference data for Faults
const FAULT_DATA: Record<string, FaultModelInfo> = {
  normal: {
    type: 'normal',
    titleAr: 'الفالق العادي (قوى شد تباعدية)',
    titleEn: 'Normal Fault (Tensional Stress)',
    mechanism: 'يتحرك فيه الحائط العلوي (Hanging Wall) إلى أسفل بالنسبة للحائط السفلي نتيجة قوى الشد.',
    stressType: 'قوى شد (Tension) مسببة تمدد القشرة الأرضية',
    omanExample: 'الفوالق المحيطة بحوض خليج عمان وأخاديد الانفتاح التكتوني في بحر العرب.',
    earthquakeRisk: 'منخفض إلى متوسط مع هزات تكتونية خفيفة على أطراف الأحواض الترسيبية.'
  },
  reverse: {
    type: 'reverse',
    titleAr: 'الفالق المعكوس / الزحفي (قوى ضغط تقاربية)',
    titleEn: 'Reverse & Thrust Fault (Compressional Stress)',
    mechanism: 'يندفع فيه الحائط العلوي إلى أعلى بالنسبة للحائط السفلي بفعل قوى الضغط التكتوني.',
    stressType: 'قوى ضغط (Compression) مسببة تقاصر القشرة ورفع الجبال',
    omanExample: 'صدوع حزام جبال الحجر وزحف صخور الأفيوليت فوق الصخور الرسوبية.',
    earthquakeRisk: 'مرتبط بحزام زاغروس ومكران قبالة سواحل شمال عمان.'
  }
};

export const Geological3DStudio: React.FC = () => {
  const { schoolProfile } = useSchoolProfile();
  const mountRef = useRef<HTMLDivElement>(null);

  // Active state
  const [sceneMode, setSceneMode] = useState<SceneMode>('earth_layers');
  const [selectedRock, setSelectedRock] = useState<RockSpecimenId>('ophiolite');
  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(0);
  const [faultType, setFaultType] = useState<'normal' | 'reverse'>('normal');

  // 3D Controls
  const [explosionFactor, setExplosionFactor] = useState<number>(0.25);
  const [faultDisplacement, setFaultDisplacement] = useState<number>(0.5);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isControlsCollapsed, setIsControlsCollapsed] = useState<boolean>(false);
  const [activeBeaconName, setActiveBeaconName] = useState<string | null>(null);

  // References to active Three.js controllers
  const earthControllerRef = useRef<EarthLayersController | null>(null);
  const omanControllerRef = useRef<OmanReliefController | null>(null);
  const rockControllerRef = useRef<RockSpecimenController | null>(null);
  const faultControllerRef = useRef<FaultModelController | null>(null);
  const activeModelGroupRef = useRef<THREE.Group | null>(null);

  const controlsRef = useRef<OrbitControls | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Sound trigger helper
  const triggerSound = useCallback((type: 'chime' | 'rock_tap' | 'explode_swoosh' | 'beacon_ping' | 'mode_switch') => {
    if (soundEnabled) {
      playGeologySound(type);
    }
  }, [soundEnabled]);

  // -------------------------------------------------------------------------
  // INITIALIZE THREE.JS SCENE ONCE IN MOUNT REF
  // -------------------------------------------------------------------------
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL from GPU renderer string
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch (_) {
        return true;
      }
    })();

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a101d); // Deep cosmic navy
    scene.fog = new THREE.FogExp2(0x0a101d, 0.04);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;
    camera.position.set(0, 3.2, 5.5);
    camera.lookAt(0, 0, 0);

    // 2. High-Performance PBR Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    rendererRef.current = renderer;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Studio PBR Environment Map via RoomEnvironment & PMREMGenerator
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch (_) {}

    // 4. Lighting Rig (Key warm light + cool hemisphere fill + rim backlight)
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 1.2);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.2);
    keyLight.position.set(6, 8, 5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    const d = 4.5;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    rimLight.position.set(-6, -2, -5);
    scene.add(rimLight);

    // 5. OrbitControls with smooth exponential damping
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.1; // Prevent going deep below ground
    controls.minDistance = 2.2;
    controls.maxDistance = 16.0;

    // 6. Lossless 60fps Animation Loop with Software-WebGL Pacing
    let frameId = 0;
    let clock = new THREE.Clock();

    function tick() {
      const delta = clock.getDelta();
      controls.update();

      // Smooth auto-rotation
      if (activeModelGroupRef.current && isAutoRotating) {
        activeModelGroupRef.current.rotation.y += delta * 0.25;
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    }
    frameId = requestAnimationFrame(tick);

    // 7. Resize Observer for stable responsive container
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  // -------------------------------------------------------------------------
  // SWITCH ACTIVE 3D MODEL ACCORDING TO SCENE MODE
  // -------------------------------------------------------------------------
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clean up previous active model
    if (activeModelGroupRef.current) {
      scene.remove(activeModelGroupRef.current);
    }
    if (earthControllerRef.current) earthControllerRef.current.dispose();
    if (omanControllerRef.current) omanControllerRef.current.dispose();
    if (rockControllerRef.current) rockControllerRef.current.dispose();
    if (faultControllerRef.current) faultControllerRef.current.dispose();

    earthControllerRef.current = null;
    omanControllerRef.current = null;
    rockControllerRef.current = null;
    faultControllerRef.current = null;

    if (sceneMode === 'earth_layers') {
      const controller = buildEarthLayersModel();
      earthControllerRef.current = controller;
      controller.setExplosionFactor(explosionFactor);
      activeModelGroupRef.current = controller.group;
      scene.add(controller.group);

      if (cameraRef.current && controlsRef.current) {
        cameraRef.current.position.set(0, 2.5, 5.2);
        controlsRef.current.target.set(0, 0, 0);
      }
    } else if (sceneMode === 'relief_oman') {
      const controller = buildOmanReliefModel();
      omanControllerRef.current = controller;
      activeModelGroupRef.current = controller.group;
      scene.add(controller.group);

      if (cameraRef.current && controlsRef.current) {
        cameraRef.current.position.set(0, 4.5, 4.8);
        controlsRef.current.target.set(0, 0, 0);
      }
    } else if (sceneMode === 'rocks_gallery') {
      const controller = buildRockSpecimenModel(selectedRock);
      rockControllerRef.current = controller;
      activeModelGroupRef.current = controller.group;
      scene.add(controller.group);

      if (cameraRef.current && controlsRef.current) {
        cameraRef.current.position.set(0, 2.0, 3.8);
        controlsRef.current.target.set(0, 0, 0);
      }
    } else if (sceneMode === 'tectonic_fault') {
      const controller = buildTectonicFaultModel(faultType);
      faultControllerRef.current = controller;
      controller.setDisplacement(faultDisplacement);
      activeModelGroupRef.current = controller.group;
      scene.add(controller.group);

      if (cameraRef.current && controlsRef.current) {
        cameraRef.current.position.set(3.5, 2.8, 4.2);
        controlsRef.current.target.set(0, 0, 0);
      }
    } else if (sceneMode === 'globe_plates') {
      const controller = buildEarthLayersModel();
      earthControllerRef.current = controller;
      controller.setExplosionFactor(0); // Zero explosion = Solid Earth Globe with plates
      activeModelGroupRef.current = controller.group;
      scene.add(controller.group);

      if (cameraRef.current && controlsRef.current) {
        cameraRef.current.position.set(0, 1.8, 4.8);
        controlsRef.current.target.set(0, 0, 0);
      }
    }
  }, [sceneMode, selectedRock, faultType]);

  // Update explosion factor dynamically
  useEffect(() => {
    if (earthControllerRef.current && (sceneMode === 'earth_layers' || sceneMode === 'globe_plates')) {
      earthControllerRef.current.setExplosionFactor(sceneMode === 'globe_plates' ? 0 : explosionFactor);
    }
  }, [explosionFactor, sceneMode]);

  // Update fault displacement dynamically
  useEffect(() => {
    if (faultControllerRef.current && sceneMode === 'tectonic_fault') {
      faultControllerRef.current.setDisplacement(faultDisplacement);
    }
  }, [faultDisplacement, sceneMode]);

  // Reset Camera View
  const handleResetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    triggerSound('chime');
    if (sceneMode === 'relief_oman') {
      cameraRef.current.position.set(0, 4.5, 4.8);
    } else if (sceneMode === 'rocks_gallery') {
      cameraRef.current.position.set(0, 2.0, 3.8);
    } else if (sceneMode === 'tectonic_fault') {
      cameraRef.current.position.set(3.5, 2.8, 4.2);
    } else {
      cameraRef.current.position.set(0, 2.5, 5.2);
    }
    controlsRef.current.target.set(0, 0, 0);
  };

  // Export 3D View as Image / PDF Document
  const handleExport3DCard = async () => {
    if (!rendererRef.current) return;
    triggerSound('chime');
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `مجسم_جيولوجي_3D_${sceneMode}_سلطنة_عمان.png`;
    link.href = dataUrl;
    link.click();
  };

  const currentLayer = EARTH_LAYERS_DATA[selectedLayerIndex];
  const currentRock = ROCKS_DATA[selectedRock];
  const currentFault = FAULT_DATA[faultType];

  return (
    <div className="relative w-full h-[calc(100vh-80px)] min-h-[640px] bg-slate-950 overflow-hidden select-none rounded-3xl border border-slate-800 shadow-2xl flex flex-col">
      {/* ------------------------------------------------------------------ */}
      {/* 3D CANVAS MOUNT CONTAINER (Outside Re-rendering React Overlay) */}
      {/* ------------------------------------------------------------------ */}
      <div
        ref={mountRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-0"
      />

      {/* ------------------------------------------------------------------ */}
      {/* TOP HEADER: MINIMAL TITLE & MODE BADGE (Top-Right & Top-Left) */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative z-10 p-4 md:p-6 flex items-start justify-between pointer-events-none gap-4">
        {/* Top-Right: Spec Title */}
        <div className="pointer-events-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-xl backdrop-blur-xs max-w-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-700 flex items-center justify-center text-white shadow-md shrink-0">
              <Mountain className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Three.js 3D Studio
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                  سلطنة عمان 🇴🇲
                </span>
              </div>
              <h2 className="text-sm md:text-base font-black text-white mt-0.5">
                {sceneMode === 'earth_layers' && 'طبقات الأرض وقطاع اللب والوشاح'}
                {sceneMode === 'relief_oman' && 'تضاريس سلطنة عمان ومسندم 3D'}
                {sceneMode === 'rocks_gallery' && 'متحف الصخور والمعادن العمانية'}
                {sceneMode === 'tectonic_fault' && 'الصدوع والفوالق التكتونية والطبقات'}
                {sceneMode === 'globe_plates' && 'الكرة الأرضية وحركة الصفائح ومدار السرطان'}
              </h2>
            </div>
          </div>
          <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
            محاكاة تفاعلية ثلاثية الأبعاد مبنية بتقنية Three.js و PBR Shaders لدعم مناهج الدراسات الاجتماعية والجغرافيا والجيولوجيا.
          </p>
        </div>

        {/* Top-Left: Quick Controls Bar */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => {
              setIsAutoRotating(!isAutoRotating);
              triggerSound('chime');
            }}
            className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer ${
              isAutoRotating
                ? 'bg-teal-600 border-teal-500 text-white'
                : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="تبديل الدوران التلقائي للمجسم"
          >
            <RotateCcw className={`w-4 h-4 ${isAutoRotating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isAutoRotating ? 'دوران نشط' : 'إيقاف الدوران'}</span>
          </button>

          <button
            onClick={handleResetCamera}
            className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition shadow-md cursor-pointer"
            title="إعادة ضبط زاوية الكاميرا"
          >
            <span>إعادة ضبط الزاوية 🎥</span>
          </button>

          <button
            onClick={handleExport3DCard}
            className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
            title="تنزيل لقطة 3D عالية الدقة"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">حفظ لقطة 3D</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white text-xs transition shadow-md cursor-pointer"
            title="تفعيل/كتم المؤثرات الصوتية"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-teal-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* SIDE EDUCATIONAL SPEC SHEET (Dynamic based on selected element) */}
      {/* ------------------------------------------------------------------ */}
      <div className="absolute right-4 top-40 z-10 w-72 md:w-80 max-h-[calc(100vh-270px)] overflow-y-auto pointer-events-auto bg-slate-900/95 border border-slate-800 rounded-2xl p-4 text-white shadow-2xl space-y-3">
        {sceneMode === 'earth_layers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-[11px] font-bold text-teal-400">قطاع طبقات باطن الأرض:</span>
              <span className="text-[10px] text-slate-400 font-mono">{currentLayer.depthKm}</span>
            </div>

            {/* Layer tabs */}
            <div className="grid grid-cols-2 gap-1.5">
              {EARTH_LAYERS_DATA.map((layer, idx) => (
                <button
                  key={layer.id}
                  onClick={() => {
                    setSelectedLayerIndex(idx);
                    triggerSound('chime');
                  }}
                  className={`px-2 py-1.5 rounded-xl text-[10px] font-bold text-right transition cursor-pointer border ${
                    selectedLayerIndex === idx
                      ? 'bg-teal-600 text-white border-teal-500'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <div className="truncate">{layer.nameAr.split(' ')[0]} {layer.nameAr.split(' ')[1]}</div>
                </button>
              ))}
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
              <h3 className="font-black text-amber-300">{currentLayer.nameAr}</h3>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700">
                  <span className="text-slate-400 block text-[9px]">العمق:</span>
                  <span className="font-bold text-white">{currentLayer.depthKm}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700">
                  <span className="text-slate-400 block text-[9px]">الحرارة:</span>
                  <span className="font-bold text-rose-400">{currentLayer.temperatureC}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-300 leading-relaxed bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
                <span className="font-bold text-teal-300 block mb-1">التركيب الصخري:</span>
                {currentLayer.composition}
              </div>

              <div className="text-[10px] text-emerald-300/90 leading-relaxed bg-emerald-950/40 p-2 rounded-xl border border-emerald-800/40">
                💡 <span className="font-bold">فائدة منهجية:</span> {currentLayer.pedagogicalTip}
              </div>
            </div>
          </div>
        )}

        {sceneMode === 'rocks_gallery' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-[11px] font-bold text-teal-400">عينة الصخر / المعدن:</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                صلابة: {currentRock.mohsHardness}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <h3 className="font-black text-white text-sm">{currentRock.nameAr}</h3>
              <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-900/60 text-teal-200 border border-teal-800">
                النوع: {currentRock.type}
              </span>

              <div className="text-[11px] text-slate-300 bg-slate-800/50 p-2 rounded-xl border border-slate-800">
                <span className="font-bold text-slate-400 block text-[10px]">مواقع التواجد في سلطنة عمان:</span>
                <span className="text-amber-300 font-bold">{currentRock.omanLocation}</span>
              </div>

              <div className="text-[11px] text-slate-300 leading-relaxed">
                <span className="font-bold text-slate-400 block text-[10px]">طريقة النشأة والخصائص:</span>
                {currentRock.formation}
              </div>

              <div className="text-[11px] text-teal-200 bg-teal-950/50 p-2.5 rounded-xl border border-teal-800/50 leading-relaxed">
                <span className="font-bold block text-[10px] text-teal-300">الأهمية الاستراتيجية والاقتصادية:</span>
                {currentRock.importance}
              </div>
            </div>
          </div>
        )}

        {sceneMode === 'relief_oman' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-[11px] font-bold text-teal-400">تضاريس سلطنة عمان:</span>
              <span className="text-[10px] text-amber-300 font-bold">جبل شمس 3009 م</span>
            </div>

            <div className="text-xs space-y-2 text-slate-300">
              <p className="leading-relaxed">
                تتميز سلطنة عمان بتنوع تضاريسي مذهل يجمع بين سلسلة جبال الحجر الصخرية، وأخوار مسندم البحرية، وسهول الباطنة الخصبة، وصحاري الرمال الشاسعة، وجبال ظفار الموسمية.
              </p>

              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-[11px] space-y-1.5">
                <span className="font-bold text-teal-300 block">معالم بارزة على المجسم:</span>
                <div>• <span className="font-bold text-amber-300">جبل شمس:</span> أعلى قمة في شبه الجزيرة العربية (3009 م).</div>
                <div>• <span className="font-bold text-sky-300">مضيق هرمز:</span> ممر الطاقة الأهم عالمياً بإشراف عمان.</div>
                <div>• <span className="font-bold text-emerald-300">سهل الباطنة:</span> الشريط الزراعي والحضري الأوسع.</div>
                <div>• <span className="font-bold text-rose-300">محافظة ظفار:</span> الخريف وظاهرة الصعود المائي الفريدة.</div>
              </div>
            </div>
          </div>
        )}

        {sceneMode === 'tectonic_fault' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-[11px] font-bold text-teal-400">النموذج البنيوي للصدوع:</span>
              <span className="text-[10px] text-rose-400 font-bold">{currentFault.type === 'normal' ? 'فالق عادي (شد)' : 'فالق معكوس (ضغط)'}</span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <h3 className="font-black text-amber-300">{currentFault.titleAr}</h3>
              <p className="text-[11px] leading-relaxed">{currentFault.mechanism}</p>

              <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700 text-[11px]">
                <span className="text-slate-400 block text-[9px]">طبيعة الإجهاد:</span>
                <span className="font-bold text-white">{currentFault.stressType}</span>
              </div>

              <div className="p-2 rounded-xl bg-teal-950/40 border border-teal-800/40 text-[11px]">
                <span className="text-teal-400 block text-[9px]">أمثلة في جيولوجيا عمان:</span>
                <span className="text-teal-200">{currentFault.omanExample}</span>
              </div>
            </div>
          </div>
        )}

        {sceneMode === 'globe_plates' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-[11px] font-bold text-teal-400">الصفائح التكتونية والكرة الأرضية:</span>
              <span className="text-[10px] text-amber-300 font-bold">مدار السرطان 23.5°</span>
            </div>

            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <p>
                تقع سلطنة عمان على الطرف الشمالي الشرقي لـ <strong className="text-white">الصفيحة العربية</strong>، المحاطة بحزام تصادم مع الصفيحة الأوراسية عند مكران ومضيق هرمز.
              </p>
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-[11px] space-y-1">
                <div>• <span className="text-rose-400 font-bold">الخطوط الحمراء:</span> حدود الصفائح التكتونية النشطة.</div>
                <div>• <span className="text-amber-400 font-bold">الخط الأصفر:</span> مدار السرطان الذي يعبر وسط سلطنة عمان.</div>
                <div>• <span className="text-sky-400 font-bold">الخط الأزرق:</span> خط الاستواء.</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* COLLAPSIBLE BOTTOM CONTROL DOCK (Zero Viewport Occlusion, <= 15% footprint) */}
      {/* Pinned to bottom-center with solid/rgba surfaces (no backdrop-filter) */}
      {/* ------------------------------------------------------------------ */}
      <div
        className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-[94vw] max-w-[960px] transition-transform duration-300 ease-in-out pointer-events-auto"
        style={{
          transform: isControlsCollapsed ? 'translate(-50%, calc(100% - 32px))' : 'translate(-50%, 0)'
        }}
      >
        {/* Toggle Collapse Bar */}
        <div className="flex justify-center -mb-2">
          <button
            onClick={() => {
              setIsControlsCollapsed(!isControlsCollapsed);
              triggerSound('chime');
            }}
            className="px-4 py-1 rounded-t-xl bg-slate-900 border-t border-x border-slate-700 text-slate-300 hover:text-white text-[11px] font-bold flex items-center gap-1.5 shadow-lg cursor-pointer"
          >
            {isControlsCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-teal-400" />
                <span>إظهار لوحة التحكم 3D ▴</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-teal-400" />
                <span>إخفاء اللوحة (وضع السينما) ▾</span>
              </>
            )}
          </button>
        </div>

        {/* Main Dock Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl text-white space-y-3.5">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => {
                setSceneMode('earth_layers');
                triggerSound('mode_switch');
              }}
              className={`px-3.5 py-2 rounded-xl font-extrabold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                sceneMode === 'earth_layers'
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Layers className="w-4 h-4 text-amber-300" />
              <span>طبقات الأرض والتفكيك الطبقي</span>
            </button>

            <button
              onClick={() => {
                setSceneMode('relief_oman');
                triggerSound('mode_switch');
              }}
              className={`px-3.5 py-2 rounded-xl font-extrabold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                sceneMode === 'relief_oman'
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Mountain className="w-4 h-4 text-sky-300" />
              <span>تضاريس سلطنة عمان ومسندم 3D</span>
            </button>

            <button
              onClick={() => {
                setSceneMode('rocks_gallery');
                triggerSound('mode_switch');
              }}
              className={`px-3.5 py-2 rounded-xl font-extrabold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                sceneMode === 'rocks_gallery'
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span>متحف الصخور والمعادن</span>
            </button>

            <button
              onClick={() => {
                setSceneMode('tectonic_fault');
                triggerSound('mode_switch');
              }}
              className={`px-3.5 py-2 rounded-xl font-extrabold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                sceneMode === 'tectonic_fault'
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Compass className="w-4 h-4 text-rose-400" />
              <span>الصدوع والفوالق التكتونية</span>
            </button>

            <button
              onClick={() => {
                setSceneMode('globe_plates');
                triggerSound('mode_switch');
              }}
              className={`px-3.5 py-2 rounded-xl font-extrabold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                sceneMode === 'globe_plates'
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>الكرة الأرضية وحركة الصفائح 🪐</span>
            </button>
          </div>

          {/* Contextual Sub-Controls based on Scene Mode */}
          <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            {sceneMode === 'earth_layers' && (
              <div className="flex-1 flex items-center gap-3">
                <span className="text-slate-400 font-bold whitespace-nowrap">التفكيك الطبقي (Exploded View):</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={explosionFactor}
                  onChange={e => {
                    setExplosionFactor(parseFloat(e.target.value));
                    triggerSound('explode_swoosh');
                  }}
                  className="flex-1 accent-teal-500 cursor-pointer"
                />
                <span className="font-mono text-teal-400 font-bold w-12 text-left">
                  {Math.round(explosionFactor * 100)}%
                </span>
              </div>
            )}

            {sceneMode === 'rocks_gallery' && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-slate-400 font-bold whitespace-nowrap">اختر العينة:</span>
                {(Object.keys(ROCKS_DATA) as RockSpecimenId[]).map(rockId => (
                  <button
                    key={rockId}
                    onClick={() => {
                      setSelectedRock(rockId);
                      triggerSound('rock_tap');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                      selectedRock === rockId
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {ROCKS_DATA[rockId].nameAr.split(' ')[0]} {ROCKS_DATA[rockId].nameAr.split(' ')[1]}
                  </button>
                ))}
              </div>
            )}

            {sceneMode === 'tectonic_fault' && (
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold">نوع الصدع:</span>
                  <button
                    onClick={() => {
                      setFaultType('normal');
                      triggerSound('chime');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      faultType === 'normal' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    فالق عادي (انزلاق لأسفل)
                  </button>
                  <button
                    onClick={() => {
                      setFaultType('reverse');
                      triggerSound('chime');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      faultType === 'reverse' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    فالق معكوس (اندفاع لأعلى)
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold">مقدار الإزاحة:</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.02"
                    value={faultDisplacement}
                    onChange={e => setFaultDisplacement(parseFloat(e.target.value))}
                    className="w-32 accent-rose-500 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {sceneMode === 'relief_oman' && (
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-bold">تلميح تدريسي:</span>
                <span className="text-emerald-400">انقر مع السحب بالماوس أو اللمس لتدوير التضاريس ثلاثية الأبعاد والتكبير/التصغير بالعجلة.</span>
              </div>
            )}

            {sceneMode === 'globe_plates' && (
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-bold">تلميح تدريسي:</span>
                <span className="text-sky-300">لاحظ موقع سلطنة عمان عند التقاء الصفيحة العربية وحزام التصادم الجبلي في مضيق هرمز.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
