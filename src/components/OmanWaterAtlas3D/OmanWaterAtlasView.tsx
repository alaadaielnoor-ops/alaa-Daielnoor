import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  WaterFeature,
  WaterLayerCategory,
  GovernorateInfo,
  WilayatInfo
} from './types.ts';
import {
  WATER_LAYER_CONFIGS,
  GOVERNORATES_DATA,
  INITIAL_WATER_FEATURES
} from './waterAtlasData.ts';
import { CesiumGlobeViewer } from './CesiumGlobeViewer.tsx';
import { WaterFeatureDetailModal } from './WaterFeatureDetailModal.tsx';
import { WaterAtlasManagementModal } from './WaterAtlasManagementModal.tsx';
import { WaterAtlasEducationalStudio } from './WaterAtlasEducationalStudio.tsx';
import {
  Search, Layers, Droplets, Filter, Compass, Plus,
  Database, BookOpen, Award, CheckCircle2, ChevronRight,
  ChevronLeft, X, Eye, EyeOff, Shield, Sparkles, MapPin
} from 'lucide-react';

export const OmanWaterAtlasView: React.FC = () => {
  const { showToast } = useApp();

  // Water Features State (Initial data + local storage persistence)
  const [features, setFeatures] = useState<WaterFeature[]>(() => {
    try {
      const saved = localStorage.getItem('oman_water_features_db');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return INITIAL_WATER_FEATURES;
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('oman_water_features_db', JSON.stringify(features));
    } catch (_) {}
  }, [features]);

  // Active Layer Toggles (Default all enabled or selective)
  const [activeLayers, setActiveLayers] = useState<Set<WaterLayerCategory>>(() => {
    const s = new Set<WaterLayerCategory>();
    WATER_LAYER_CONFIGS.filter(l => l.defaultVisible).forEach(l => s.add(l.id));
    return s;
  });

  // Administrative Navigation
  const [selectedGovernorate, setSelectedGovernorate] = useState<GovernorateInfo | null>(null);
  const [selectedWilayat, setSelectedWilayat] = useState<WilayatInfo | null>(null);

  // Selected Feature for Inspection
  const [selectedFeature, setSelectedFeature] = useState<WaterFeature | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchFocused, setSearchFocused] = useState<boolean>(false);

  // View Mode: 2D vs 3D
  const [is2DMode, setIs2DMode] = useState<boolean>(false);

  // Modals & Sub-studios
  const [isManageModalOpen, setIsManageModalOpen] = useState<boolean>(false);
  const [showEducationalStudio, setShowEducationalStudio] = useState<boolean>(false);

  // Collapsible Side Drawer
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState<boolean>(true);

  // Filtered features matching active layers, governorate, wilayat, and search
  const visibleFeatures = useMemo(() => {
    return features.filter(f => {
      if (!activeLayers.has(f.category)) return false;
      if (selectedGovernorate && f.governorateId !== selectedGovernorate.id) return false;
      if (selectedWilayat && f.wilayatId !== selectedWilayat.id) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = f.nameAr.toLowerCase().includes(q) || f.nameEn.toLowerCase().includes(q);
        const matchLocation = f.villageOrLocationAr.toLowerCase().includes(q);
        const matchDesc = f.descriptionAr.toLowerCase().includes(q);
        if (!matchName && !matchLocation && !matchDesc) return false;
      }
      return true;
    });
  }, [features, activeLayers, selectedGovernorate, selectedWilayat, searchQuery]);

  // Layer toggle handler
  const handleToggleLayer = (layerId: WaterLayerCategory) => {
    setActiveLayers(prev => {
      const next = new Set(prev);
      if (next.has(layerId)) {
        next.delete(layerId);
      } else {
        next.add(layerId);
      }
      return next;
    });
  };

  // Toggle all layers
  const handleToggleAllLayers = () => {
    if (activeLayers.size === WATER_LAYER_CONFIGS.length) {
      setActiveLayers(new Set());
    } else {
      setActiveLayers(new Set(WATER_LAYER_CONFIGS.map(l => l.id)));
    }
  };

  // Governorate selection
  const handleSelectGov = (gov: GovernorateInfo | null) => {
    setSelectedGovernorate(gov);
    setSelectedWilayat(null);
    if (gov) {
      showToast(`تم الانتقال إلى ${gov.nameAr} (${gov.wilayats.length} ولايات)`, 'info');
    }
  };

  // Wilayat selection
  const handleSelectWil = (wil: WilayatInfo | null) => {
    setSelectedWilayat(wil);
    if (wil) {
      showToast(`تم تركيز الكاميرا على ${wil.nameAr}`, 'info');
    }
  };

  // Reset hierarchical breadcrumbs
  const handleResetHierarchy = () => {
    setSelectedGovernorate(null);
    setSelectedWilayat(null);
    setSelectedFeature(null);
    setSearchQuery('');
  };

  // Feature selection
  const handleSelectFeature = (feat: WaterFeature | null) => {
    setSelectedFeature(feat);
    if (feat) {
      setIsDetailModalOpen(true);
    }
  };

  // CRUD Handlers
  const handleAddFeature = (newFeat: WaterFeature) => {
    setFeatures(prev => [newFeat, ...prev]);
  };

  const handleUpdateFeature = (updatedFeat: WaterFeature) => {
    setFeatures(prev => prev.map(f => (f.id === updatedFeat.id ? updatedFeat : f)));
  };

  const handleDeleteFeature = (featureId: string) => {
    setFeatures(prev => prev.filter(f => f.id !== featureId));
    if (selectedFeature?.id === featureId) {
      setSelectedFeature(null);
      setIsDetailModalOpen(false);
    }
  };

  const handleImportFeatures = (imported: WaterFeature[]) => {
    setFeatures(prev => [...imported, ...prev]);
  };

  return (
    <div className="space-y-6 select-none font-sans" dir="rtl">
      {/* Top Main Navigation Header */}
      <div className="bg-white dark:bg-slate-900 p-4 md:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-600 via-teal-700 to-sky-800 text-white flex items-center justify-center shadow-md shadow-teal-900/20 shrink-0">
            <Droplets className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>الأطلس الجغرافي المائي ثلاثي الأبعاد لسلطنة عُمان</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800">
                Cesium 3D Globe 🌍
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              منظومة جغرافية ثلاثية الأبعاد لرصد وتوثيق الموارد المائية (الأفلاج، السدود، العيون، محطات التحلية والأحواض)
            </p>
          </div>
        </div>

        {/* Global Toolbar Buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* Educational Studio Toggle */}
          <button
            onClick={() => setShowEducationalStudio(!showEducationalStudio)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
              showEducationalStudio
                ? 'bg-amber-500 text-white border-amber-600 shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-200" />
            <span>{showEducationalStudio ? 'إخفاء القسم التعليمي' : 'القسم التعليمي والاختبارات'}</span>
          </button>

          {/* Manage DB (CRUD) Button */}
          <button
            onClick={() => setIsManageModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <Database className="w-4 h-4 text-teal-600" />
            <span>إدارة قاعدة البيانات (CRUD)</span>
          </button>

          {/* 2D / 3D Toggle */}
          <button
            onClick={() => setIs2DMode(!is2DMode)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer border ${
              is2DMode
                ? 'bg-teal-600 text-white border-teal-700 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
          >
            <Compass className="w-4 h-4 text-amber-300" />
            <span>{is2DMode ? 'الوضع: ثنائي الأبعاد (2D)' : 'الوضع: ثلاثي الأبعاد (3D)'}</span>
          </button>
        </div>
      </div>

      {/* Hierarchical Breadcrumb Navigation Bar */}
      <div className="bg-slate-100/90 dark:bg-slate-900/90 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs flex-wrap">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-bold overflow-x-auto no-scrollbar">
          <button
            onClick={handleResetHierarchy}
            className="hover:text-teal-600 dark:hover:text-teal-400 transition cursor-pointer flex items-center gap-1 shrink-0"
          >
            <span>سلطنة عُمان (الكل)</span>
          </button>

          {selectedGovernorate && (
            <>
              <ChevronLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <button
                onClick={() => setSelectedWilayat(null)}
                className="hover:text-teal-600 dark:hover:text-teal-400 transition cursor-pointer font-black text-teal-700 dark:text-teal-300 shrink-0"
              >
                {selectedGovernorate.nameAr}
              </button>
            </>
          )}

          {selectedWilayat && (
            <>
              <ChevronLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-black text-slate-900 dark:text-white shrink-0">
                {selectedWilayat.nameAr}
              </span>
            </>
          )}

          {selectedFeature && (
            <>
              <ChevronLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-black text-amber-600 dark:text-amber-400 shrink-0">
                {selectedFeature.nameAr}
              </span>
            </>
          )}
        </div>

        {/* Search Input Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="ابحث عن فلج، سد، عين، محطة..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs pr-8 pl-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-2.5 top-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Educational Studio Drawer (If toggled) */}
      {showEducationalStudio && (
        <WaterAtlasEducationalStudio
          features={features}
          onFlyToCoords={coords => {
            // Cesium globe will respond via selectedFeature or coordinate triggers
            showToast(`جاري توجيه الكاميرا إلى الإحداثيات: ${coords.lat}, ${coords.lng}`, 'info');
          }}
          onOpenFeature={fId => {
            const feat = features.find(f => f.id === fId);
            if (feat) handleSelectFeature(feat);
          }}
        />
      )}

      {/* Main 3D Viewport & Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3D Cesium Earth Globe Engine (8 cols on lg) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <CesiumGlobeViewer
            waterFeatures={visibleFeatures}
            activeLayers={activeLayers}
            selectedFeature={selectedFeature}
            onSelectFeature={handleSelectFeature}
            selectedGovernorate={selectedGovernorate}
            selectedWilayat={selectedWilayat}
            onSelectGovernorate={handleSelectGov}
            is2DMode={is2DMode}
            onToggle2D={() => setIs2DMode(!is2DMode)}
          />

          {/* Quick Governorates Carousel Bar */}
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-900 dark:text-white font-black">
                <Compass className="w-3.5 h-3.5 text-teal-600" />
                <span>محافظات سلطنة عُمان الـ 11:</span>
              </span>
              {selectedGovernorate && (
                <button
                  onClick={() => handleSelectGov(null)}
                  className="text-teal-600 hover:underline cursor-pointer"
                >
                  إلغاء التحديد (عرض الكل)
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {GOVERNORATES_DATA.map(gov => {
                const isSelected = selectedGovernorate?.id === gov.id;
                return (
                  <button
                    key={gov.id}
                    onClick={() => handleSelectGov(isSelected ? null : gov)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{gov.nameAr}</span>
                    <span className="text-[10px] opacity-75 bg-black/15 px-1.5 rounded-md">
                      {gov.wilayats.length} و
                    </span>
                  </button>
                );
              })}
            </div>

            {/* If a Governorate is selected, show its Wilayats */}
            {selectedGovernorate && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 shrink-0">
                  ولايات {selectedGovernorate.nameAr}:
                </span>
                {selectedGovernorate.wilayats.map(wil => {
                  const isWilSelected = selectedWilayat?.id === wil.id;
                  return (
                    <button
                      key={wil.id}
                      onClick={() => handleSelectWil(isWilSelected ? null : wil)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                        isWilSelected
                          ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {wil.nameAr}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: 10 Water Layers Controller & Water Features List (4 cols on lg) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          
          {/* Layer Controls Box */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-600" />
                <span>طبقات الموارد المائية الـ 10</span>
              </h4>
              <button
                onClick={handleToggleAllLayers}
                className="text-[11px] text-teal-600 hover:underline font-bold cursor-pointer"
              >
                {activeLayers.size === WATER_LAYER_CONFIGS.length ? 'إخفاء الكل' : 'تفعيل الكل'}
              </button>
            </div>

            {/* 10 Layers List with Toggle Switches */}
            <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1 no-scrollbar">
              {WATER_LAYER_CONFIGS.map(layer => {
                const isActive = activeLayers.has(layer.id);
                const count = features.filter(f => f.category === layer.id).length;

                return (
                  <div
                    key={layer.id}
                    onClick={() => handleToggleLayer(layer.id)}
                    className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                      isActive
                        ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 shadow-2xs'
                        : 'bg-transparent border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-3.5 h-3.5 rounded-md shrink-0 border border-black/20"
                        style={{ backgroundColor: layer.color }}
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                          {layer.nameAr}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block">
                          {layer.nameEn}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono font-bold">
                        {count}
                      </span>
                      {isActive ? (
                        <Eye className="w-3.5 h-3.5 text-teal-600" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filtered Water Features Browser List */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600" />
                <span>المعالم المائية النشطة ({visibleFeatures.length})</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-bold">
                انقر للاستكشاف ثلاثي الأبعاد
              </span>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1 no-scrollbar flex-1">
              {visibleFeatures.map(feat => {
                const isSelected = selectedFeature?.id === feat.id;
                const layerCfg = WATER_LAYER_CONFIGS.find(l => l.id === feat.category);

                return (
                  <div
                    key={feat.id}
                    onClick={() => handleSelectFeature(feat)}
                    className={`p-3 rounded-xl border transition cursor-pointer space-y-1 ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-teal-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: layerCfg?.color || '#0284c7' }}
                        />
                        <h5 className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {feat.nameAr}
                        </h5>
                      </div>
                      {feat.unescoListed && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 font-black shrink-0">
                          اليونسكو
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 truncate">
                      {feat.villageOrLocationAr} · {GOVERNORATES_DATA.find(g => g.id === feat.governorateId)?.nameAr}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 font-mono">
                      <span>{feat.subTypeAr}</span>
                      <span>
                        {feat.hydrologicalProperties.capacityMillionM3
                          ? `${feat.hydrologicalProperties.capacityMillionM3}M م³`
                          : feat.hydrologicalProperties.flowRateLps
                          ? `${feat.hydrologicalProperties.flowRateLps} L/s`
                          : feat.hydrologicalProperties.dailyProductionM3
                          ? `${(feat.hydrologicalProperties.dailyProductionM3 / 1000).toFixed(0)}k م³/يوم`
                          : 'موثق'}
                      </span>
                    </div>
                  </div>
                );
              })}

              {visibleFeatures.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  لا توجد معالم مائية تطابق خيارات التصفية الحالية.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Encyclopedia Detail Modal */}
      {isDetailModalOpen && (
        <WaterFeatureDetailModal
          feature={selectedFeature}
          onClose={() => setIsDetailModalOpen(false)}
          onFlyToFeature={feat => {
            setSelectedFeature(feat);
          }}
        />
      )}

      {/* Database Management (CRUD) Modal */}
      <WaterAtlasManagementModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        features={features}
        onAddFeature={handleAddFeature}
        onUpdateFeature={handleUpdateFeature}
        onDeleteFeature={handleDeleteFeature}
        onImportFeatures={handleImportFeatures}
        showToast={showToast}
      />
    </div>
  );
};
