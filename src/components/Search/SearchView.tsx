import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { Resource, Subject } from '../../types/index.ts';
import {
  Search, BookOpen, ExternalLink, Bookmark, Sparkles,
  Filter, Layers, ArrowRight, CheckCircle2, Star, Clock
} from 'lucide-react';

export const SearchView: React.FC = () => {
  const {
    searchInitialQuery,
    setSearchInitialQuery,
    setSelectedResourceIdForPreview,
    setActiveView
  } = useApp();

  const [query, setQuery] = useState(searchInitialQuery || '');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Filters
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedScopeResourceIds, setSelectedScopeResourceIds] = useState<string[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [savedSearches, setSavedSearches] = useState<string[]>([
    'الصفائح التكتونية واتساع البحر الأحمر',
    'الحرات البركانية في شبه الجزيرة العربية',
    'نطاقات الضغط الجوي والرياح',
    'خطوط الكنتور ومقياس الرسم'
  ]);

  useEffect(() => {
    loadTaxonomyAndResources();
    if (searchInitialQuery) {
      executeSearch(searchInitialQuery);
      setSearchInitialQuery('');
    }
  }, []);

  const loadTaxonomyAndResources = async () => {
    try {
      const [taxRes, recRes] = await Promise.all([
        api.getTaxonomy(),
        api.getResources()
      ]);
      if (taxRes.success && taxRes.taxonomy) {
        setSubjects(taxRes.taxonomy.subjects || []);
      }
      if (recRes.success && recRes.resources) {
        setAllResources(recRes.resources);
      }
    } catch (e) {
      console.warn('Error loading search taxonomy:', e);
    }
  };

  const executeSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    setHasSearched(true);

    try {
      const res = await api.searchLibrary(
        searchTerm.trim(),
        selectedScopeResourceIds.length > 0 ? selectedScopeResourceIds : undefined,
        selectedSubjectId || undefined
      );

      if (res.success && res.results) {
        setResults(res.results);
      }
    } catch (err: any) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleSavedSearchClick = (term: string) => {
    setQuery(term);
    executeSearch(term);
  };

  const toggleScopeResource = (resId: string) => {
    setSelectedScopeResourceIds(prev =>
      prev.includes(resId) ? prev.filter(id => id !== resId) : [...prev, resId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Search className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <span>البحث الذكي والهجين في نصوص المكتبة</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          بحث دلالي ونصوصي دقيق داخل صفحات الكتب وأدلة المعلم مع رقم الصفحة الموثقة
        </p>
      </div>

      {/* Search Input Box */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <form onSubmit={handleFormSubmit} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن مفهوم، موضوع، سؤال، أو نص مقتبس (مثال: أسباب اتساع البحر الأحمر، الحرات البركانية...)"
            className="w-full pl-28 pr-12 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 shadow-inner"
          />
          <Search className="w-5 h-5 text-teal-600 dark:text-teal-400 absolute right-4 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
          >
            {isSearching ? 'جارٍ البحث...' : 'بحث متقدم'}
          </button>
        </form>

        {/* Saved Searches / Shortcuts */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-500" />
            <span>عمليات بحث نموذجية:</span>
          </span>
          {savedSearches.map((term, i) => (
            <button
              key={i}
              onClick={() => handleSavedSearchClick(term)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950 hover:text-teal-700 dark:hover:text-teal-300 transition text-[11px] font-medium"
            >
              {term}
            </button>
          ))}
        </div>

        {/* Filter controls: Scope Resources & Subject */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-500 font-bold">
              <Filter className="w-3.5 h-3.5" />
              <span>نطاق البحث:</span>
            </div>

            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs focus:outline-none"
            >
              <option value="">جميع المواد الدراسية</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="text-[11px] text-slate-400">
            {selectedScopeResourceIds.length > 0 ? (
              <span className="text-teal-600 font-bold">
                محدد داخل {selectedScopeResourceIds.length} مصادر مختارة
              </span>
            ) : (
              <span>البحث شامل لجميع كتب ومصادر المكتبة</span>
            )}
          </div>
        </div>

        {/* Book Scope Checkboxes (Filter within specific books) */}
        {allResources.length > 0 && (
          <div className="pt-2 flex flex-wrap gap-2 text-xs">
            <span className="text-[11px] text-slate-400 self-center">تحديد كتب معينة:</span>
            {allResources.slice(0, 4).map(res => {
              const isSelected = selectedScopeResourceIds.includes(res.id);
              return (
                <button
                  key={res.id}
                  onClick={() => toggleScopeResource(res.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition border ${
                    isSelected
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-500'
                  }`}
                >
                  {res.title.slice(0, 32)}...
                </button>
              );
            })}
            {selectedScopeResourceIds.length > 0 && (
              <button
                onClick={() => setSelectedScopeResourceIds([])}
                className="text-[10px] text-rose-500 hover:underline self-center mr-1"
              >
                إلغاء التحديد
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results List */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span className="font-bold text-slate-700 dark:text-slate-300">
            نتائج البحث {hasSearched && `(${results.length} مقطع متطابق)`}
          </span>
          {results.length > 0 && (
            <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
              مرتبة حسب درجة التطابق الدلالي والصلة العلمية
            </span>
          )}
        </div>

        {isSearching ? (
          <div className="p-12 text-center text-slate-400">
            <Search className="w-8 h-8 animate-bounce mx-auto text-teal-500 mb-2" />
            <p className="text-sm font-bold">جارٍ البحث الدلالي في صفحات ومقاطع المكتبة...</p>
          </div>
        ) : hasSearched && results.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <Search className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">لم يتم العثور على نتائج مطابقة</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              جرب استخدام كلمات مفتاحية أخرى، أو وسّع نطاق البحث ليشمل كافة الكتب والمواد الدراسية.
            </p>
          </div>
        ) : (
          results.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 transition shadow-xs space-y-3"
            >
              {/* Result Header */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-11 rounded-lg overflow-hidden shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 shrink-0 bg-slate-100 dark:bg-slate-800">
                    <img
                      src={item.resource.coverImageUrl || '/covers/cover_om_grd5_tb.svg'}
                      alt={item.resource.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/covers/cover_om_grd5_tb.svg';
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {item.resource.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-extrabold text-[11px] border border-amber-200 dark:border-amber-800">
                    رقم الصفحة: ص {item.printedPageNumber || item.pageNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold">
                    صلة: {Math.min(99, Math.round(item.score))}%
                  </span>
                </div>
              </div>

              {/* Matched Snippet */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80 text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-sans">
                {item.highlightedSnippet}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <div className="text-[11px] text-slate-400">
                  {item.chunk.unitTitle && <span>{item.chunk.unitTitle} • </span>}
                  <span>المؤلف: {item.resource.author}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedResourceIdForPreview(item.resource.id);
                      setActiveView('library');
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold transition text-xs"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>فتح عند هذه الصفحة</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveView('assistant');
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold transition text-xs shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>سؤال المساعد الذكي عنها</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
