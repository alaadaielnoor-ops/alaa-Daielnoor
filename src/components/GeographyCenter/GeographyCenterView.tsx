import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { GeographicResource } from '../../types/index.ts';
import {
  Compass, Map, Satellite, BarChart3, Plus,
  ExternalLink, ZoomIn, Info, CheckCircle2, X, Sparkles,
  Layers, Droplets, BookOpen, Award, ArrowRight
} from 'lucide-react';
import { OmanInteractiveAtlas } from './OmanInteractiveAtlas.tsx';
import { AIMapAnalystModal } from './AIMapAnalystModal.tsx';
import { ClimographAndAflajStudio } from './ClimographAndAflajStudio.tsx';
import { Comprehensive3DMapsHub } from './Comprehensive3DMapsHub.tsx';
import { Geological3DStudio } from '../Geology3D/Geological3DStudio.tsx';
import { GeologicalMapsGallery } from '../GeologicalMaps/GeologicalMapsGallery.tsx';
import { OmanWaterAtlasView } from '../OmanWaterAtlas3D/OmanWaterAtlasView.tsx';

type GeographyCenterTab = 'water_atlas_3d' | 'geology_maps' | 'atlas' | 'three_geology' | '3d_hub' | 'ai_analyst' | 'simulator' | 'repository';


export const GeographyCenterView: React.FC = () => {
  const { showToast } = useApp();

  // Main active tab
  const [activeMainTab, setActiveMainTab] = useState<GeographyCenterTab>('atlas');

  // Repository state
  const [resources, setResources] = useState<GeographicResource[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [inspectingGeo, setInspectingGeo] = useState<GeographicResource | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // AI Analyst modal
  const [isAnalystOpen, setIsAnalystOpen] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState<{ url: string; title: string } | undefined>(undefined);

  // New geo resource state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<GeographicResource['category']>('physical_map');
  const [newRegion, setNewRegion] = useState('');
  const [newScale, setNewScale] = useState('1:500,000');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    loadGeography();
  }, [selectedCategory]);

  const loadGeography = async () => {
    try {
      const res = await api.getGeographicResources(selectedCategory);
      if (res.success && res.geographicResources) {
        setResources(res.geographicResources);
      }
    } catch (e) {
      console.warn('Error loading geography resources:', e);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await api.addGeographicResource({
        id: `geo-${Date.now()}`,
        title: newTitle,
        category: newCategory,
        regionName: newRegion || 'الشرق الأوسط وشبه الجزيرة العربية',
        scale: newScale,
        imageUrl: newImageUrl || 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80',
        description: newDescription || 'مورد جغرافي تعليمي',
        educationalApplications: ['التحليل الكارتوغرافي وقراءة الرموز الاصطلاحية', 'الربط بين التضاريس والأنماط المناخية'],
        license: 'ترخيص الاستخدام التعليمي الحر',
        tags: ['خريطة', 'جغرافيا'],
        createdAt: new Date().toISOString()
      });

      if (res.success && res.geographicResource) {
        setResources(prev => [res.geographicResource, ...prev]);
        setShowAddModal(false);
        showToast('تمت إضافة المورد الجغرافي بنجاح!', 'success');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleOpenAIAnalystFor = (geo: GeographicResource) => {
    setAnalyzingImage({
      url: geo.imageUrl,
      title: geo.title
    });
    setIsAnalystOpen(true);
  };

  const categories = [
    { id: 'all', label: 'كافة الموارد', icon: Compass },
    { id: 'physical_map', label: 'خرائط طبيعية وتضاريسية', icon: Map },
    { id: 'satellite', label: 'صور أقمار صناعية واستشعار', icon: Satellite },
    { id: 'climate_chart', label: 'رسوم مناخية (كلايموتوغراف)', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <span>المركز الجغرافي والأطلس الذكي المتكامل</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-600 text-white font-black shadow-xs">
              سلطنة عُمان 🇴🇲
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            أطلس تفاعلي شامل للمحافظات، استوديو الخرائط الصماء، مُحلل الخرائط الذكي (AI Vision)، ومحاكي الأفلاج والمناخ
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setAnalyzingImage(undefined);
              setIsAnalystOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold transition shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>مُحلل الخرائط بالذكاء الاصطناعي</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 text-slate-700 dark:text-slate-200 text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4 text-teal-600" />
            <span>إضافة مورد جديد</span>
          </button>
        </div>
      </div>

      {/* Main Feature Navigation Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 p-1.5 bg-slate-100/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <button
          onClick={() => setActiveMainTab('water_atlas_3d')}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-black transition cursor-pointer ${
            activeMainTab === 'water_atlas_3d'
              ? 'bg-gradient-to-r from-teal-600 to-sky-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Droplets className="w-4 h-4 text-sky-300 shrink-0" />
          <span className="truncate">الأطلس المائي 3D 🌊</span>
        </button>

        <button
          onClick={() => setActiveMainTab('geology_maps')}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-black transition cursor-pointer ${
            activeMainTab === 'geology_maps'
              ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Map className="w-4 h-4 text-amber-300 shrink-0" />
          <span className="truncate">معرض خرائط الصخور 🗺️</span>
        </button>

        <button
          onClick={() => setActiveMainTab('three_geology')}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-black transition cursor-pointer ${
            activeMainTab === 'three_geology'
              ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-sm border border-slate-200/60 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
          <span className="truncate">المجسمات و3D 🪐</span>
        </button>

        <button
          onClick={() => setActiveMainTab('atlas')}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-black transition cursor-pointer ${
            activeMainTab === 'atlas'
              ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-sm border border-slate-200/60 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4 text-teal-600 shrink-0" />
          <span className="truncate">الأطلس والصماء 🇴🇲</span>
        </button>

        <button
          onClick={() => setActiveMainTab('3d_hub')}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-black transition cursor-pointer ${
            activeMainTab === '3d_hub'
              ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-sm border border-slate-200/60 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Map className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="truncate">الخرائط التفاعلية 🌐</span>
        </button>

        <button
          onClick={() => {
            setActiveMainTab('ai_analyst');
            setIsAnalystOpen(true);
          }}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-black transition cursor-pointer ${
            activeMainTab === 'ai_analyst'
              ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-sm border border-slate-200/60 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="truncate">مُحلل الخرائط (AI)</span>
        </button>

        <button
          onClick={() => setActiveMainTab('simulator')}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-black transition cursor-pointer ${
            activeMainTab === 'simulator'
              ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-sm border border-slate-200/60 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Droplets className="w-4 h-4 text-cyan-600 shrink-0" />
          <span className="truncate">المناخ والأفلاج</span>
        </button>

        <button
          onClick={() => setActiveMainTab('repository')}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-black transition cursor-pointer ${
            activeMainTab === 'repository'
              ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-sm border border-slate-200/60 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="truncate">المستودع ({resources.length})</span>
        </button>
      </div>

      {/* TAB: OMAN 3D WATER ATLAS (CESIUM GLOBE) */}
      {activeMainTab === 'water_atlas_3d' && (
        <OmanWaterAtlasView />
      )}

      {/* TAB: GEOLOGICAL MAPS GALLERY & ROCK DISTRIBUTION */}
      {activeMainTab === 'geology_maps' && (
        <GeologicalMapsGallery />
      )}

      {/* TAB 0: THREE.JS 3D GEOLOGICAL & GEOGRAPHIC STUDIO */}
      {activeMainTab === 'three_geology' && (
        <Geological3DStudio />
      )}

      {/* TAB 1: OMAN INTERACTIVE ATLAS & BLIND MAP QUIZ */}
      {activeMainTab === 'atlas' && (
        <OmanInteractiveAtlas />
      )}

      {/* TAB 2: COMPREHENSIVE 3D & LIVE MAPS HUB (Google Earth, OSM, OpenTopo, Windy) */}
      {activeMainTab === '3d_hub' && (
        <Comprehensive3DMapsHub />
      )}


      {/* TAB 2: AI MAP ANALYST INLINE PREVIEW */}
      {activeMainTab === 'ai_analyst' && (
        <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-emerald-950 text-white p-8 rounded-3xl border border-teal-500/30 shadow-xl space-y-4 text-center">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-teal-600/30 border border-teal-400/40 flex items-center justify-center text-amber-300 shadow-lg">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black">محلل الخرائط والمرئيات الفضائية بالذكاء الاصطناعي (Gemini 3.8 Flash Vision)</h3>
          <p className="text-xs md:text-sm text-teal-100/80 max-w-xl mx-auto leading-relaxed">
            ارفع أي خريطة تضاريسية، جيولوجية، كنتورية، أو مرئية فضائية لمضيق هرمز أو خليج عمان، ليقوم المساعد الذكي بفحص أركانها الكارتوجرافية، تحليل الظواهر الجيومكانية، وصياغة أسئلة امتحانات وزارية من واقع الخريطة!
          </p>
          <button
            onClick={() => setIsAnalystOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs shadow-lg transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>فتح نافذة التحليل الكارتوجرافي الذكي الآن</span>
          </button>
        </div>
      )}

      {/* TAB 3: CLIMOGRAPH & UNESCO AFLAJ SIMULATOR */}
      {activeMainTab === 'simulator' && (
        <ClimographAndAflajStudio />
      )}

      {/* TAB 4: REPOSITORY & GALLERY */}
      {activeMainTab === 'repository' && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map(c => {
              const Icon = c.icon;
              const isActive = selectedCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition border ${
                    isActive
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-teal-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((res) => (
              <div
                key={res.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col group"
              >
                {/* Image Box */}
                <div className="relative aspect-[16/10] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={res.imageUrl}
                    alt={res.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-white border border-white/20">
                      {res.category === 'physical_map' ? 'خريطة طبيعية' :
                       res.category === 'satellite' ? 'مرئية فضائية' :
                       res.category === 'climate_chart' ? 'كلايموتوغراف' : 'مورد جغرافي'}
                    </span>
                  </div>

                  {res.scale && (
                    <div className="absolute bottom-3 left-3">
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-xs">
                        المقياس: {res.scale}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 font-bold">
                      <Compass className="w-3.5 h-3.5" />
                      <span>{res.regionName}</span>
                    </div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white line-clamp-1">
                      {res.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {res.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleOpenAIAnalystFor(res)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>تحليل بالذكاء الاصطناعي</span>
                    </button>

                    <button
                      onClick={() => setInspectingGeo(res)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950 hover:text-teal-600 transition"
                      title="معاينة تفاصيل الخريطة"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INSPECTOR MODAL */}
      {inspectingGeo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {inspectingGeo.title}
              </h3>
              <button
                onClick={() => setInspectingGeo(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <img
                src={inspectingGeo.imageUrl}
                alt={inspectingGeo.title}
                className="w-full max-h-[380px] object-contain rounded-2xl bg-black"
              />
              <div className="space-y-2 text-xs">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{inspectingGeo.description}</p>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                    الإقليم: <strong>{inspectingGeo.regionName}</strong>
                  </span>
                  <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                    المقياس: <strong>{inspectingGeo.scale || 'غير محدد'}</strong>
                  </span>
                  <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                    الترخيص: <strong>{inspectingGeo.license}</strong>
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => {
                  handleOpenAIAnalystFor(inspectingGeo);
                  setInspectingGeo(null);
                }}
                className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>تحليل الخريطة بالذكاء الاصطناعي</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI MAP ANALYST MODAL */}
      <AIMapAnalystModal
        isOpen={isAnalystOpen}
        onClose={() => setIsAnalystOpen(false)}
        preselectedImage={analyzingImage}
      />

      {/* ADD RESOURCE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black">إضافة خريطة أو مورد جغرافي</h3>
              <button onClick={() => setShowAddModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">عنوان المورد أو الخريطة</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="مثال: خريطة محافظات سلطنة عمان التضاريسية"
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">التصنيف</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="physical_map">خريطة طبيعية وتضاريسية</option>
                    <option value="satellite">مرئية فضائية واستشعار</option>
                    <option value="climate_chart">رسم مناخي</option>
                    <option value="political_map">خريطة سياسية وإدارية</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">المقياس الكارتوغرافي</label>
                  <input
                    type="text"
                    value={newScale}
                    onChange={e => setNewScale(e.target.value)}
                    placeholder="1:500,000"
                    className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1">رابط الصورة (URL)</label>
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={e => setNewImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">الوصف والتحليل التعليمي</label>
                <textarea
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-teal-600 text-white font-bold"
              >
                حفظ وإدراج في المركز الجغرافي
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
