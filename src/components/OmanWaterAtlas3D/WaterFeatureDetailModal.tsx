import React, { useState, useRef } from 'react';
import { WaterFeature } from './types.ts';
import { WATER_LAYER_CONFIGS, GOVERNORATES_DATA } from './waterAtlasData.ts';
import { useSchoolProfile } from '../../hooks/useSchoolProfile.ts';
import { exportUnifiedPdf } from '../../utils/pdfExport.ts';
import {
  X, Droplets, Shield, Award, MapPin, Calendar, BookOpen,
  Download, Printer, Share2, Compass, Layers, CheckCircle2,
  ExternalLink, Sparkles, AlertTriangle, FileText
} from 'lucide-react';

interface WaterFeatureDetailModalProps {
  feature: WaterFeature | null;
  onClose: () => void;
  onFlyToFeature?: (feature: WaterFeature) => void;
}

export const WaterFeatureDetailModal: React.FC<WaterFeatureDetailModalProps> = ({
  feature,
  onClose,
  onFlyToFeature
}) => {
  const { schoolProfile } = useSchoolProfile();
  const [activeTab, setActiveTab] = useState<'overview' | 'hydrology' | 'heritage' | 'references'>('overview');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const printableAreaRef = useRef<HTMLDivElement>(null);

  if (!feature) return null;

  const layerCfg = WATER_LAYER_CONFIGS.find(l => l.id === feature.category);
  const govInfo = GOVERNORATES_DATA.find(g => g.id === feature.governorateId);
  const wilayatInfo = govInfo?.wilayats.find(w => w.id === feature.wilayatId);

  // PDF Export
  const handleExportPdf = async () => {
    if (!printableAreaRef.current) return;
    setIsExporting(true);
    try {
      await exportUnifiedPdf(printableAreaRef.current, {
        filename: `بطاقة_معلم_مائي_${feature.nameAr.replace(/\s+/g, '_')}.pdf`,
        orientation: 'portrait',
        title: `الأطلس المائي لسلطنة عمان - ${feature.nameAr}`,
        watermark: schoolProfile.schoolName || 'سلطنة عُمان - وزارة التربية والتعليم'
      });
    } catch (e) {
      console.error('PDF export failed:', e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-70 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 md:p-6" dir="rtl">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: layerCfg?.color || '#0284c7' }}
            >
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">
                  {feature.nameAr}
                </h3>
                {feature.unescoListed && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black flex items-center gap-1 shadow-xs">
                    <Award className="w-3 h-3 text-slate-950" />
                    <span>تراث عالمي (اليونسكو)</span>
                  </span>
                )}
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${layerCfg?.badgeBg} ${layerCfg?.badgeText}`}>
                  {feature.subTypeAr}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {feature.nameEn} · {govInfo?.nameAr} · {wilayatInfo?.nameAr}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span>{isExporting ? 'جاري التصدير...' : 'تصدير PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'نظرة عامة والوصف' },
            { id: 'hydrology', label: 'الخصائص الهيدرولوجية والمائية' },
            { id: 'heritage', label: 'الأهمية التاريخية والاقتصادية' },
            { id: 'references', label: 'التوثيق الرسمي والمناهج' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2.5 px-3 text-xs font-black transition cursor-pointer whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body & Printable Area */}
        <div ref={printableAreaRef} className="p-6 overflow-y-auto space-y-6 flex-1 bg-white dark:bg-slate-900">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Feature Hero Card with photo if available */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 min-h-[180px] flex items-end p-5">
                {feature.imageUrls && feature.imageUrls[0] && (
                  <img
                    src={feature.imageUrls[0]}
                    alt={feature.nameAr}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                <div className="relative z-10 text-white space-y-1">
                  <span className="text-xs font-bold text-amber-300">
                    📍 {feature.villageOrLocationAr}
                  </span>
                  <h4 className="text-lg font-black">{feature.nameAr}</h4>
                  <div className="text-xs text-slate-300 font-mono">
                    خط عرض: {feature.coordinates.lat}° N · خط طول: {feature.coordinates.lng}° E · الارتفاع: {feature.coordinates.altitudeM || 0} م
                  </div>
                </div>
              </div>

              {/* Geographic Description */}
              <div className="space-y-2">
                <h5 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-teal-600" />
                  <span>الوصف الجغرافي والمكاني:</span>
                </h5>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  {feature.descriptionAr}
                </p>
              </div>

              {/* Administrative Hierarchy Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-bold">المحافظة:</span>
                  <span className="font-black text-slate-900 dark:text-white text-sm">{govInfo?.nameAr}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-bold">الولاية:</span>
                  <span className="font-black text-slate-900 dark:text-white text-sm">{wilayatInfo?.nameAr}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-bold">الموقع الدقيق:</span>
                  <span className="font-black text-slate-900 dark:text-white text-sm">{feature.villageOrLocationAr}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HYDROLOGICAL PROPERTIES */}
          {activeTab === 'hydrology' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {feature.hydrologicalProperties.capacityMillionM3 && (
                  <div className="p-4 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
                    <span className="text-xs text-teal-700 dark:text-teal-300 font-bold block">السعة التخزينية:</span>
                    <span className="text-xl font-black text-teal-900 dark:text-teal-100">
                      {feature.hydrologicalProperties.capacityMillionM3} مليون م³
                    </span>
                  </div>
                )}

                {feature.hydrologicalProperties.flowRateLps && (
                  <div className="p-4 rounded-2xl bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800">
                    <span className="text-xs text-sky-700 dark:text-sky-300 font-bold block">معدل التدفق الطبيعي:</span>
                    <span className="text-xl font-black text-sky-900 dark:text-sky-100">
                      {feature.hydrologicalProperties.flowRateLps} لتر / ثانية
                    </span>
                  </div>
                )}

                {feature.hydrologicalProperties.temperatureC && (
                  <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                    <span className="text-xs text-amber-700 dark:text-amber-300 font-bold block">درجة حرارة الماء:</span>
                    <span className="text-xl font-black text-amber-900 dark:text-amber-100">
                      {feature.hydrologicalProperties.temperatureC} °C مئوية
                    </span>
                  </div>
                )}

                {feature.hydrologicalProperties.salinityPpm && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-xs text-slate-500 font-bold block">الملوحة الكلية (TDS):</span>
                    <span className="text-lg font-black text-slate-800 dark:text-slate-200">
                      {feature.hydrologicalProperties.salinityPpm} PPM
                    </span>
                  </div>
                )}

                {feature.hydrologicalProperties.damHeightM && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-xs text-slate-500 font-bold block">ارتفاع السد:</span>
                    <span className="text-lg font-black text-slate-800 dark:text-slate-200">
                      {feature.hydrologicalProperties.damHeightM} متر
                    </span>
                  </div>
                )}

                {feature.hydrologicalProperties.catchmentAreaKm2 && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-xs text-slate-500 font-bold block">مساحة الحوض الساكب:</span>
                    <span className="text-lg font-black text-slate-800 dark:text-slate-200">
                      {feature.hydrologicalProperties.catchmentAreaKm2} كم²
                    </span>
                  </div>
                )}

                {feature.hydrologicalProperties.dailyProductionM3 && (
                  <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800">
                    <span className="text-xs text-teal-700 font-bold block">الإنتاج اليومي للمحطة:</span>
                    <span className="text-lg font-black text-teal-900 dark:text-teal-100">
                      {feature.hydrologicalProperties.dailyProductionM3.toLocaleString()} م³/يوم
                    </span>
                  </div>
                )}
              </div>

              {/* Water Type Classification */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-xs font-black text-slate-900 dark:text-white block">
                  💧 التصنيف الهيدرولوجي المعتمد:
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {feature.hydrologicalProperties.waterTypeAr || 'مياه طبيعية خاضعة للمراقبة المستمرة للمنسوب والتدفق.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: HERITAGE & SOCIO-ECONOMIC */}
          {activeTab === 'heritage' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1">
                <h5 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>الأهمية التاريخية والتراثية:</span>
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {feature.historicalSignificanceAr}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1">
                <h5 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-teal-600" />
                  <span>الأهمية الاقتصادية والتنموية:</span>
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {feature.economicSignificanceAr}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1">
                <h5 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-emerald-600" />
                  <span>الأهمية الزراعية والبيئية:</span>
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {feature.agriculturalSignificanceAr} · {feature.ecologicalSignificanceAr}
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: OFFICIAL REFERENCES & CURRICULUM */}
          {activeTab === 'references' && (
            <div className="space-y-4">
              {/* Official Credential Stamp */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <span className="font-black text-emerald-900 dark:text-emerald-200 block text-sm">
                    {feature.documentationStatus === 'officially_verified'
                      ? 'بيانات موثقة رسمياً لدى الجهات الحكومية المختصة'
                      : 'بيانات موثقة بدراسة وبحث علمي محكم'}
                  </span>
                  <p className="text-emerald-800 dark:text-emerald-300">
                    المرجع المعتمد: {feature.officialSource}
                  </p>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono block">
                    تاريخ آخر تحديث ومراجعة: {feature.lastUpdatedDate}
                  </span>
                </div>
              </div>

              {/* Pedagogical Curriculum Linkage */}
              {feature.educationalNotesAr && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1">
                  <span className="text-xs font-black text-amber-900 dark:text-amber-200 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    <span>الربط بمناهج سلطنة عُمان (هذا وطني / الجغرافيا / العلوم):</span>
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {feature.educationalNotesAr}
                  </p>
                </div>
              )}

              {/* Citations list */}
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white block mb-2">
                  📚 المراجع والدراسات العلمية:
                </span>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  {feature.referenceCitations.map((cit, idx) => (
                    <li key={idx}>{cit}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-bold">
            الأطلس المائي ثلاثي الأبعاد لسلطنة عُمان · {schoolProfile.schoolName || 'منصة المعلم الرقمية'}
          </div>

          <div className="flex items-center gap-2">
            {onFlyToFeature && (
              <button
                onClick={() => {
                  onFlyToFeature(feature);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl text-xs font-black bg-teal-600 hover:bg-teal-700 text-white transition cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Compass className="w-4 h-4 text-amber-300" />
                <span>الاقتراب في المشهد ثلاثي الأبعاد</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-white transition cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
