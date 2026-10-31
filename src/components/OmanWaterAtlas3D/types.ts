export type WaterLayerCategory =
  | 'aflaj'               // 1. الأفلاج
  | 'springs'             // 2. العيون والينابيع
  | 'wadis'               // 3. الأودية والمجاري المائية
  | 'dams'                // 4. السدود والحواجز المائية
  | 'wells'               // 5. الآبار وحقول الآبار
  | 'coastal_marine'      // 6. البحار والسواحل والخلجان والجزر
  | 'groundwater_basins'  // 7. الأحواض والمياه الجوفية
  | 'desalination'        // 8. محطات تحلية المياه
  | 'treatment_plants'    // 9. محطات معالجة مياه الصرف وإعادة الاستخدام
  | 'lakes_reservoirs';   // 10. البحيرات والخزانات المائية

export type DocumentationStatus =
  | 'officially_verified'  // موثقة رسمياً (وزارة الثروة الزراعية وموارد المياه)
  | 'scientific_study'    // موثقة بدراسة وبحث علمي محكم
  | 'needs_verification'  // تحتاج إلى التحقق الميداني
  | 'unavailable';        // غير متوفرة

export interface HydrologicalProperties {
  waterTypeAr?: string;          // مثل: فلج داوودي، فلج عيني، فلج غيلي، سد تغذية، سد حماية، مياه كبريتية...
  flowRateLps?: number;          // التدفق باللتر/ثانية
  capacityMillionM3?: number;    // السعة التخزينية بملايين الأمتار المكعبة
  storageCapacityM3?: number;    // السعة بالمتر المكعب
  salinityPpm?: number;          // الملوحة جزء في المليون
  temperatureC?: number;         // درجة حرارة الماء (للعيون الحارة)
  damHeightM?: number;           // ارتفاع السد بالأمتار
  damLengthM?: number;           // طول السد بالأمتار
  catchmentAreaKm2?: number;     // مساحة الحوض الساكب كم²
  spillwayTypeAr?: string;       // نوع المفيض
  depthMeters?: number;          // عمق البئر أو الحوض
  dailyProductionM3?: number;    // الإنتاج اليومي لمحطات التحلية والمعالجة
  distributionNetworkKm?: number;// طول قنوات التوزيع
}

export interface WaterFeature {
  id: string;
  nameAr: string;
  nameEn: string;
  category: WaterLayerCategory;
  subTypeAr: string;
  governorateId: string;
  wilayatId: string;
  villageOrLocationAr: string;
  coordinates: {
    lat: number;
    lng: number;
    altitudeM?: number;
  };
  descriptionAr: string;
  hydrologicalProperties: HydrologicalProperties;
  historicalSignificanceAr: string;
  economicSignificanceAr: string;
  agriculturalSignificanceAr: string;
  ecologicalSignificanceAr: string;
  unescoListed?: boolean;
  documentationStatus: DocumentationStatus;
  officialSource: string;
  lastUpdatedDate: string;
  imageUrls: string[];
  model3DType?: 'dam' | 'falaj_channel' | 'spring' | 'tank' | 'custom_gltf';
  model3DUrl?: string;
  referenceCitations: string[];
  educationalNotesAr?: string;
}

export interface WilayatInfo {
  id: string;
  governorateId: string;
  nameAr: string;
  nameEn: string;
  centerCoords: {
    lat: number;
    lng: number;
    heightM: number;
  };
  descriptionAr: string;
}

export interface GovernorateInfo {
  id: string;
  nameAr: string;
  nameEn: string;
  capitalAr: string;
  centerCoords: {
    lat: number;
    lng: number;
    heightM: number;
  };
  descriptionAr: string;
  wilayats: WilayatInfo[];
  stats: {
    totalAflaj: number;
    totalDams: number;
    totalSprings: number;
    totalWadis: number;
    totalDesalination: number;
  };
}

export interface LayerConfig {
  id: WaterLayerCategory;
  nameAr: string;
  nameEn: string;
  iconName: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  descriptionAr: string;
  defaultVisible: boolean;
}

export interface WaterQuizQuestion {
  id: string;
  titleAr: string;
  targetFeatureId: string;
  governorateId?: string;
  promptAr: string;
  hintAr: string;
  explanationAr: string;
  options?: { id: string; labelAr: string; isCorrect: boolean }[];
  targetCoords: { lat: number; lng: number };
}
