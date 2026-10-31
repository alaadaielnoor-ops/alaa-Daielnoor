import React, { useState } from 'react';
import {
  Globe, Map, Compass, Wind, Mountain, TrendingUp,
  History, ExternalLink, Search, Sparkles, Layers,
  ChevronRight, Info, Eye, Droplets, Sun, CloudRain,
  Building2, Ship, ArrowUpRight, Maximize2
} from 'lucide-react';

interface MapPreset {
  id: string;
  nameAr: string;
  nameEn: string;
  category: 'oman_landmark' | 'strait' | 'economic_hub' | 'heritage';
  lat: number;
  lng: number;
  description: string;
  vision2040Pillar: string;
}

const PRESET_LOCATIONS: MapPreset[] = [
  {
    id: 'hormuz',
    nameAr: 'مضيق هرمز (مسندم)',
    nameEn: 'Strait of Hormuz',
    category: 'strait',
    lat: 26.5667,
    lng: 56.25,
    description: 'الممر المائي الاستراتيجي الأهم عالمياً لتجارة الطاقة، تشرف عليه سلطنة عمان مباشرة.',
    vision2040Pillar: 'الموقع الجيوسياسي واللوجستيات العالمية'
  },
  {
    id: 'jebel_akhdar',
    nameAr: 'الجبل الأخضر وجبل شمس',
    nameEn: 'Jebel Akhdar Oman',
    category: 'oman_landmark',
    lat: 23.07,
    lng: 57.65,
    description: 'أعلى القمم التضاريسية بالجزيرة العربية (جبل شمس 3009 م)، ومدرجات زراعية فريدة ومناخ معتدل.',
    vision2040Pillar: 'السياحة البيئية والجيولوجية المستدامة'
  },
  {
    id: 'duqm',
    nameAr: 'المنطقة الاقتصادية بالدقم',
    nameEn: 'Duqm Special Economic Zone Oman',
    category: 'economic_hub',
    lat: 19.66,
    lng: 57.70,
    description: 'قطب الصناعات الثقيلة والهيدروجين الأخضر والحوض الجاف على بحر العرب المفتوح.',
    vision2040Pillar: 'التنويع الاقتصادي والطاقة النظيفة'
  },
  {
    id: 'salalah',
    nameAr: 'صلالة وميناء صلالة (ظفار)',
    nameEn: 'Salalah Port Oman',
    category: 'economic_hub',
    lat: 17.01,
    lng: 54.09,
    description: 'ظاهرة خريف صلالة الموسمية، أرض اللبان التراثية، وميناء الحاويات العالمي الأسرع نمواً.',
    vision2040Pillar: 'الاقتصاد الأزرق وسلاسل الإمداد الدولية'
  },
  {
    id: 'falaj_daris',
    nameAr: 'فلج دارس وقلعة نزوى',
    nameEn: 'Nizwa Fort and Falaj Daris',
    category: 'heritage',
    lat: 22.93,
    lng: 57.53,
    description: 'أكبر الأفلاج الداوودية التراثية بسلطنة عمان وقلعة الشهباء المدرجة في التراث الإنساني.',
    vision2040Pillar: 'صون التراث المائي والهوية الوطنية'
  },
  {
    id: 'sohar',
    nameAr: 'ميناء صحار والمنطقة الحرة',
    nameEn: 'Sohar Port Oman',
    category: 'economic_hub',
    lat: 24.49,
    lng: 56.63,
    description: 'بوابة التجارة والصناعات التعدينية والبتروكيماوية وسلة الباطنة الزراعية.',
    vision2040Pillar: 'الصناعات التنافسية وتنمية المحافظات'
  }
];

type MapEngineType = '3d_earth' | 'political_osm' | 'physical_topo' | 'climate_windy' | 'economic_demographic' | 'historical_timelapse';

export const Comprehensive3DMapsHub: React.FC = () => {
  const [selectedEngine, setSelectedEngine] = useState<MapEngineType>('3d_earth');
  const [searchQuery, setSearchQuery] = useState('سلطنة عمان');
  const [searchQueryEn, setSearchQueryEn] = useState('Sultanate of Oman');
  const [selectedPreset, setSelectedPreset] = useState<MapPreset>(PRESET_LOCATIONS[0]);

  // Coordinates for live maps (default: Oman center)
  const [activeLat, setActiveLat] = useState(PRESET_LOCATIONS[0].lat);
  const [activeLng, setActiveLng] = useState(PRESET_LOCATIONS[0].lng);

  const handleSelectPreset = (p: MapPreset) => {
    setSelectedPreset(p);
    setSearchQuery(p.nameAr);
    setSearchQueryEn(p.nameEn);
    setActiveLat(p.lat);
    setActiveLng(p.lng);
  };

  const handleCustomSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchQueryEn(searchQuery.trim());
  };

  // URL Generators according to user brief
  const googleEarthUrl = `https://earth.google.com/web/search/${encodeURIComponent(searchQueryEn || searchQuery)}`;
  const openStreetMapUrl = `https://www.openstreetmap.org/search?query=${encodeURIComponent(searchQuery)}`;
  const openTopoMapUrl = `https://www.opentopomap.org/#search=${encodeURIComponent(searchQueryEn || searchQuery)}`;
  const windyUrl = `https://www.windy.com/?${activeLat},${activeLng},6`;
  const timeLapseUrl = `https://earthengine.google.com/timelapse#v=${activeLat},${activeLng},10.5,latLng&t=3.5`;

  const mapEngines: Array<{
    id: MapEngineType;
    label: string;
    sublabel: string;
    icon: React.ElementType;
    badge: string;
    color: string;
  }> = [
    {
      id: '3d_earth',
      label: 'الخرائط ثلاثية الأبعاد (3D Maps)',
      sublabel: 'محاكاة Google Earth الفضائية والتضاريس ثلاثية الأبعاد',
      icon: Globe,
      badge: '3D Google Earth',
      color: 'from-blue-600 to-indigo-600'
    },
    {
      id: 'political_osm',
      label: 'الخرائط السياسية والإدارية',
      sublabel: 'OpenStreetMap: حدود المحافظات والولايات والعواصم',
      icon: Map,
      badge: 'OpenStreetMap',
      color: 'from-emerald-600 to-teal-600'
    },
    {
      id: 'physical_topo',
      label: 'الخرائط الطبيعية والطبوغرافية',
      sublabel: 'OpenTopoMap: خطوط الكنتور، الارتفاعات، وسلاسل الجبال',
      icon: Mountain,
      badge: 'OpenTopoMap',
      color: 'from-amber-600 to-orange-600'
    },
    {
      id: 'climate_windy',
      label: 'خرائط المناخ والطقس المباشر',
      sublabel: 'Windy: سرعة الرياح، رادار الأمطار، وحرارة بحر العرب',
      icon: Wind,
      badge: 'Windy Live Radar',
      color: 'from-cyan-600 to-sky-600'
    },
    {
      id: 'economic_demographic',
      label: 'الخرائط الاقتصادية والسكانية',
      sublabel: 'الكثافة السكانية، حقول الطاقة، ومناطق الهيدروجين',
      icon: TrendingUp,
      badge: 'رؤية عمان 2040',
      color: 'from-purple-600 to-pink-600'
    },
    {
      id: 'historical_timelapse',
      label: 'الخرائط التاريخية والتغير الزمني',
      sublabel: 'Earth Engine Timelapse: التطور العمراني وتغير السواحل',
      icon: History,
      badge: 'Timelapse (1984-2026)',
      color: 'from-rose-600 to-red-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Search & Location Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 md:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <form onSubmit={handleCustomSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث عن أي موقع في سلطنة عمان أو العالم (مثل: صلالة، مضيق هرمز، الدقم، مسقط، نزوى...)"
              className="w-full pr-10 pl-4 py-2.5 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-bold"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-sm transition flex items-center justify-center gap-2 shrink-0"
          >
            <Compass className="w-4 h-4" />
            <span>تحديث موقع الخرائط</span>
          </button>
        </form>

        {/* Preset Landmarks Chips */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>معالم ومواقع جغرافية عُمانية استراتيجية سريعة:</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_LOCATIONS.map(p => {
              const isSelected = selectedPreset.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400'
                  }`}
                >
                  <span>{p.nameAr}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Map Engine Category Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {mapEngines.map(engine => {
          const Icon = engine.icon;
          const isSelected = selectedEngine === engine.id;
          return (
            <button
              key={engine.id}
              onClick={() => setSelectedEngine(engine.id)}
              className={`p-3 rounded-2xl border text-right transition flex flex-col justify-between space-y-2 ${
                isSelected
                  ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 shadow-sm ring-2 ring-teal-500/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${engine.color} shadow-xs`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {engine.badge}
                </span>
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">
                  {engine.label}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                  {engine.sublabel}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ACTIVE MAP DISPLAY WORKSPACE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs space-y-4 p-5">
        {/* Active Map Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {selectedEngine === '3d_earth' && `محاكاة 3D Google Earth لموقع: ${searchQuery}`}
                {selectedEngine === 'political_osm' && `الخريطة السياسية والإدارية (OpenStreetMap) لـ: ${searchQuery}`}
                {selectedEngine === 'physical_topo' && `الخريطة الكنتورية والطبوغرافية (OpenTopoMap) لـ: ${searchQuery}`}
                {selectedEngine === 'climate_windy' && `خريطة الطقس والمناخ والرياح المباشرة (Windy Radar)`}
                {selectedEngine === 'economic_demographic' && `الخريطة الاقتصادية والديموغرافية لسلطنة عمان`}
                {selectedEngine === 'historical_timelapse' && `الخريطة التاريخية والتغير الزمني (Earth Engine Timelapse)`}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              الموقع الحالي: {selectedPreset.nameAr} • الإحداثيات: {activeLat.toFixed(2)}°N, {activeLng.toFixed(2)}°E
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={
                selectedEngine === '3d_earth'
                  ? googleEarthUrl
                  : selectedEngine === 'political_osm'
                  ? openStreetMapUrl
                  : selectedEngine === 'physical_topo'
                  ? openTopoMapUrl
                  : selectedEngine === 'climate_windy'
                  ? windyUrl
                  : timeLapseUrl
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs"
            >
              <span>فتح في نافذة كاملة مستقلة</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Embedded Dynamic Interactive Map Frame */}
        <div className="relative aspect-[16/9] w-full max-h-[520px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex flex-col justify-between">
          {/* 1. 3D Google Earth Mode */}
          {selectedEngine === '3d_earth' && (
            <div className="w-full h-full relative flex flex-col items-center justify-center p-6 text-center text-white bg-gradient-to-b from-slate-900 via-sky-950 to-slate-950">
              <div className="w-16 h-16 rounded-3xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 mb-3 shadow-lg">
                <Globe className="w-8 h-8 animate-spin-slow" />
              </div>
              <h3 className="text-lg font-black">مستكشف Google Earth 3D التفاعلي</h3>
              <p className="text-xs text-slate-300 max-w-lg mx-auto mt-1 leading-relaxed">
                استكشف التضاريس الجبلية الشاهقة، السواحل العمانية، ومضيق هرمز بمحاكاة فضائية حية ثلاثية الأبعاد بدقة الأقمار الصناعية فائقة الوضوح.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <a
                  href={googleEarthUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg transition flex items-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  <span>انقر هنا للانتقال لـ 3D Google Earth لـ ({searchQuery}) 🚀</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {/* 2. OpenStreetMap Political & Administrative */}
          {selectedEngine === 'political_osm' && (
            <iframe
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${activeLng - 0.8}%2C${activeLat - 0.8}%2C${activeLng + 0.8}%2C${activeLat + 0.8}&layer=mapnik&marker=${activeLat}%2C${activeLng}`}
              className="w-full h-full border-none"
              title="OpenStreetMap Political"
            />
          )}

          {/* 3. OpenTopoMap Physical & Topographical */}
          {selectedEngine === 'physical_topo' && (
            <div className="w-full h-full relative flex flex-col items-center justify-center p-6 text-center text-white bg-gradient-to-b from-amber-950 via-slate-900 to-slate-950">
              <div className="w-16 h-16 rounded-3xl bg-amber-600/30 border border-amber-400/40 flex items-center justify-center text-amber-300 mb-3 shadow-lg">
                <Mountain className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black">الخريطة الكنتورية والطبوغرافية (OpenTopoMap)</h3>
              <p className="text-xs text-slate-300 max-w-lg mx-auto mt-1 leading-relaxed">
                استعرض خطوط الارتفاعات المتساوية (الكنتور)، تدرج سفوح جبال الحجر وجبل شمس، ومسارات تصريف الأودية الجافة ومجاري السيول بالسلطنة.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <a
                  href={openTopoMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow-lg transition flex items-center gap-2"
                >
                  <Mountain className="w-4 h-4" />
                  <span>فتح OpenTopoMap التضاريسية لـ ({searchQuery})</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {/* 4. Windy Live Weather & Cyclone Tracking */}
          {selectedEngine === 'climate_windy' && (
            <iframe
              src={`https://embed.windy.com/embed2.html?lat=${activeLat}&lon=${activeLng}&detailLat=${activeLat}&detailLon=${activeLng}&width=750&height=450&zoom=6&level=surface&overlay=wind&product=ecmwf&menu=&message=true&marker=true&calendar=now&pressure=true&type=map&location=coordinates&detail=true&metricWind=default&metricTemp=default&radarRange=-1`}
              className="w-full h-full border-none"
              title="Windy Live Weather Radar"
            />
          )}

          {/* 5. Economic & Demographic Maps */}
          {selectedEngine === 'economic_demographic' && (
            <div className="w-full h-full p-6 bg-slate-900 text-white overflow-y-auto space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-sm font-black text-amber-300 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>الخريطة الجيو-اقتصادية والديموغرافية لسلطنة عمان (رؤية 2040)</span>
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-600 text-white">
                  بيانات وزارة الاقتصاد
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                  <strong className="text-teal-400 block font-bold">1. ممرات الهيدروجين الأخضر (هايدروم)</strong>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    تخصيص مساحات تتجاوز 50,000 كم² في محافظتي الوسطى (الدقم) وظفار لإنتاج وتصدير الطاقة النظيفة للأسواق العالمية.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                  <strong className="text-cyan-400 block font-bold">2. الكثافة السكانية ومحور الباطنة ومسقط</strong>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    يتركز قرابة 65% من سكان السلطنة في الحزام الساحلي الممتد من مسقط حتى شمال الباطنة، بفعل توفر السهول الزراعية والموانئ الصناعية.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                  <strong className="text-purple-400 block font-bold">3. المثلث اللوجستي للموانئ العمانية</strong>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    تكامل موانئ (صحار، الدقم، صلالة) يوفر ترانزيت مباشر مع خطوط التجارة العالمية في آسيا وأوروبا وأفريقيا دون الحاجة للمرور عبر مضيق هرمز.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-teal-950/40 border border-teal-800 text-[11px] text-teal-200">
                💡 <strong>الربط التعليمي بالمنهج:</strong> يتطابق هذا المكون مباشرة مع الوحدة الثانية لمادة "هذا وطني" للصف 12 (التنمية المستدامة والتنويع الاقتصادي).
              </div>
            </div>
          )}

          {/* 6. Historical & Timelapse */}
          {selectedEngine === 'historical_timelapse' && (
            <div className="w-full h-full relative flex flex-col items-center justify-center p-6 text-center text-white bg-gradient-to-b from-rose-950 via-slate-900 to-slate-950">
              <div className="w-16 h-16 rounded-3xl bg-rose-600/30 border border-rose-400/40 flex items-center justify-center text-rose-300 mb-3 shadow-lg">
                <History className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black">التغير الزمني الفضائي (Google Earth Timelapse)</h3>
              <p className="text-xs text-slate-300 max-w-lg mx-auto mt-1 leading-relaxed">
                شاهد التغيرات الحضرية والبيئية لسلطنة عمان عبر صور الأقمار الصناعية الملتقطة على مدار 40 عاماً (من 1984 حتى 2026)، وتتبع تشييد ميناء الدقم، توسع مسقط، وتطور السدود.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <a
                  href={timeLapseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg transition flex items-center gap-2"
                >
                  <History className="w-4 h-4" />
                  <span>فتح التغير الزمني الفضائي Timelapse لـ ({searchQuery})</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Vision 2040 Pedagogical Analysis Box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <span className="font-extrabold text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>مواءمة الموقع مع رؤية عُمان 2040 ({selectedPreset.vision2040Pillar}):</span>
            </span>
            <p className="text-slate-700 dark:text-slate-300">
              {selectedPreset.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              أولوية تنمية المحافظات 🇴🇲
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
