export type RockTypeCategory = 'all' | 'igneous' | 'sedimentary' | 'metamorphic' | 'quaternary';

export type GeologicalEpoch = 'all' | 'precambrian' | 'paleozoic' | 'mesozoic' | 'cenozoic' | 'quaternary';

export type EconomicMineralFilter = 'all' | 'copper_chromite' | 'marble_limestone' | 'oil_gas' | 'groundwater' | 'silica_sand';

export type GeologicalMapThemeId = 
  | 'comprehensive'       // الخريطة الجيولوجية العامة الشاملة
  | 'ophiolite_belt'     // خريطة حزام أفيوليت سمائل والقشرة المحيطية
  | 'economic_minerals'   // خريطة الثروات المعدنية والمحاجر
  | 'karst_limestone'    // خريطة الحجر الجيري والكهوف الكارستية
  | 'stratigraphy';      // خريطة العصور والطبقات الجيولوجية

export interface MineralComposition {
  nameAr: string;
  nameEn: string;
  percent: number;
  color: string;
}

export interface PedagogicalQuestion {
  question: string;
  answer: string;
  gradeLevel: string;
  curriculumTopic: string;
}

export interface RockDistributionItem {
  id: string;
  nameAr: string;
  nameEn: string;
  scientificName: string;
  category: 'igneous' | 'sedimentary' | 'metamorphic' | 'quaternary';
  color: string;
  hatchPatternId?: string;
  areaKm2: number;
  percentageInOman: number;
  agePeriod: string;
  geologicalEpoch: 'precambrian' | 'paleozoic' | 'mesozoic' | 'cenozoic' | 'quaternary';
  tectonicOrigin: string;
  mainFormations: string[];
  mainGovernorates: string[];
  famousSites: string[];
  mineralComposition: MineralComposition[];
  densityGcm3: string;
  mohsHardness: string;
  economicUses: string[];
  primaryMineralsFound: string[];
  pedagogicalQuestions: PedagogicalQuestion[];
  threeModelSpecimenId?: 'ophiolite' | 'limestone' | 'granite' | 'marble' | 'sandstone';
  fieldCharacteristics: string;
  imageUrl: string;
}

export interface GeologicalPolygon {
  id: string;
  rockId: string;
  zoneName: string;
  svgPath: string;
  centerCoords: { x: number; y: number };
  fillColor: string;
  strokeColor?: string;
  hatchPattern?: string;
  label?: string;
  regionId: string;
}

export interface GeographicRegion {
  id: string;
  nameAr: string;
  nameEn: string;
  governorates: string[];
  viewBox: { x: number; y: number; width: number; height: number };
  zoomLevel: number;
  center: { x: number; y: number };
  description: string;
  dominantRocks: string[];
  geologicHighlights: string[];
  famousLandmarks: {
    nameAr: string;
    coords: { x: number; y: number };
    elevationM?: number;
    rockType: string;
    description: string;
  }[];
  curriculumLinks: string[];
}

export interface MineralDepositMarker {
  id: string;
  nameAr: string;
  type: 'copper' | 'chromite' | 'marble' | 'limestone' | 'oil_gas' | 'water' | 'silica';
  coords: { x: number; y: number };
  siteName: string;
  rockContext: string;
  economicStatus: string;
}

export interface GeologicalMapTheme {
  id: GeologicalMapThemeId;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  scaleRatio: string;
  legendTitle: string;
  description: string;
  highlightedRockIds?: string[];
}
