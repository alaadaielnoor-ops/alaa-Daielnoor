import React, { useState } from 'react';
import {
  BarChart3, Droplets, Sun, Wind, CloudRain, Thermometer,
  Layers, Info, Sparkles, CheckCircle2, RotateCcw, Compass, TreePine
} from 'lucide-react';

interface StationData {
  id: string;
  name: string;
  governorate: string;
  altitudeM: number;
  climateType: string;
  description: string;
  monthlyTemp: number[]; // Jan to Dec (°C)
  monthlyRain: number[]; // Jan to Dec (mm)
}

const OMAN_STATIONS: StationData[] = [
  {
    id: 'salalah',
    name: 'محطة صلالة (ظفار)',
    governorate: 'محافظة ظفار',
    altitudeM: 19,
    climateType: 'استوائي موسمي شبه رطب (خريف ظفار)',
    description: 'تنفرد بظاهرة الرياح الموسمية الجنوبية الغربية (خريف صلالة) في شهري يوليو وأغسطس حيث تنخفض درجات الحرارة وتهطل الأمطار الرذاذية والضباب الكثيف.',
    monthlyTemp: [22, 23, 25, 27, 29, 28, 25, 24, 26, 26, 25, 23],
    monthlyRain: [3, 2, 5, 8, 12, 18, 65, 85, 25, 6, 4, 3]
  },
  {
    id: 'muscat',
    name: 'محطة مسقط (السيب)',
    governorate: 'محافظة مسقط',
    altitudeM: 15,
    climateType: 'مداري ساحلي جاف وحار صيفاً',
    description: 'صيف حار ورطب بفعل خليج عمان، وشتاء دافئ معتدل مع أمطار شتوية غير منتظمة ترتبط بالمنخفضات الجوية والحالات المدارية الاستثنائية.',
    monthlyTemp: [20, 22, 25, 30, 34, 36, 35, 33, 32, 29, 25, 22],
    monthlyRain: [15, 22, 18, 10, 2, 1, 1, 2, 0, 1, 6, 12]
  },
  {
    id: 'nizwa',
    name: 'محطة نزوى (الداخلية)',
    governorate: 'محافظة الداخلية',
    altitudeM: 492,
    climateType: 'صحراوي قاري جاف',
    description: 'مناخ قاري داخلي يتميز بمدى حراري يومي وسنوي واسع، صيف شديد الحرارة نهاراً، وشتاء بارد ليلاً، وتندر فيه الأمطار العامة إلا من الروايح الصيفية.',
    monthlyTemp: [19, 21, 25, 31, 36, 38, 37, 36, 33, 29, 24, 20],
    monthlyRain: [8, 14, 16, 12, 4, 3, 15, 18, 5, 2, 3, 9]
  },
  {
    id: 'saiq',
    name: 'محطة سيق (الجبل الأخضر)',
    governorate: 'محافظة الداخلية',
    altitudeM: 1980,
    climateType: 'مناخ البحر المتوسط المعتدل صيفاً والبارد شتاءً',
    description: 'بفعل عامل الارتفاع الشاهق (قرابة 2000 متر)، لا تتجاوز الحرارة صيفاً 25°م وتنخفض شتاءً إلى ما دون الصفر مع تساقط أمطار صيفية ناتجة عن التضاريس (أمطار تضاريسية).',
    monthlyTemp: [10, 12, 16, 20, 24, 26, 25, 24, 22, 18, 14, 11],
    monthlyRain: [25, 35, 45, 30, 18, 15, 40, 50, 20, 10, 12, 22]
  }
];

const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

export const ClimographAndAflajStudio: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'climograph' | 'aflaj'>('climograph');

  // Climograph state
  const [selectedStation, setSelectedStation] = useState<StationData>(OMAN_STATIONS[0]);
  const [tempData, setTempData] = useState<number[]>([...OMAN_STATIONS[0].monthlyTemp]);
  const [rainData, setRainData] = useState<number[]>([...OMAN_STATIONS[0].monthlyRain]);

  // Aflaj Simulator state
  const [selectedFalajType, setSelectedFalajType] = useState<'dawoodi' | 'aini' | 'ghaili'>('dawoodi');
  const [activeComponent, setActiveComponent] = useState<string>('mother_well');

  const handleStationChange = (st: StationData) => {
    setSelectedStation(st);
    setTempData([...st.monthlyTemp]);
    setRainData([...st.monthlyRain]);
  };

  // Climograph Stats
  const annualRainTotal = rainData.reduce((a, b) => a + b, 0);
  const maxTemp = Math.max(...tempData);
  const minTemp = Math.min(...tempData);
  const thermalRange = maxTemp - minTemp;
  const maxTempMonth = MONTHS_AR[tempData.indexOf(maxTemp)];
  const maxRainMonth = MONTHS_AR[rainData.indexOf(Math.max(...rainData))];

  return (
    <div className="space-y-6">
      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <button
          onClick={() => setActiveSubTab('climograph')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'climograph'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-amber-300" />
          <span>محاكي الكلايموتوغراف العُماني (المنحنيات الحرارية المطرية)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('aflaj')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'aflaj'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Droplets className="w-4 h-4 text-cyan-300" />
          <span>محاكي هندسة الأفلاج التفاعلي والتراث المائي (اليونسكو)</span>
          <span className="text-[10px] bg-emerald-700 text-emerald-100 px-1.5 py-0.5 rounded-md">
            الصف 11 و 12
          </span>
        </button>
      </div>

      {/* CLIMOGRAPH SIMULATOR */}
      {activeSubTab === 'climograph' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls & Station Picker (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-teal-600" />
                <span>اختر محطة الأرصاد الجوية العُمانية:</span>
              </span>

              <div className="space-y-2">
                {OMAN_STATIONS.map(st => {
                  const isSelected = selectedStation.id === st.id;
                  return (
                    <div
                      key={st.id}
                      onClick={() => handleStationChange(st)}
                      className={`p-3 rounded-2xl border cursor-pointer transition ${
                        isSelected
                          ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 shadow-xs ring-1 ring-teal-500/40'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 hover:border-teal-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-xs font-black text-slate-900 dark:text-white">
                          {st.name}
                        </strong>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {st.altitudeM} م فوق السطح
                        </span>
                      </div>
                      <p className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold mt-1">
                        {st.climateType}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Station Ecological Card */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 text-xs">
              <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>الخصائص المناخية لمنطقة: {selectedStation.name}</span>
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                {selectedStation.description}
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 text-cyan-900 dark:text-cyan-200 border border-cyan-200 dark:border-cyan-800">
                  <span className="block text-[10px] text-cyan-600 dark:text-cyan-400">إجمالي الأمطار السنوية</span>
                  <strong className="text-sm font-black">{annualRainTotal} ملم</strong>
                </div>
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                  <span className="block text-[10px] text-amber-600 dark:text-amber-400">المدى الحراري السنوي</span>
                  <strong className="text-sm font-black">{thermalRange} °م</strong>
                </div>
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-800">
                  <span className="block text-[10px] text-rose-600 dark:text-rose-400">أعلى الشهور حرارة</span>
                  <strong className="font-bold">{maxTempMonth} ({maxTemp}°م)</strong>
                </div>
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                  <span className="block text-[10px] text-blue-600 dark:text-blue-400">ذروة تساقط الأمطار</span>
                  <strong className="font-bold">{maxRainMonth}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Dual-Axis SVG Climograph Chart (8 cols) */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>الرسم البياني المناخي (Climograph) - {selectedStation.name}</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  المحور الأيمن: درجات الحرارة (°C) • المحور الأيسر: كمية الأمطار (mm)
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 font-bold text-rose-600">
                  <span className="w-3 h-1 bg-rose-600 rounded-full" />
                  <span>منحنى الحرارة (°م)</span>
                </span>
                <span className="flex items-center gap-1.5 font-bold text-cyan-600">
                  <span className="w-3 h-3 bg-cyan-500 rounded-xs" />
                  <span>أعمدة المطر (ملم)</span>
                </span>
              </div>
            </div>

            {/* SVG Chart Graphic */}
            <div className="w-full aspect-[16/9] max-h-[380px] bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 relative flex items-center justify-center">
              <svg viewBox="0 0 700 320" className="w-full h-full select-none">
                {/* Horizontal Grid lines */}
                {[0, 20, 40, 60, 80, 100].map((val, idx) => {
                  const y = 260 - (val / 100) * 220;
                  return (
                    <g key={idx}>
                      <line x1="60" y1={y} x2="640" y2={y} stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />
                      {/* Left axis (Rainfall mm 0-100) */}
                      <text x="50" y={y + 4} fill="#0284c7" fontSize="10" textAnchor="end" fontWeight="bold">
                        {val}
                      </text>
                      {/* Right axis (Temp °C 0-50) */}
                      <text x="650" y={y + 4} fill="#e11d48" fontSize="10" textAnchor="start" fontWeight="bold">
                        {val / 2}°
                      </text>
                    </g>
                  );
                })}

                {/* Base axis line */}
                <line x1="60" y1="260" x2="640" y2="260" stroke="#64748b" strokeWidth="1.5" />

                {/* Rainfall Bars */}
                {rainData.map((rain, idx) => {
                  const barWidth = 26;
                  const x = 75 + idx * 47;
                  const barHeight = Math.min((rain / 100) * 220, 220);
                  const y = 260 - barHeight;

                  return (
                    <g key={`bar-${idx}`} className="group">
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        fill="#06b6d4"
                        fillOpacity="0.85"
                        rx="3"
                        className="transition-all hover:fill-cyan-400 cursor-pointer"
                      />
                      {rain > 0 && (
                        <text
                          x={x + barWidth / 2}
                          y={y - 4}
                          fill="#0369a1"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {rain}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Temperature Curve (Line + Points) */}
                {(() => {
                  const points = tempData.map((temp, idx) => {
                    const x = 75 + idx * 47 + 13;
                    const y = 260 - ((temp * 2) / 100) * 220;
                    return `${x},${y}`;
                  }).join(' ');

                  return (
                    <>
                      <polyline
                        points={points}
                        fill="none"
                        stroke="#e11d48"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="filter drop-shadow-sm"
                      />
                      {tempData.map((temp, idx) => {
                        const x = 75 + idx * 47 + 13;
                        const y = 260 - ((temp * 2) / 100) * 220;
                        return (
                          <g key={`temp-${idx}`}>
                            <circle cx={x} cy={y} r="4.5" fill="#e11d48" stroke="#ffffff" strokeWidth="2" />
                            <text
                              x={x}
                              y={y - 8}
                              fill="#be123c"
                              fontSize="9"
                              fontWeight="bold"
                              textAnchor="middle"
                            >
                              {temp}°
                            </text>
                          </g>
                        );
                      })}
                    </>
                  );
                })()}

                {/* Month labels at bottom */}
                {MONTHS_AR.map((m, idx) => {
                  const x = 75 + idx * 47 + 13;
                  return (
                    <text
                      key={`m-${idx}`}
                      x={x}
                      y="280"
                      fill="#64748b"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {m.slice(0, 3)}
                    </text>
                  );
                })}
              </svg>
            </div>

            {/* Interactive Data Table for Editing Values */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                جدول البيانات الشهرية التفصيلي (يمكنك تعديل أي قيمة لمشاهدة التغير المناخي فوراً):
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <th className="p-1.5 border border-slate-200 dark:border-slate-700">المتغير</th>
                      {MONTHS_AR.map(m => (
                        <th key={m} className="p-1.5 border border-slate-200 dark:border-slate-700 font-bold">
                          {m.slice(0, 3)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-1.5 border border-slate-200 dark:border-slate-700 font-bold text-rose-600 bg-rose-50/40 dark:bg-rose-950/20">
                        الحرارة (°م)
                      </td>
                      {tempData.map((t, idx) => (
                        <td key={idx} className="p-1 border border-slate-200 dark:border-slate-700">
                          <input
                            type="number"
                            value={t}
                            onChange={e => {
                              const val = Number(e.target.value);
                              const updated = [...tempData];
                              updated[idx] = val;
                              setTempData(updated);
                            }}
                            className="w-10 text-center bg-transparent font-bold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-rose-500 rounded"
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-1.5 border border-slate-200 dark:border-slate-700 font-bold text-cyan-600 bg-cyan-50/40 dark:bg-cyan-950/20">
                        المطر (ملم)
                      </td>
                      {rainData.map((r, idx) => (
                        <td key={idx} className="p-1 border border-slate-200 dark:border-slate-700">
                          <input
                            type="number"
                            value={r}
                            onChange={e => {
                              const val = Number(e.target.value);
                              const updated = [...rainData];
                              updated[idx] = val;
                              setRainData(updated);
                            }}
                            className="w-10 text-center bg-transparent font-bold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-cyan-500 rounded"
                          />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* AFLAJ ARCHITECTURAL & HYDROLOGY SIMULATOR */
        <div className="space-y-6">
          {/* Falaj Type Switcher */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                id: 'dawoodi',
                name: 'الفلج الداوودي (Dawoodi)',
                share: '51% من مياه الأفلاج في عمان',
                depth: 'عميق جداً (يصل لعشرات الأمتار في باطن الأرض)',
                examples: 'فلج دارس (نزوى)، فلج الخطمين (بركة الموز)، فلج الملكي (إزكي)',
                desc: 'قنوات مائية جوفية طويلة تشق بعناية فائقة لتصريف المياه من الطبقات المائية الصخرية العميقة إلى السطح بالانحدار الطبيعي.'
              },
              {
                id: 'aini',
                name: 'الفلج العيني (Aini)',
                share: '28% من مياه الأفلاج',
                depth: 'ينبع مباشرة من العيون المائية الجبلية',
                examples: 'فلج الجيلة (صور)، عين الكسفة (الرستاق)، عين الثوارة (نخل)',
                desc: 'تعتمد قنواته على تفجر العيون المائية الطبيعية من السلاسل الجبلية والطبقات الكلسية الغنية بالمعادن والمياه العذبة أو الكبريتية.'
              },
              {
                id: 'ghaili',
                name: 'الفلج الغيلي (Ghaili)',
                share: '21% من مياه الأفلاج',
                depth: 'شبه سطحي في مجاري الأودية',
                examples: 'أفلاج وادي المعاول، أفلاج وادي بني خالد',
                desc: 'تستمد مياهها من المياه شبه السطحية الجارية تحت حصى ورواسب الأودية وتتأثر كمياتها سريعاً بوفرة أو انقطاع الأمطار السنوية.'
              }
            ].map(f => {
              const isSelected = selectedFalajType === f.id;
              return (
                <div
                  key={f.id}
                  onClick={() => setSelectedFalajType(f.id as any)}
                  className={`p-4 rounded-3xl border cursor-pointer transition space-y-2 ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      {f.name}
                    </h4>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                      {f.share}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {f.desc}
                  </p>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-teal-700 dark:text-teal-400 font-semibold">
                    ⭐ نماذج يونسكو: {f.examples}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Architectural Cross-Section Diagram */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-emerald-600" />
                  <span>القطاع الهندسي والتضاريسي للفلج العُماني (نظام الانحدار والجاذبية)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  انقر على أي جزء من أجزاء الفلج للتعرف على وظيفته الهيدرولوجية وأهميته في التراث العالمي
                </p>
              </div>

              <span className="text-xs font-bold px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                UNESCO World Heritage 🇴🇲
              </span>
            </div>

            {/* SVG Engineering Diagram */}
            <div className="aspect-[21/9] w-full max-h-[360px] bg-gradient-to-b from-sky-50 via-amber-50/20 to-amber-950/20 dark:from-slate-950 dark:via-slate-900 dark:to-amber-950/30 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 relative flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 850 320" className="w-full h-full select-none">
                {/* Mountain / Aquifer Profile */}
                <path
                  d="M 0 50 Q 150 20 280 120 Q 500 170 850 210 L 850 320 L 0 320 Z"
                  fill="#78716c"
                  fillOpacity="0.4"
                />

                {/* Underground Water Table (Aquifer) */}
                <path
                  d="M 20 180 Q 120 170 200 220 L 200 320 L 20 320 Z"
                  fill="#0284c7"
                  fillOpacity="0.3"
                />
                <text x="70" y="270" fill="#0369a1" fontSize="12" fontWeight="bold">
                  الحوض الجوفي (Aquifer)
                </text>

                {/* 1. Mother Well (أم الفلج) */}
                <g
                  className="cursor-pointer group"
                  onClick={() => setActiveComponent('mother_well')}
                >
                  <rect x="180" y="100" width="18" height="120" fill={activeComponent === 'mother_well' ? '#10b981' : '#475569'} rx="2" />
                  <circle cx="189" cy="95" r="9" fill={activeComponent === 'mother_well' ? '#10b981' : '#f59e0b'} />
                  <text x="189" y="80" fill="#0f172a" fontSize="11" fontWeight="bold" textAnchor="middle">
                    أم الفلج
                  </text>
                </g>

                {/* 2. Ventilation Shafts (المنافس / ثقوب التهوية) */}
                {[300, 400, 500].map((shaftX, idx) => (
                  <g
                    key={idx}
                    className="cursor-pointer group"
                    onClick={() => setActiveComponent('ventilation_shafts')}
                  >
                    <rect x={shaftX} y={135 + idx * 12} width="14" height={70 - idx * 10} fill={activeComponent === 'ventilation_shafts' ? '#10b981' : '#64748b'} rx="2" />
                    <circle cx={shaftX + 7} cy={130 + idx * 12} r="7" fill={activeComponent === 'ventilation_shafts' ? '#10b981' : '#f59e0b'} />
                    {idx === 1 && (
                      <text x={shaftX + 7} y="115" fill="#0f172a" fontSize="11" fontWeight="bold" textAnchor="middle">
                        المنافس (فتحات التهوية)
                      </text>
                    )}
                  </g>
                ))}

                {/* 3. Underground Falaj Conduit (قناة الفلج الجوفية والسطحية) */}
                <g
                  className="cursor-pointer"
                  onClick={() => setActiveComponent('conduit')}
                >
                  <path
                    d="M 190 220 L 305 210 L 405 200 L 505 190 L 600 185 L 850 215"
                    stroke={activeComponent === 'conduit' ? '#10b981' : '#0284c7'}
                    strokeWidth="10"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 190 220 L 305 210 L 405 200 L 505 190 L 600 185 L 850 215"
                    stroke="#38bdf8"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray="8 4"
                    className="animate-pulse"
                  />
                  <text x="420" y="235" fill="#0369a1" fontSize="11" fontWeight="bold" textAnchor="middle">
                    قناة جريان الماء بانحدار الجاذبية
                  </text>
                </g>

                {/* 4. Shari'a (الشريعة - نقطة الظهور الأول) */}
                <g
                  className="cursor-pointer"
                  onClick={() => setActiveComponent('sharia')}
                >
                  <rect x="585" y="170" width="28" height="25" fill={activeComponent === 'sharia' ? '#10b981' : '#0d9488'} rx="4" />
                  <text x="600" y="160" fill="#0f172a" fontSize="11" fontWeight="bold" textAnchor="middle">
                    الشريعة (نقطة الظهور)
                  </text>
                </g>

                {/* 5. Agricultural Channels & Water Distribution (الأثر والقسمة) */}
                <g
                  className="cursor-pointer"
                  onClick={() => setActiveComponent('athar_distribution')}
                >
                  {/* Palm trees and farms */}
                  <rect x="650" y="210" width="180" height="70" fill={activeComponent === 'athar_distribution' ? '#10b981' : '#15803d'} fillOpacity="0.3" rx="6" />
                  <text x="740" y="240" fill="#166534" fontSize="11" fontWeight="bold" textAnchor="middle">
                    الضواحي والمزارع ونظام الأثر
                  </text>
                  <circle cx="700" cy="265" r="8" fill="#15803d" />
                  <circle cx="740" cy="265" r="8" fill="#15803d" />
                  <circle cx="780" cy="265" r="8" fill="#15803d" />
                </g>
              </svg>
            </div>

            {/* Component Detail Inspector Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs leading-relaxed space-y-2">
              {activeComponent === 'mother_well' && (
                <div>
                  <h4 className="font-extrabold text-sm text-emerald-700 dark:text-emerald-400">
                    🔹 أم الفلج (The Mother Well):
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 mt-1">
                    هي البئر الرئيسية الأولى التي تحفر حتى الوصول إلى الطبقة المائية الجوفية الصخرية (Aquifer). وتعتبر منبع تدفق مياه الفلج، وقد يصل عمقها في بعض الأفلاج الداوودية إلى أكثر من 30 - 50 متراً.
                  </p>
                </div>
              )}

              {activeComponent === 'ventilation_shafts' && (
                <div>
                  <h4 className="font-extrabold text-sm text-amber-700 dark:text-amber-400">
                    🔹 فتحات التهوية والمنافس (Ventilation Shafts):
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 mt-1">
                    سلسلة من الآبار العمودية المتتالية تفصل بين كل منها مسافة (20 - 50 متراً). وظيفتها الهندسية: تزويد العمال بالهواء والأكسجين أثناء حفر وصيانة القناة، إخراج الأتربة والصخور، وتسهيل أعمال الصيانة المستمرة (تعتبر دليلاً على براعة الهندسة العمانية القديمة).
                  </p>
                </div>
              )}

              {activeComponent === 'conduit' && (
                <div>
                  <h4 className="font-extrabold text-sm text-cyan-700 dark:text-cyan-400">
                    🔹 قناة الفلج (Falaj Channel / Conduit):
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 mt-1">
                    نفق مائي شُق بحسابات دقيقة للغاية لضمان انسياب الماء تلقائياً بالاعتماد على ميلان الأرض والجاذبية الأرضية، دون استخدام أي مضخات، وتمتد بطول يتراوح بين بضعة كيلومترات وتصل في بعض الأفلاج إلى أكثر من 12 كم.
                  </p>
                </div>
              )}

              {activeComponent === 'sharia' && (
                <div>
                  <h4 className="font-extrabold text-sm text-teal-700 dark:text-teal-400">
                    🔹 الشريعة (Shari'a - First Emergence):
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 mt-1">
                    هي النقطة الأولى التي يخرج فيها ماء الفلج من باطن الأرض إلى سطح الأرض أمام القرية أو المدينة. ووفق التقاليد والأعراف العمانية، يخصص ماء الشريعة حصراً للشرب والاستخدام المنزلي وطهارة المسجد قبل أن يذهب لري المزارع حفاظاً على نقائه التام.
                  </p>
                </div>
              )}

              {activeComponent === 'athar_distribution' && (
                <div>
                  <h4 className="font-extrabold text-sm text-emerald-800 dark:text-emerald-300">
                    🔹 نظام "الأثر" والقسمة الفلكية العُمانية لتوزيع الحصص المائية:
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 mt-1">
                    نظام هندسي واجتماعي عريق أدرجته منظمة (اليونسكو) كتحفة بشرية استثنائية:
                    يقسم اليوم إلى حصص زمنية تُعرف بـ <strong>(الأثر = 30 دقيقة)</strong>، وتوزع المياه نهاراً برصد حركة ظل الشمس عبر المزولة (اللمد)، وتوزع ليلاً برصد مطالع النجوم وحركتها الفلكية، مما يعكس عبقرية الإنسان العماني في الإدارة المستدامة للموارد الشحيحة.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
