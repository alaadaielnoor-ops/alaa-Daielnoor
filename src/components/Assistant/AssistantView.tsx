import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { Conversation, Resource, ChatbotPersona, ChatbotPersonaId } from '../../types/index.ts';
import {
  Bot, Send, Sparkles, BookOpen, User, Copy,
  Check, Trash2, Plus, ExternalLink, ShieldAlert,
  HelpCircle, RefreshCw, MapPin, Compass, Navigation, Globe,
  Search, GraduationCap, Layers, FileCheck, Landmark, Cpu,
  Sliders, MessageSquare
} from 'lucide-react';

const DEFAULT_PERSONAS: ChatbotPersona[] = [
  {
    id: 'curriculum_supervisor',
    name: 'الموجّه التربوي التخصصي',
    roleTitle: 'موجّه أول مناهج الدراسات الاجتماعية بوزارة التربية والتعليم',
    description: 'خبير في الخطط المنهجية، صياغة الأهداف السلوكية (معرفي، وجداني، مهاري)، وتطبيق وثيقة التقويم الرسمية.',
    badge: 'توجيه تربوي معتمد 🇴🇲',
    suggestedPrompts: [
      'كيف أصيغ أهدافاً مهارية ووجدانية لدرس الأفلاج العمانية في الصف التاسع؟',
      'اقترح استراتيجية تدريس بنائية لنظرية زحزحة القارات لطلاب الصف الحادي عشر',
      'كيف أراعي الفروق الفردية في درس المشكلات البيئية المعاصرة؟',
      'ما معايير تقويم المشاريع البحثية لمادة هذا وطني للصف الثاني عشر؟'
    ]
  },
  {
    id: 'gis_geographer',
    name: 'خبير الجغرافيا ونظم GIS',
    roleTitle: 'أخصائي كارتوغرافيا ونظم معلومات جغرافية واستشعار عن بعد',
    description: 'متخصص في قراءة الخرائط الكنتورية والفضائية، الإحداثيات، وتوظيف الخرائط التفاعلية في التعليم.',
    badge: 'خرائط ونظم GIS 🌐',
    suggestedPrompts: [
      'كيف أشرح خطوط الكنتور ومقاطع التضاريس لطلاب الجغرافيا والتقنيات الحديثة؟',
      'تحليل جغرافي لمضيق هرمز وأهميته الملاحية والجيوسياسية بالأرقام',
      'ما الفرق بين إسقاط مركاتور والإسقاط المخروطي المتساوي المساحات؟',
      'كيف نوظف صور الأقمار الصناعية لدراسة التوسع العمراني في محافظة مسقط؟'
    ]
  },
  {
    id: 'activity_designer',
    name: 'مُصمم الأنشطة والتقويم الصفي',
    roleTitle: 'مختص تصميم أدوات التقويم التكويني والختامي وأوراق العمل',
    description: 'يبتكر أوراق عمل تفاعلية، أسئلة امتحانية بمستويات بلوم المعرفية، وسلالم تقدير لفظية (Rubrics).',
    badge: 'أنشطة وتقويم 📝',
    suggestedPrompts: [
      'صمم ورقة عمل تفاعلية لدرس "مناخ سلطنة عمان والعوامل المؤثرة فيه"',
      'أنشئ 5 أسئلة اختيار من متعدد بمستوى تفكير عليا لدرس الموقع وأهميته الجغرافية',
      'ضع جدول مواصفات وسلّم تقدير لفظي (Rubric) لتقييم رسم خريطة عمان الصماء',
      'اقترح نشاطاً استقصائياً جماعياً لدرس التنمية المستدامة واستغلال الموارد'
    ]
  },
  {
    id: 'vision2040_mentor',
    name: 'مستشار رؤية عُمان 2040',
    roleTitle: 'مستشار المواءمة مع الأولويات الوطنية والتنمية المستدامة',
    description: 'يربط موضوعات المنهج بمشاريع المستقبل: الهيدروجين الأخضر، الموانئ الاستراتيجية، والاقتصاد المعرفي.',
    badge: 'رؤية عُمان 2040 🇴🇲',
    suggestedPrompts: [
      'كيف أربط درس "المعادن والصناعات في عمان" بمشاريع رؤية عمان 2040؟',
      'مشروع مقترح للطلاب حول قطاع الهيدروجين الأخضر والطاقة المتجددة في الوسطى وظفار',
      'أهمية ميناء الدقم في منظومة التجارة العالمية وسلاسل الإمداد للاقتصاد الأزرق',
      'كيف نعزز الوعي البيئي بصون المحميات الطبيعية العمانية في مادة هذا وطني؟'
    ]
  }
];

export const AssistantView: React.FC = () => {
  const { currentUser, showToast, setSelectedResourceIdForPreview, setActiveView } = useApp();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('');
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [selectedScopeResourceIds, setSelectedScopeResourceIds] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // Gemini Tools & Configuration State
  const [selectedPersonaId, setSelectedPersonaId] = useState<ChatbotPersonaId>('curriculum_supervisor');
  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-4-argon'>('gemini-3.8-flash');
  const [useSearchGrounding, setUseSearchGrounding] = useState<boolean>(true);
  const [useMapsGrounding, setUseMapsGrounding] = useState<boolean>(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [personas, setPersonas] = useState<ChatbotPersona[]>(DEFAULT_PERSONAS);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  useEffect(() => {
    loadConversationsAndResources();
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
        },
        () => {
          setUserLocation({ latitude: 23.5880, longitude: 58.3829 });
        },
        { timeout: 5000 }
      );
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const loadConversationsAndResources = async () => {
    try {
      const [convRes, recRes, personasRes] = await Promise.all([
        api.getConversations(currentUser.id),
        api.getResources(),
        api.getPersonas().catch(() => ({ success: false, personas: DEFAULT_PERSONAS }))
      ]);

      if (convRes.success && convRes.conversations) {
        setConversations(convRes.conversations);
        if (convRes.conversations.length > 0) {
          setActiveConversationId(convRes.conversations[0].id);
          if (convRes.conversations[0].personaId) {
            setSelectedPersonaId(convRes.conversations[0].personaId);
          }
          if (convRes.conversations[0].model) {
            setSelectedModel(convRes.conversations[0].model);
          }
        } else {
          // Create initial conversation
          handleNewConversation();
        }
      }

      if (recRes.success && recRes.resources) {
        setAllResources(recRes.resources);
      }

      if (personasRes?.success && personasRes.personas && personasRes.personas.length > 0) {
        setPersonas(personasRes.personas);
      }
    } catch (e) {
      console.warn('Error loading assistant data:', e);
    }
  };

  const handleNewConversation = async () => {
    try {
      const res = await api.createConversation('محادثة تربوية جديدة', selectedScopeResourceIds, currentUser.id);
      if (res.success && res.conversation) {
        setConversations(prev => [res.conversation, ...prev]);
        setActiveConversationId(res.conversation.id);
      }
    } catch (err: any) {
      showToast(`فشل إنشاء محادثة: ${err.message}`, 'error');
    }
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteConversation(id);
      const remaining = conversations.filter(c => c.id !== id);
      setConversations(remaining);
      if (activeConversationId === id) {
        setActiveConversationId(remaining.length > 0 ? remaining[0].id : '');
      }
      showToast('تم حذف المحادثة', 'info');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isSending) return;

    if (!activeConversationId) {
      await handleNewConversation();
    }

    const currentConvId = activeConversationId;
    const tempUserMsg = {
      id: `msg-${Date.now()}-u`,
      conversationId: currentConvId,
      role: 'user' as const,
      content: textToSend.trim(),
      createdAt: new Date().toISOString()
    };

    // Optimistically update conversation
    setConversations(prev => prev.map(c => {
      if (c.id === currentConvId) {
        return {
          ...c,
          title: c.messages.length === 0 ? textToSend.slice(0, 36) + '...' : c.title,
          messages: [...c.messages, tempUserMsg]
        };
      }
      return c;
    }));

    setInputMessage('');
    setIsSending(true);

    try {
      const res = await api.sendChatMessage({
        message: textToSend.trim(),
        scopeResourceIds: selectedScopeResourceIds.length > 0 ? selectedScopeResourceIds : undefined,
        conversationId: currentConvId,
        userId: currentUser.id,
        useMapsGrounding,
        useSearchGrounding,
        latLng: userLocation || { latitude: 23.5880, longitude: 58.3829 },
        personaId: selectedPersonaId,
        model: selectedModel
      });

      if (res.success) {
        const assistantMsg = {
          id: `msg-${Date.now()}-a`,
          conversationId: currentConvId,
          role: 'assistant' as const,
          content: res.answer,
          citations: res.citations,
          groundedPlaces: res.places || [],
          isMapsGrounded: !!(res.places && res.places.length > 0),
          groundedWebSources: res.sources || [],
          isSearchGrounded: !!(res.sources && res.sources.length > 0),
          searchQueries: res.searchQueries || [],
          modelUsed: res.modelUsed || selectedModel,
          personaId: res.personaId || selectedPersonaId,
          createdAt: new Date().toISOString()
        };

        setConversations(prev => prev.map(c => {
          if (c.id === currentConvId) {
            return {
              ...c,
              personaId: selectedPersonaId,
              model: selectedModel,
              messages: [...c.messages, assistantMsg]
            };
          }
          return c;
        }));
      }
    } catch (err: any) {
      showToast(`خطأ في الإجابة: ${err.message}`, 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    showToast('تم نسخ الإجابة والمراجع إلى الحافظة', 'success');
    setTimeout(() => setCopiedMsgId(null), 2500);
  };

  const quickPrompts = [
    '📍 أين يقع جبل شمس وما أعلى قمة فيه وكيف نربطه بالمنهاج العماني؟',
    '📍 ما هو الموقع الدقيق لمحمية رأس الجنز للسلاحف ومسارات الوصول إليها؟',
    '📍 استكشف موقع ميناء الدقم اللوجستي والمناطق الاقتصادية المحيطة به على الخريطة.',
    '📍 ما هي مسارات أفلاج نزوى (فلج دارس وفلج الخطمين) وتوزيعها المائي؟',
    'حضر خطة درس جغرافيا نموذجية متكاملة متضمنة الإطار التربوي واستراتيجيات التدريس ومواءمة رؤية عمان 2040.',
    'كيف أوظف النظرية البنائية والاستقصاء الجغرافي الخماسي في تدريس تضاريس سلطنة عمان؟',
    'اقترح أنشطة متمايزة وفق نظرية الذكاءات المتعددة لدرس المناخ والنبات الطبيعي في عمان.',
    'صمم خطة درس حول إدارة مياه الأفلاج العمانية بالاعتماد على النظرية الاجتماعية الثقافية (ZPD) والتعلم التعاوني.'
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-4">
      {/* Right Column: Chat History & Book Scope Selector */}
      <div className="w-full md:w-80 flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs shrink-0">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Bot className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>المحادثات السابقة</span>
          </h3>
          <button
            onClick={handleNewConversation}
            className="p-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 hover:bg-teal-100 transition"
            title="محادثة جديدة"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Scope Books Selector */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-xs space-y-2">
          <label className="block font-bold text-slate-700 dark:text-slate-300 text-[11px]">
            تخصيص الاسترجاع من كتاب محدد:
          </label>
          <select
            value={selectedScopeResourceIds[0] || 'all'}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedScopeResourceIds(val === 'all' ? [] : [val]);
            }}
            className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">كافة كتب ومراجع المكتبة</option>
            {allResources.map(r => (
              <option key={r.id} value={r.id}>{r.title.slice(0, 36)}...</option>
            ))}
          </select>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => setActiveConversationId(conv.id)}
              className={`group flex items-center justify-between p-3 rounded-2xl text-xs cursor-pointer transition ${
                activeConversationId === conv.id
                  ? 'bg-teal-600 text-white font-bold shadow-xs'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="min-w-0 flex items-center gap-2">
                <BookOpen className={`w-3.5 h-3.5 shrink-0 ${activeConversationId === conv.id ? 'text-amber-300' : 'text-slate-400'}`} />
                <span className="truncate">{conv.title}</span>
              </div>
              <button
                onClick={(e) => handleDeleteConversation(conv.id, e)}
                className={`opacity-0 group-hover:opacity-100 p-1 rounded-lg transition ${
                  activeConversationId === conv.id
                    ? 'hover:bg-teal-700 text-teal-100'
                    : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400'
                }`}
                title="حذف المحادثة"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Left Column: Chat Conversation Stream */}
      <div className="flex-1 flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {/* Chat Header */}
        <div className="p-3.5 md:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20 gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-xs">
              <Bot className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                <span>المساعد التربوي والجغرافي الذكي</span>
                <span className="px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[10px] font-bold">
                  RAG مباشر
                </span>
                {useSearchGrounding && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 text-[10px] font-bold flex items-center gap-1 border border-blue-300 dark:border-blue-800">
                    <Globe className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <span>بحث Google 🌐</span>
                  </span>
                )}
                {useMapsGrounding && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1 border border-emerald-300 dark:border-emerald-800">
                    <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>خرائط Google 📍</span>
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-500">
                محادثات تفاعلية متواصلة بأدوار تربوية تخصصية وتوثيق بالكتب وبحث Google وخرائط Google الحية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Model Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <Cpu className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
              <select
                value={selectedModel}
                onChange={(e) => {
                  const m = e.target.value as any;
                  setSelectedModel(m);
                  showToast(`تم اختيار نموذج: ${m}`, 'info');
                }}
                className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                title="اختر نموذج Gemini للمحادثة"
              >
                <option value="gemini-3.8-flash">Gemini 3.8 Flash (شامل ومتوازن)</option>
                <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash-Lite (استجابة فائقة السرعة)</option>
                <option value="gemini-4-argon">Gemini 4 Argon (استدلال واستنتاج عميق)</option>
              </select>
            </div>

            {/* Search Grounding Toggle */}
            <button
              type="button"
              onClick={() => {
                setUseSearchGrounding(prev => !prev);
                showToast(
                  !useSearchGrounding ? 'تم تفعيل ربط بحث Google الحي (Search Grounding) 🌐' : 'تم تعطيل بحث Google',
                  'info'
                );
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                useSearchGrounding
                  ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-400/40 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
              title="تفعيل/تعطيل استرجاع وتوثيق أحدث البيانات عبر محرك بحث Google"
            >
              <Globe className={`w-3.5 h-3.5 ${useSearchGrounding ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
              <span>بحث Google</span>
              <span className={`w-2 h-2 rounded-full ${useSearchGrounding ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'}`} />
            </button>

            {/* Maps Grounding Toggle */}
            <button
              type="button"
              onClick={() => {
                setUseMapsGrounding(prev => !prev);
                showToast(
                  !useMapsGrounding ? 'تم تفعيل ربط خرائط Google (Maps Grounding) 📍' : 'تم تعطيل ربط خرائط Google',
                  'info'
                );
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                useMapsGrounding
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-400/40 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
              title="تفعيل/تعطيل استكشاف الأماكن والمعالم عبر خرائط Google"
            >
              <MapPin className={`w-3.5 h-3.5 ${useMapsGrounding ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
              <span>خرائط Google</span>
              <span className={`w-2 h-2 rounded-full ${useMapsGrounding ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            </button>
          </div>
        </div>

        {/* Personas / Specialized Roles Switcher Bar */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-extrabold text-slate-500 shrink-0 flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>الأدوار التخصصية (Personas):</span>
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {personas.map(p => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPersonaId(p.id);
                  showToast(`تم تفعيل دور: ${p.name}`, 'info');
                }}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  selectedPersonaId === p.id
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {(!activeConversation || activeConversation.messages.length === 0) ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-300 flex items-center justify-center shadow-inner">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="inline-block px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-black">
                  {personas.find(p => p.id === selectedPersonaId)?.badge || 'المساعد التربوي الذكي'}
                </div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white pt-1">
                  {personas.find(p => p.id === selectedPersonaId)?.roleTitle || 'محادثات تعليمية تفاعلية مستمرة'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {personas.find(p => p.id === selectedPersonaId)?.description || 'اطرح سؤالك أو ابدأ جلسة تدريبية تربوية متكاملة.'}
                </p>
              </div>

              {/* Quick Persona Prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full pt-2">
                {(personas.find(p => p.id === selectedPersonaId)?.suggestedPrompts || quickPrompts).map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(p)}
                    className="p-3 text-right rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-teal-500 text-xs text-slate-700 dark:text-slate-300 font-medium transition"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            activeConversation.messages.map((msg) => {
              const isUser = msg.role === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                    isUser
                      ? 'bg-slate-800 text-white'
                      : 'bg-teal-600 text-amber-300 shadow-xs'
                  }`}>
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`max-w-[85%] md:max-w-[78%] space-y-3 ${isUser ? 'text-left' : 'text-right'}`}>
                    <div className={`p-4 rounded-3xl text-xs md:text-sm leading-relaxed whitespace-pre-wrap select-text ${
                      isUser
                        ? 'bg-teal-600 text-white rounded-tr-none shadow-xs font-medium'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60 shadow-xs'
                    }`}>
                      {msg.content}
                    </div>

                    {/* Citations badges for assistant messages */}
                    {!isUser && msg.citations && msg.citations.length > 0 && (
                      <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 space-y-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-amber-900 dark:text-amber-200">
                          <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                          <span>المصادر والصفحات الموثقة المستخدمة في الإجابة:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {msg.citations.map((c, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedResourceIdForPreview(c.resourceId);
                                setActiveView('library');
                              }}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-[11px] font-bold hover:bg-amber-100 dark:hover:bg-amber-900/50 transition shadow-2xs"
                            >
                              <span>{c.resourceTitle}</span>
                              <span className="bg-amber-200 dark:bg-amber-800 text-amber-950 dark:text-amber-100 px-1.5 rounded-md text-[10px]">
                                ص {c.printedPageNumber || c.pageNumber}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Google Search Grounded Web Sources */}
                    {!isUser && msg.groundedWebSources && msg.groundedWebSources.length > 0 && (
                      <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-300/80 dark:border-blue-800/60 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-[11px] font-black text-blue-900 dark:text-blue-200">
                            <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>المصادر والروابط الحية الموثقة ببحث Google (Search Grounding):</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-200 dark:bg-blue-900 text-blue-950 dark:text-blue-200 font-bold">
                            {msg.groundedWebSources.length} مصدر ويب
                          </span>
                        </div>

                        {msg.searchQueries && msg.searchQueries.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-blue-800 dark:text-blue-200">
                            <span className="font-bold">استعلامات البحث:</span>
                            {msg.searchQueries.map((sq, sqIdx) => (
                              <span key={sqIdx} className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 font-medium">
                                &ldquo;{sq}&rdquo;
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {msg.groundedWebSources.map((source, sIdx) => (
                            <a
                              key={sIdx}
                              href={source.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800/80 hover:border-blue-400 dark:hover:border-blue-600 transition shadow-2xs flex items-center justify-between gap-2 text-right group"
                            >
                              <div className="space-y-0.5 min-w-0 flex-1">
                                <h6 className="font-bold text-xs text-blue-900 dark:text-blue-200 truncate group-hover:underline">
                                  {source.title}
                                </h6>
                                <p className="text-[10px] text-slate-400 truncate dir-ltr text-right">
                                  {source.uri.replace(/^https?:\/\/(www\.)?/, '')}
                                </p>
                              </div>
                              <ExternalLink className="w-3.5 h-3.5 text-blue-500 shrink-0 group-hover:translate-x-[-2px] transition-transform" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Google Maps Grounded Places */}
                    {!isUser && msg.groundedPlaces && msg.groundedPlaces.length > 0 && (
                      <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-300/80 dark:border-emerald-800/60 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-900 dark:text-emerald-200">
                            <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>المواقع والمعالم الجغرافية الموثقة بخرائط Google:</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-950 dark:text-emerald-200 font-bold">
                            {msg.groundedPlaces.length} موقع
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {msg.groundedPlaces.map((place, pIdx) => (
                            <div
                              key={pIdx}
                              className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/80 hover:border-emerald-400 dark:hover:border-emerald-600 transition shadow-2xs flex flex-col justify-between gap-2 text-right"
                            >
                              <div className="space-y-1">
                                <div className="flex items-start justify-between gap-1.5">
                                  <h5 className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight">
                                    {place.title}
                                  </h5>
                                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                </div>
                                {place.address && (
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                                    {place.address}
                                  </p>
                                )}
                                {place.reviewSnippets && place.reviewSnippets.length > 0 && (
                                  <p className="text-[10px] text-slate-600 dark:text-slate-300 italic line-clamp-2 bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                                    &ldquo;{place.reviewSnippets[0]}&rdquo;
                                  </p>
                                )}
                              </div>

                              <div className="pt-1 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-[11px]">
                                <a
                                  href={place.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 hover:underline"
                                >
                                  <span>فتح في Google Maps</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                                {place.types && place.types.length > 0 && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
                                    {place.types[0].replace(/_/g, ' ')}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!isUser && (
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-slate-400 text-[11px]">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {msg.personaId && (
                            <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold text-[10px]">
                              {personas.find(p => p.id === msg.personaId)?.badge || msg.personaId}
                            </span>
                          )}
                          {msg.modelUsed && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[9px]">
                              {msg.modelUsed}
                            </span>
                          )}
                          {msg.isSearchGrounded && (
                            <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[9px] font-bold flex items-center gap-1">
                              <Globe className="w-2.5 h-2.5" />
                              <span>بحث Google</span>
                            </span>
                          )}
                          {msg.isMapsGrounded && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] font-bold flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5" />
                              <span>خرائط Google</span>
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="flex items-center gap-1 hover:text-teal-600 transition"
                        >
                          {copiedMsgId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedMsgId === msg.id ? 'تم النسخ' : 'نسخ الإجابة'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          {isSending && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-amber-300 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-3xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
                <span>
                  {useSearchGrounding ? 'المساعد يبحث في Google ويسترجع الوثائق والمصادر...' : 'المساعد يصيغ الإجابة الموثقة...'}
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 md:p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
          {/* Active configuration summary strip */}
          <div className="flex items-center justify-between text-[11px] px-2.5 py-1 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-300 flex-wrap gap-2">
            <div className="flex items-center gap-2 font-bold">
              <span className="flex items-center gap-1 text-teal-700 dark:text-teal-300">
                <GraduationCap className="w-3.5 h-3.5 text-teal-600" />
                <span>الدور: {personas.find(p => p.id === selectedPersonaId)?.name}</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="font-mono text-[10px] text-slate-500">{selectedModel}</span>
            </div>

            <div className="flex items-center gap-2 text-[10px]">
              {useSearchGrounding && (
                <span className="flex items-center gap-1 text-blue-700 dark:text-blue-300 font-bold">
                  <Globe className="w-3 h-3 text-blue-600" />
                  <span>بحث Google حي</span>
                </span>
              )}
              {useMapsGrounding && (
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-bold">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span>عُمان ({userLocation?.latitude.toFixed(2) ?? '23.59'}°, {userLocation?.longitude.toFixed(2) ?? '58.38'}°)</span>
                </span>
              )}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="اكتب سؤالك للمساعد التربوي والمتخصص..."
              disabled={isSending}
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs md:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              disabled={isSending || !inputMessage.trim()}
              className="p-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white transition disabled:opacity-50 shadow-sm"
              title="إرسال"
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

