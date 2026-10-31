export type SceneMode = 'earth_layers' | 'relief_oman' | 'rocks_gallery' | 'tectonic_fault' | 'globe_plates';

export type RockSpecimenId = 
  | 'ophiolite' 
  | 'limestone' 
  | 'granite' 
  | 'marble' 
  | 'quartz' 
  | 'sandstone';

export interface EarthLayerInfo {
  id: string;
  nameAr: string;
  nameEn: string;
  depthKm: string;
  temperatureC: string;
  density: string;
  composition: string;
  characteristics: string;
  color: string;
  pedagogicalTip: string;
}

export interface RockSpecimenInfo {
  id: RockSpecimenId;
  nameAr: string;
  nameEn: string;
  type: 'ناري (Igneous)' | 'رسوبي (Sedimentary)' | 'متحول (Metamorphic)';
  formation: string;
  mohsHardness: string;
  density: string;
  omanLocation: string;
  importance: string;
  curriculumLink: string;
  color: string;
}

export interface LandmarkBeacon {
  id: string;
  nameAr: string;
  nameEn: string;
  category: 'peak' | 'strait' | 'valley' | 'desert' | 'port';
  elevationOrDepth: string;
  coordinates: { x: number; y: number; z: number };
  description: string;
  vision2040: string;
}

export interface FaultModelInfo {
  type: 'normal' | 'reverse' | 'strike_slip' | 'folded';
  titleAr: string;
  titleEn: string;
  mechanism: string;
  stressType: string;
  omanExample: string;
  earthquakeRisk: string;
}
