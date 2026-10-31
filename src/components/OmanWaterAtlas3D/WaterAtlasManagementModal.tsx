import React, { useState } from 'react';
import {
  WaterFeature,
  WaterLayerCategory,
  DocumentationStatus
} from './types.ts';
import { WATER_LAYER_CONFIGS, GOVERNORATES_DATA } from './waterAtlasData.ts';
import {
  X, Plus, Edit2, Trash2, Download, Upload,
  CheckCircle2, AlertCircle, Save, Database,
  Layers, MapPin, FileText
} from 'lucide-react';

interface WaterAtlasManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  features: WaterFeature[];
  onAddFeature: (feature: WaterFeature) => void;
  onUpdateFeature: (feature: WaterFeature) => void;
  onDeleteFeature: (featureId: string) => void;
  onImportFeatures: (imported: WaterFeature[]) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const WaterAtlasManagementModal: React.FC<WaterAtlasManagementModalProps> = ({
  isOpen,
  onClose,
  features,
  onAddFeature,
  onUpdateFeature,
  onDeleteFeature,
  onImportFeatures,
  showToast
}) => {
  const [editingFeature, setEditingFeature] = useState<Partial<WaterFeature> | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  // New blank feature template
  const handleStartNew = () => {
    setIsCreatingNew(true);
    setEditingFeature({
      id: `water_${Date.now()}`,
      nameAr: '',
      nameEn: '',
      category: 'aflaj',
      subTypeAr: 'فلج داوودي',
      governorateId: 'gov_muscat',
      wilayatId: 'wil_muscat_city',
      villageOrLocationAr: '',
      coordinates: { lat: 23.5880, lng: 58.3829, altitudeM: 100 },
      descriptionAr: '',
      hydrologicalProperties: { waterTypeAr: 'مياه عذبة طبيعية' },
      historicalSignificanceAr: '',
      economicSignificanceAr: '',
      agriculturalSignificanceAr: '',
      ecologicalSignificanceAr: '',
      unescoListed: false,
      documentationStatus: 'officially_verified',
      officialSource: 'وزارة الثروة الزراعية وموارد المياه',
      lastUpdatedDate: new Date().toISOString().split('T')[0],
      imageUrls: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80'],
      referenceCitations: ['السجلات الرسمية لوزارة الثروة الزراعية وموارد المياه']
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFeature?.nameAr?.trim()) {
      showToast('يرجى إدخال اسم المعلم المائي بالعربية', 'error');
      return;
    }

    const featureToSave = editingFeature as WaterFeature;

    if (isCreatingNew) {
      onAddFeature(featureToSave);
      showToast('تمت إضافة المعلم المائي بنجاح إلى قاعدة البيانات المكانية!', 'success');
    } else {
      onUpdateFeature(featureToSave);
      showToast('تم تحديث بيانات المعلم المائي بنجاح!', 'success');
    }

    setEditingFeature(null);
    setIsCreatingNew(false);
  };

  // Export GeoJSON
  const handleExportGeoJson = () => {
    const geoJson = {
      type: 'FeatureCollection',
      features: features.map(f => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [f.coordinates.lng, f.coordinates.lat, f.coordinates.altitudeM || 0]
        },
        properties: {
          id: f.id,
          nameAr: f.nameAr,
          nameEn: f.nameEn,
          category: f.category,
          subTypeAr: f.subTypeAr,
          governorateId: f.governorateId,
          wilayatId: f.wilayatId,
          village: f.villageOrLocationAr,
          description: f.descriptionAr,
          documentationStatus: f.documentationStatus,
          officialSource: f.officialSource,
          unescoListed: f.unescoListed
        }
      }))
    };

    const blob = new Blob([JSON.stringify(geoJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oman_water_atlas_${Date.now()}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('تم تصدير قاعدة البيانات بصيغة GeoJSON بنجاح!', 'success');
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['المعرف', 'الاسم بالعربية', 'الاسم بالإنجليزية', 'التصنيف', 'المحافظة', 'خط العرض (Lat)', 'خط الطول (Lng)', 'التوثيق'];
    const rows = features.map(f => [
      `"${f.id}"`,
      `"${f.nameAr}"`,
      `"${f.nameEn}"`,
      `"${f.category}"`,
      `"${f.governorateId}"`,
      f.coordinates.lat,
      f.coordinates.lng,
      `"${f.documentationStatus}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oman_water_atlas_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('تم تصدير المعالم بصيغة CSV بنجاح!', 'success');
  };

  // Import JSON / GeoJSON
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        let importedFeatures: WaterFeature[] = [];

        if (parsed.type === 'FeatureCollection' && Array.isArray(parsed.features)) {
          importedFeatures = parsed.features.map((item: any, idx: number) => {
            const p = item.properties || {};
            const coords = item.geometry?.coordinates || [58.38, 23.58, 0];
            return {
              id: p.id || `imported_${Date.now()}_${idx}`,
              nameAr: p.nameAr || 'معلم مائي مستورد',
              nameEn: p.nameEn || 'Imported Water Feature',
              category: (p.category as WaterLayerCategory) || 'aflaj',
              subTypeAr: p.subTypeAr || 'معلم مائي',
              governorateId: p.governorateId || 'gov_muscat',
              wilayatId: p.wilayatId || 'wil_muscat_city',
              villageOrLocationAr: p.village || '',
              coordinates: {
                lng: coords[0] || 58.38,
                lat: coords[1] || 23.58,
                altitudeM: coords[2] || 0
              },
              descriptionAr: p.description || 'تم استيراده من ملف مكاني GeoJSON.',
              hydrologicalProperties: {},
              historicalSignificanceAr: '',
              economicSignificanceAr: '',
              agriculturalSignificanceAr: '',
              ecologicalSignificanceAr: '',
              unescoListed: Boolean(p.unescoListed),
              documentationStatus: 'officially_verified',
              officialSource: p.officialSource || 'بيانات مكانية مستوردة',
              lastUpdatedDate: new Date().toISOString().split('T')[0],
              imageUrls: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80'],
              referenceCitations: ['ملف مكاني مستورد']
            };
          });
        } else if (Array.isArray(parsed)) {
          importedFeatures = parsed;
        }

        if (importedFeatures.length > 0) {
          onImportFeatures(importedFeatures);
          showToast(`تم استيراد ${importedFeatures.length} معلماً مائياً بنجاح!`, 'success');
        } else {
          showToast('لم يتم العثور على معالم صالحة في الملف المرفق.', 'error');
        }
      } catch (err: any) {
        showToast(`فشل قراءة الملف: ${err.message}`, 'error');
      }
    };
    reader.readAsText(file);
  };

  const filteredFeatures = features.filter(f => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return f.nameAr.toLowerCase().includes(q) || f.nameEn.toLowerCase().includes(q) || f.villageOrLocationAr.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6" dir="rtl">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl">
        
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md">
              <Database className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white">
                لوحة إدارة قاعدة البيانات المكانية للأطلس المائي
              </h3>
              <p className="text-xs text-slate-500">
                إضافة وتعديل وحذف المعالم المائية، وضبط الإحداثيات، وتصدير واستيراد البيانات بصيغ GeoJSON وCSV
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toolbar Bar */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={handleStartNew}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-teal-600 hover:bg-teal-700 text-white transition cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة معلم مائي جديد</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition cursor-pointer border border-slate-200 dark:border-slate-700">
              <Upload className="w-3.5 h-3.5 text-teal-600" />
              <span>استيراد GeoJSON</span>
              <input type="file" accept=".json,.geojson" onChange={handleImportFile} className="hidden" />
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportGeoJson}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>تصدير GeoJSON</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>تصدير CSV</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1">
          {editingFeature ? (
            /* EDIT / CREATE FORM */
            <form onSubmit={handleSave} className="space-y-4 max-w-3xl mx-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  {isCreatingNew ? 'إضافة معلم مائي جديد' : `تعديل بيانات: ${editingFeature.nameAr}`}
                </h4>
                <button
                  type="button"
                  onClick={() => setEditingFeature(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  إلغاء التعديل
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    الاسم بالعربية *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingFeature.nameAr || ''}
                    onChange={e => setEditingFeature(prev => ({ ...prev, nameAr: e.target.value }))}
                    placeholder="مثال: فلج دارس، سد وادي ضيقة..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    الاسم بالإنجليزية
                  </label>
                  <input
                    type="text"
                    value={editingFeature.nameEn || ''}
                    onChange={e => setEditingFeature(prev => ({ ...prev, nameEn: e.target.value }))}
                    placeholder="Wadi Dayqah Dam"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    التصنيف والطبقة *
                  </label>
                  <select
                    value={editingFeature.category || 'aflaj'}
                    onChange={e => setEditingFeature(prev => ({ ...prev, category: e.target.value as WaterLayerCategory }))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    {WATER_LAYER_CONFIGS.map(layer => (
                      <option key={layer.id} value={layer.id}>{layer.nameAr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    المحافظة *
                  </label>
                  <select
                    value={editingFeature.governorateId || 'gov_muscat'}
                    onChange={e => setEditingFeature(prev => ({ ...prev, governorateId: e.target.value }))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    {GOVERNORATES_DATA.map(g => (
                      <option key={g.id} value={g.id}>{g.nameAr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    القرية / الموقع
                  </label>
                  <input
                    type="text"
                    value={editingFeature.villageOrLocationAr || ''}
                    onChange={e => setEditingFeature(prev => ({ ...prev, villageOrLocationAr: e.target.value }))}
                    placeholder="قرية المزارع"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    خط العرض (Latitude) *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={editingFeature.coordinates?.lat || 23.5880}
                    onChange={e => setEditingFeature(prev => ({
                      ...prev,
                      coordinates: { ...(prev?.coordinates || { lng: 58.38, altitudeM: 0 }), lat: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    خط الطول (Longitude) *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={editingFeature.coordinates?.lng || 58.3829}
                    onChange={e => setEditingFeature(prev => ({
                      ...prev,
                      coordinates: { ...(prev?.coordinates || { lat: 23.58, altitudeM: 0 }), lng: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    الارتفاع عن البحر (متر)
                  </label>
                  <input
                    type="number"
                    value={editingFeature.coordinates?.altitudeM || 0}
                    onChange={e => setEditingFeature(prev => ({
                      ...prev,
                      coordinates: { ...(prev?.coordinates || { lat: 23.58, lng: 58.38 }), altitudeM: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  الوصف الجغرافي والهيدرولوجي
                </label>
                <textarea
                  rows={3}
                  value={editingFeature.descriptionAr || ''}
                  onChange={e => setEditingFeature(prev => ({ ...prev, descriptionAr: e.target.value }))}
                  placeholder="وصف تفصيلي للمعلم المائي وأهميته..."
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              {/* Status and UNESCO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    درجة التوثيق
                  </label>
                  <select
                    value={editingFeature.documentationStatus || 'officially_verified'}
                    onChange={e => setEditingFeature(prev => ({ ...prev, documentationStatus: e.target.value as DocumentationStatus }))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="officially_verified">موثقة رسمياً (وزارة الثروة الزراعية وموارد المياه)</option>
                    <option value="scientific_study">موثقة بدراسة وبحث علمي محكم</option>
                    <option value="needs_verification">تحتاج إلى التحقق الميداني</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="unesco_check"
                    checked={editingFeature.unescoListed || false}
                    onChange={e => setEditingFeature(prev => ({ ...prev, unescoListed: e.target.checked }))}
                    className="w-4 h-4 rounded-md accent-teal-600"
                  />
                  <label htmlFor="unesco_check" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                    مدرج على قائمة التراث العالمي لليونسكو
                  </label>
                </div>
              </div>

              {/* Save & Cancel */}
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingFeature(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-6 py-2 rounded-xl text-xs font-black bg-teal-600 hover:bg-teal-700 text-white transition cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ المعلم المائي</span>
                </button>
              </div>
            </form>
          ) : (
            /* LIST TABLE OF FEATURES */
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  placeholder="ابحث في سجلات المعالم المائية..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="text-xs px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 w-64"
                />
                <span className="text-xs text-slate-500 font-bold">
                  إجمالي المعالم: {filteredFeatures.length}
                </span>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-xs text-right">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">اسم المعلم المائي</th>
                      <th className="p-3">النوع / الطبقة</th>
                      <th className="p-3">المحافظة</th>
                      <th className="p-3">الإحداثيات</th>
                      <th className="p-3">التوثيق</th>
                      <th className="p-3 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredFeatures.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-slate-900 dark:text-white">
                          {item.nameAr}
                          {item.unescoListed && <span className="text-[10px] text-amber-500 font-black mr-1">⭐</span>}
                        </td>
                        <td className="p-3 text-slate-500">{item.subTypeAr}</td>
                        <td className="p-3 text-slate-500">
                          {GOVERNORATES_DATA.find(g => g.id === item.governorateId)?.nameAr || item.governorateId}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-400">
                          {item.coordinates.lat.toFixed(2)}, {item.coordinates.lng.toFixed(2)}
                        </td>
                        <td className="p-3">
                          <span className="text-[10px] text-emerald-600 font-bold">موثق</span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                setEditingFeature(item);
                                setIsCreatingNew(false);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                              title="تعديل"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`هل أنت متأكد من حذف ${item.nameAr}؟`)) {
                                  onDeleteFeature(item.id);
                                  showToast('تم حذف المعلم بنجاح', 'info');
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
