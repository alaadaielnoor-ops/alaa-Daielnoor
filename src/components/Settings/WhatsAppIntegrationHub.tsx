import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { WhatsAppConfig, WhatsAppAuthorizedNumber, WhatsAppMessageLog } from '../../types/index.ts';
import {
  MessageSquare, Send, Check, CheckCheck, Phone, ShieldCheck, AlertTriangle,
  Copy, CheckCircle2, RefreshCw, Smartphone, Plus, Trash2, Edit3,
  ExternalLink, BookOpen, Calendar, HelpCircle, Eye, Sparkles, X, Power, QrCode,
  Mail, FileText
} from 'lucide-react';

export const WhatsAppIntegrationHub: React.FC = () => {
  const { currentUser, setActiveView } = useApp();

  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [logs, setLogs] = useState<WhatsAppMessageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'simulator' | 'inbound' | 'api' | 'numbers' | 'logs'>('inbound');

  // Pre-Activation Alert Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Add / Edit Authorized Number Modal State
  const [numModalOpen, setNumModalOpen] = useState(false);
  const [editingNumber, setEditingNumber] = useState<WhatsAppAuthorizedNumber | null>(null);
  const [numForm, setNumForm] = useState({
    name: '',
    phone: '',
    role: 'teacher' as 'admin' | 'teacher' | 'viewer',
    notes: ''
  });

  // Simulator Chat State
  const [simMessages, setSimMessages] = useState<Array<{
    id: string;
    sender: 'user' | 'bot';
    text: string;
    time: string;
    lessonId?: string;
    letterId?: string;
  }>>([
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: 'مرحباً بك في المساعد الذكي للمكتبة الجغرافية والتربوية 🇴🇲\nيمكنك إرسال رسائل مثل:\n• "أريد تحضير درس بعنوان الأفلاج في سلطنة عمان"\n• "خطاب لولي أمر طالب متفوق"\n• "أرسل لي جدول الحصص اليوم"\n• "ابحث عن كتاب الجغرافيا الاقتصادية"\n• "مساعدة"',
      time: '08:00 ص'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [alertNotice, setAlertNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Storage Keys for 100% permanent persistence
  const STORAGE_KEY_TOKEN = 'om_edu_wa_access_token';
  const STORAGE_KEY_PHONE_ID = 'om_edu_wa_phone_id';
  const STORAGE_KEY_WABA_ID = 'om_edu_wa_waba_id';
  const STORAGE_KEY_BOT_PHONE = 'om_edu_wa_bot_phone';
  const STORAGE_KEY_RECIPIENT = 'om_edu_wa_recipient_phone';

  // Live Test Outbound Message State
  const [liveTestPhone, setLiveTestPhone] = useState('+96877394680');
  const [liveTestText, setLiveTestText] = useState('👋 تحية طيبة من المساعد الذكي للمكتبة الجغرافية والتربوية 🇴🇲! تم تأكيد ربط الرقم بنجاح.');
  const [liveTesting, setLiveTesting] = useState(false);
  const [liveTestStatus, setLiveTestStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Quick Mobile Dispatcher State (Direct lesson prep, timetable, and official letters to WhatsApp)
  const [dispatcherType, setDispatcherType] = useState<'lesson' | 'timetable' | 'letter'>('lesson');
  const [selectedPresetTopic, setSelectedPresetTopic] = useState('تحضير درس الأفلاج في سلطنة عمان');
  const [customDispatchTopic, setCustomDispatchTopic] = useState('');
  const [dispatchGrade, setDispatchGrade] = useState('الصف التاسع الأساسي');
  const [dispatchingLesson, setDispatchingLesson] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<{ success: boolean; message: string } | null>(null);
  
  // Timetable Dispatcher State
  const [dispatchTimetableFilter, setDispatchTimetableFilter] = useState<'today' | 'all'>('today');
  const [dispatchingTimetable, setDispatchingTimetable] = useState(false);
  const [timetableDispatchStatus, setTimetableDispatchStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Letter Dispatcher State
  const [selectedLetterPreset, setSelectedLetterPreset] = useState('شكر وتقدير لتفوق وتميز الطالب الأكاديمي');
  const [customLetterTopic, setCustomLetterTopic] = useState('');
  const [letterRecipientRole, setLetterRecipientRole] = useState<'parent' | 'school_admin' | 'directorate'>('parent');
  const [dispatchingLetter, setDispatchingLetter] = useState(false);
  const [letterDispatchStatus, setLetterDispatchStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Live Cloudflare public webhook URL for Meta verification
  const [publicWebhookUrl, setPublicWebhookUrl] = useState<string>('https://docs-politicians-hose-villa.trycloudflare.com/api/whatsapp/webhook');

  // Webhook Ping Test State
  const [webhookTesting, setWebhookTesting] = useState(false);
  const [webhookTestResult, setWebhookTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Direct Inbound Request State (Sending TO the smart library via WhatsApp)
  const [inboundRequestText, setInboundRequestText] = useState('تحضير درس الأفلاج في سلطنة عمان');
  const [sendingInboundRequest, setSendingInboundRequest] = useState(false);
  const [inboundRequestResult, setInboundRequestResult] = useState<{
    success: boolean;
    replyText?: string;
    lessonId?: string;
    letterId?: string;
    metaDispatched?: boolean;
    metaError?: string;
    message?: string;
  } | null>(null);

  const [showPermanentTokenGuide, setShowPermanentTokenGuide] = useState(false);

  const handleSendLiveTest = async () => {
    if (!liveTestPhone.trim() || liveTesting) return;
    try {
      setLiveTesting(true);
      setLiveTestStatus(null);
      localStorage.setItem(STORAGE_KEY_RECIPIENT, liveTestPhone.trim());
      const res = await api.sendLiveWhatsAppTest({
        toPhone: liveTestPhone.trim(),
        messageText: liveTestText.trim(),
        phoneNumberId: config?.phoneNumberId,
        accessToken: config?.apiKey
      });
      if (res.success) {
        setLiveTestStatus({ success: true, message: '🎉 ' + res.message });
      } else {
        const errorText = res.error || '';
        let customMessage = '⚠️ ' + errorText;
        if (errorText.includes('131030') || errorText.toLowerCase().includes('not in allowed list')) {
          customMessage = '⚠️ خطأ (#131030): ميتا تتطلب إضافة رقمك في لوحة تحكم ميتا (وليس فقط في البرنامج) عند استخدام رقم التجربة. في صفحة ميتا اختر (Manage phone number list) تحت حقل Recipient وأدخل رقمك، أو استخدم معرف رقمك الفعلي من Step 2.';
        }
        setLiveTestStatus({ success: false, message: customMessage });
      }
    } catch (err: any) {
      setLiveTestStatus({ success: false, message: '⚠️ ' + (err.message || 'فشل الاتصال بخدمة ميتا') });
    } finally {
      setLiveTesting(false);
    }
  };

  const handleSendLiveLesson = async () => {
    if (!liveTestPhone.trim() || liveTesting) return;
    try {
      setLiveTesting(true);
      setLiveTestStatus(null);
      localStorage.setItem(STORAGE_KEY_RECIPIENT, liveTestPhone.trim());
      const res = await api.sendLiveWhatsAppTest({
        toPhone: liveTestPhone.trim(),
        messageText: liveTestText.trim() || 'تحضير درس المقومات الجغرافية والحضارية لسلطنة عمان',
        phoneNumberId: config?.phoneNumberId,
        accessToken: config?.apiKey,
        sendLesson: true
      });
      if (res.success) {
        setLiveTestStatus({ success: true, message: '🎉 ' + res.message });
      } else {
        setLiveTestStatus({ success: false, message: '⚠️ ' + (res.error || 'فشل إرسال الخطة') });
      }
    } catch (err: any) {
      setLiveTestStatus({ success: false, message: '⚠️ ' + (err.message || 'فشل الاتصال بخدمة ميتا') });
    } finally {
      setLiveTesting(false);
    }
  };

  const handleQuickDispatchToWhatsApp = async () => {
    const topic = customDispatchTopic.trim() || selectedPresetTopic;
    if (!topic || dispatchingLesson) return;
    try {
      setDispatchingLesson(true);
      setDispatchStatus(null);
      const targetPhone = liveTestPhone.trim() || '+96877394680';
      localStorage.setItem(STORAGE_KEY_RECIPIENT, targetPhone);

      const res = await api.dispatchLessonToWhatsApp({
        toPhone: targetPhone,
        lessonTitle: topic,
        grade: dispatchGrade,
        subject: 'الدراسات الاجتماعية'
      });

      if (res.success) {
        setDispatchStatus({ success: true, message: `🎉 ${res.message}` });
        // Refresh logs
        const logRes = await api.getWhatsAppLogs();
        if (logRes.success) setLogs(logRes.logs);
      } else {
        setDispatchStatus({ success: false, message: `⚠️ ${res.error || 'فشل إرسال التحضير إلى الهاتف'}` });
      }
    } catch (err: any) {
      setDispatchStatus({ success: false, message: `⚠️ ${err.message || 'فشل الاتصال بخدمة ميتا'}` });
    } finally {
      setDispatchingLesson(false);
    }
  };

  const handleOpenDirectLessonInWhatsApp = () => {
    const topic = customDispatchTopic.trim() || selectedPresetTopic;
    const targetPhone = (liveTestPhone || '').replace(/\D/g, '');
    const text = `أريد تحضير درس بعنوان ${topic} لـ ${dispatchGrade}`;
    const url = targetPhone
      ? `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleQuickDispatchTimetable = async () => {
    if (dispatchingTimetable) return;
    try {
      setDispatchingTimetable(true);
      setTimetableDispatchStatus(null);
      const targetPhone = liveTestPhone.trim() || '+96877394680';
      localStorage.setItem(STORAGE_KEY_RECIPIENT, targetPhone);

      const res = await api.dispatchTimetableToWhatsApp({
        toPhone: targetPhone,
        dayFilter: dispatchTimetableFilter
      });

      if (res.success) {
        setTimetableDispatchStatus({ success: true, message: `🎉 ${res.message}` });
        const logRes = await api.getWhatsAppLogs();
        if (logRes.success) setLogs(logRes.logs);
      } else {
        setTimetableDispatchStatus({ success: false, message: `⚠️ ${res.error || 'فشل إرسال جدول الحصص'}` });
      }
    } catch (err: any) {
      setTimetableDispatchStatus({ success: false, message: `⚠️ ${err.message || 'فشل الاتصال بخدمة ميتا'}` });
    } finally {
      setDispatchingTimetable(false);
    }
  };

  const handleOpenDirectTimetableInWhatsApp = () => {
    const targetPhone = (liveTestPhone || '').replace(/\D/g, '');
    const text = dispatchTimetableFilter === 'today' ? 'أرسل لي جدول الحصص اليوم' : 'أرسل لي جدول الحصص الأسبوعي كاملاً';
    const url = targetPhone
      ? `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleQuickDispatchLetter = async () => {
    if (dispatchingLetter) return;
    const subject = customLetterTopic.trim() || selectedLetterPreset;
    try {
      setDispatchingLetter(true);
      setLetterDispatchStatus(null);
      const targetPhone = liveTestPhone.trim() || '+96877394680';
      localStorage.setItem(STORAGE_KEY_RECIPIENT, targetPhone);

      const res = await api.dispatchLetterToWhatsApp({
        toPhone: targetPhone,
        letterData: {
          recipientName: letterRecipientRole === 'parent' ? 'ولي أمر الطالب المحترم' : (letterRecipientRole === 'school_admin' ? 'مدير المدرسة المحترم' : 'مدير عام المديرية التعليمية المحترم'),
          recipientTitle: 'حفظه الله ورعاه',
          subject,
          title: subject,
          bodyParagraphs: [
            'يطيب لنا أن نهديكم خالص التحيات والتقدير لجهودكم المخلصة في دعم مسيرة أبنائنا الطلبة بمدارس سلطنة عمان.',
            `بالإشارة إلى موضوع (${subject})، نود إحاطتكم بالإجراءات والترتيبات المتخذة لدعم العملية التعليمية وتحقيق أعلى مستويات التحصيل الأكاديمي.`,
            'شاكرين ومقدرين لكم كريم تعاونكم ومتابعتكم المستمرة لما فيه خدمة العملية التربوية والوطنية.'
          ],
          actionRequired: 'التكرم بالاطلاع واتخاذ اللازم مع إدارة المدرسة.'
        }
      });

      if (res.success) {
        setLetterDispatchStatus({ success: true, message: `🎉 ${res.message}` });
        const logRes = await api.getWhatsAppLogs();
        if (logRes.success) setLogs(logRes.logs);
      } else {
        setLetterDispatchStatus({ success: false, message: `⚠️ ${res.error || 'فشل إرسال الخطاب'}` });
      }
    } catch (err: any) {
      setLetterDispatchStatus({ success: false, message: `⚠️ ${err.message || 'فشل الاتصال بخدمة ميتا'}` });
    } finally {
      setDispatchingLetter(false);
    }
  };

  const handleOpenDirectLetterInWhatsApp = () => {
    const subject = customLetterTopic.trim() || selectedLetterPreset;
    const targetPhone = (liveTestPhone || '').replace(/\D/g, '');
    const text = `صياغة خطاب رسمي: ${subject}`;
    const url = targetPhone
      ? `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleTestWebhookPing = async () => {
    try {
      setWebhookTesting(true);
      setWebhookTestResult(null);
      const res = await api.testWebhookPing();
      if (res.success) {
        setWebhookTestResult({
          success: true,
          message: '🟢 نقطة النهاية (Webhook) تعمل وتستجيب لمعايير Meta Cloud API بنجاح تام! جاهزة للربط فوراً.'
        });
      } else {
        setWebhookTestResult({
          success: false,
          message: '⚠️ فشل اختبار استجابة الويب هوك: ' + (res.error || 'خطأ غير معروف')
        });
      }
    } catch (err: any) {
      setWebhookTestResult({
        success: false,
        message: '⚠️ تعذر فحص الويب هوك: ' + (err.message || 'خطأ في الاتصال')
      });
    } finally {
      setWebhookTesting(false);
    }
  };

  const handleSendDirectInboundRequest = async (customMsg?: string) => {
    const textToSubmit = customMsg || inboundRequestText;
    if (!textToSubmit.trim() || sendingInboundRequest) return;
    try {
      setSendingInboundRequest(true);
      setInboundRequestResult(null);
      const targetPhone = liveTestPhone.trim() || '+96877394680';
      localStorage.setItem(STORAGE_KEY_RECIPIENT, targetPhone);

      const res = await api.sendDirectInboundWhatsAppMessage({
        fromPhone: targetPhone,
        message: textToSubmit.trim(),
        senderName: currentUser.name || 'الأستاذ المعلم'
      });

      if (res.success && res.result) {
        setInboundRequestResult({
          success: true,
          replyText: res.result.replyText,
          lessonId: res.result.generatedLessonId,
          letterId: res.result.letterId,
          metaDispatched: res.metaDispatched,
          metaError: res.metaError,
          message: res.message
        });

        // Refresh logs
        const logRes = await api.getWhatsAppLogs();
        if (logRes.success) setLogs(logRes.logs);
      } else {
        setInboundRequestResult({
          success: false,
          message: '⚠️ ' + (res.error || 'فشلت معالجة الطلب في المكتبة')
        });
      }
    } catch (err: any) {
      setInboundRequestResult({
        success: false,
        message: '⚠️ خطأ في الاتصال: ' + (err.message || 'حدث خطأ غير متوقع')
      });
    } finally {
      setSendingInboundRequest(false);
    }
  };

  const handleOpenWhatsAppToBotDirectly = (customMsg?: string) => {
    const botPhone = (config?.phoneNumber || '+96872645072').replace(/\D/g, '');
    const text = customMsg || inboundRequestText || 'تحضير درس الأفلاج في سلطنة عمان';
    const url = `https://api.whatsapp.com/send?phone=${botPhone}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cfgRes, logRes, pubRes] = await Promise.all([
        api.getWhatsAppConfig(),
        api.getWhatsAppLogs(),
        fetch('/api/whatsapp/public-webhook').then(r => r.json()).catch(() => ({ success: false }))
      ]);

      if (pubRes?.success && pubRes?.webhookUrl) {
        setPublicWebhookUrl(pubRes.webhookUrl);
      }

      const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
      const storedPhoneId = localStorage.getItem(STORAGE_KEY_PHONE_ID);
      const storedWabaId = localStorage.getItem(STORAGE_KEY_WABA_ID);
      const storedBotPhone = localStorage.getItem(STORAGE_KEY_BOT_PHONE);
      const storedRecipient = localStorage.getItem(STORAGE_KEY_RECIPIENT);

      if (storedRecipient) {
        setLiveTestPhone(storedRecipient);
      } else {
        setLiveTestPhone('+96877394680');
      }

      if (cfgRes.success && cfgRes.config) {
        const loaded = { ...cfgRes.config };
        let needsServerSync = false;
        const updates: Partial<WhatsAppConfig> = {};

        // Merge from localStorage if missing on server
        if (!loaded.apiKey && storedToken) {
          loaded.apiKey = storedToken;
          updates.apiKey = storedToken;
          needsServerSync = true;
        } else if (loaded.apiKey) {
          localStorage.setItem(STORAGE_KEY_TOKEN, loaded.apiKey);
        }

        if ((!loaded.phoneNumberId || loaded.phoneNumberId === '1362186010314869') && storedPhoneId) {
          loaded.phoneNumberId = storedPhoneId;
          updates.phoneNumberId = storedPhoneId;
          needsServerSync = true;
        } else if (loaded.phoneNumberId) {
          localStorage.setItem(STORAGE_KEY_PHONE_ID, loaded.phoneNumberId);
        }

        if (!loaded.wabaId && storedWabaId) {
          loaded.wabaId = storedWabaId;
          updates.wabaId = storedWabaId;
          needsServerSync = true;
        } else if (loaded.wabaId) {
          localStorage.setItem(STORAGE_KEY_WABA_ID, loaded.wabaId);
        }

        if (storedBotPhone && loaded.phoneNumber !== storedBotPhone) {
          loaded.phoneNumber = storedBotPhone;
          updates.phoneNumber = storedBotPhone;
          needsServerSync = true;
        } else if (loaded.phoneNumber) {
          localStorage.setItem(STORAGE_KEY_BOT_PHONE, loaded.phoneNumber);
        }

        if (needsServerSync) {
          api.updateWhatsAppConfig(updates);
        }

        setConfig(loaded);
      }
      if (logRes.success) setLogs(logRes.logs);
    } catch (err: any) {
      console.error('Failed to load WhatsApp data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnable = () => {
    if (!config) return;

    if (!config.enabled) {
      setTermsAgreed(config.termsAccepted || false);
      setShowConfirmModal(true);
    } else {
      saveConfigUpdates({ enabled: false });
    }
  };

  const confirmActivation = async () => {
    if (!termsAgreed) return;
    setShowConfirmModal(false);
    await saveConfigUpdates({
      enabled: true,
      termsAccepted: true,
      termsAcceptedAt: new Date().toISOString()
    });
  };

  const saveConfigUpdates = async (updates: Partial<WhatsAppConfig>) => {
    if (!config) return;
    try {
      setSaving(true);
      // Persist to localStorage immediately
      if (updates.apiKey) localStorage.setItem(STORAGE_KEY_TOKEN, updates.apiKey);
      if (updates.phoneNumberId) localStorage.setItem(STORAGE_KEY_PHONE_ID, updates.phoneNumberId);
      if (updates.wabaId) localStorage.setItem(STORAGE_KEY_WABA_ID, updates.wabaId);
      if (updates.phoneNumber) localStorage.setItem(STORAGE_KEY_BOT_PHONE, updates.phoneNumber);
      if (liveTestPhone) localStorage.setItem(STORAGE_KEY_RECIPIENT, liveTestPhone);

      const res = await api.updateWhatsAppConfig({ ...updates, enabled: true }, currentUser.id);
      if (res.success) {
        setConfig(res.config);
        setAlertNotice({ 
          type: 'success', 
          message: '🔒 تم الحفظ التلقائي الدائم في قاعدة البيانات المحلية والسحابية بنجاح! لن تحتاج لإعادة إدخالها مجدداً.' 
        });
        setTimeout(() => setAlertNotice(null), 4500);
      }
    } catch (err: any) {
      setAlertNotice({ type: 'error', message: err.message || 'حدث خطأ أثناء الحفظ' });
      setTimeout(() => setAlertNotice(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Send message in simulator
  const handleSendSimulatorMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isTyping) return;

    const userMsgId = `usr-${Date.now()}`;
    const currentTime = new Date().toLocaleTimeString('ar-OM', { hour: '2-digit', minute: '2-digit' });

    setSimMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text: textToSend.trim(),
        time: currentTime
      }
    ]);
    if (!customText) setInputMessage('');
    setIsTyping(true);

    try {
      const res = await api.simulateWhatsAppMessage({
        message: textToSend.trim(),
        fromPhone: config?.phoneNumber || '+96891234567',
        senderName: currentUser.name
      });

      if (res.success && res.result) {
        setSimMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: res.result.replyText,
            time: new Date().toLocaleTimeString('ar-OM', { hour: '2-digit', minute: '2-digit' }),
            lessonId: res.result.generatedLessonId,
            letterId: (res.result as any).letterId
          }
        ]);
        // Refresh logs
        const logRes = await api.getWhatsAppLogs();
        if (logRes.success) setLogs(logRes.logs);
      }
    } catch (err: any) {
      setSimMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: '⚠️ تعذر معالجة الطلب في المحاكي: ' + (err.message || 'خطأ غير متوقع'),
          time: new Date().toLocaleTimeString('ar-OM', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Authorized Numbers Handlers
  const handleSaveNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config || !numForm.phone.trim() || !numForm.name.trim()) return;

    let updatedList = [...config.authorizedNumbers];
    if (editingNumber) {
      updatedList = updatedList.map(n => n.id === editingNumber.id ? {
        ...n,
        name: numForm.name.trim(),
        phone: numForm.phone.trim(),
        role: numForm.role,
        notes: numForm.notes.trim()
      } : n);
    } else {
      updatedList.push({
        id: `auth-${Date.now()}`,
        name: numForm.name.trim(),
        phone: numForm.phone.trim(),
        role: numForm.role,
        active: true,
        notes: numForm.notes.trim()
      });
    }

    await saveConfigUpdates({ authorizedNumbers: updatedList });
    setNumModalOpen(false);
    setEditingNumber(null);
    setNumForm({ name: '', phone: '', role: 'teacher', notes: '' });
  };

  const handleDeleteNumber = async (id: string) => {
    if (!config) return;
    const updatedList = config.authorizedNumbers.filter(n => n.id !== id);
    await saveConfigUpdates({ authorizedNumbers: updatedList });
  };

  const handleToggleNumberStatus = async (id: string) => {
    if (!config) return;
    const updatedList = config.authorizedNumbers.map(n => n.id === id ? { ...n, active: !n.active } : n);
    await saveConfigUpdates({ authorizedNumbers: updatedList });
  };

  const handleClearLogs = async () => {
    try {
      await api.clearWhatsAppLogs();
      setLogs([]);
      setAlertNotice({ type: 'success', message: 'تم إفراغ سجل الرسائل بنجاح' });
      setTimeout(() => setAlertNotice(null), 3000);
    } catch (err: any) {
      setAlertNotice({ type: 'error', message: 'فشل إفراغ السجل' });
    }
  };

  if (loading || !config) {
    return (
      <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
        <span className="text-sm font-bold">جاري تحميل إعدادات تكامل الواتساب...</span>
      </div>
    );
  }

  const webhookFullUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/whatsapp/webhook`
    : '/api/whatsapp/webhook';

  const effectivePublicWebhookUrl = publicWebhookUrl || webhookFullUrl;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {alertNotice && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-lg transition-all animate-in fade-in slide-in-from-top-2 ${
            alertNotice.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            {alertNotice.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <span>{alertNotice.message}</span>
          </div>
          <button onClick={() => setAlertNotice(null)} className="p-1 hover:bg-white/20 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Feature Banner & Activation Toggle */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 text-white border border-teal-700/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-extrabold border border-emerald-500/30 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${config.enabled ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
                {config.enabled ? 'خدمة الواتساب نشطة ومفعلة' : 'الخدمة في وضع الاستعداد والمحاكاة'}
              </span>
              <span className="text-xs text-slate-300">WhatsApp Assistant & Webhook</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2.5">
              <MessageSquare className="w-6 h-6 text-emerald-400" />
              <span>ربط المكتبة بالمساعد الذكي عبر الواتساب (WhatsApp)</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              أرسل رسالة من هاتفك في الواتساب: <strong>«أريد تحضير درس بعنوان كذا»</strong> أو <strong>«أرسل لي جدول الحصص»</strong> ليقوم النظام بتجهيز الخطة والمصادر وجدولك تلقائياً والرد عليك فوراً!
            </p>
          </div>

          {/* Big Action Toggle */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleToggleEnable}
              disabled={saving}
              className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-extrabold text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg transition transform active:scale-95 ${
                config.enabled
                  ? 'bg-rose-600 hover:bg-rose-700 text-white border border-rose-500 shadow-rose-900/30'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border border-emerald-400 shadow-emerald-950/40'
              }`}
            >
              <Power className="w-5 h-5" />
              <span>{config.enabled ? 'تعطيل الربط' : 'تفعيل ربط الواتساب الآن'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('inbound')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'inbound'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-300" />
          <span>إرسال للمكتبة الذكية عبر الواتساب (طلب درس ومصادر)</span>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-[10px] text-emerald-200 font-black">نشط ومباشر</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'simulator'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>محاكي الواتساب التفاعلي (تجربة حية)</span>
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'api'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>إعدادات الـ API والـ Webhook</span>
        </button>

        <button
          onClick={() => setActiveTab('numbers')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'numbers'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>الأرقام المصرح لها ({config.authorizedNumbers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'logs'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>سجل الرسائل المستلمة ({logs.length})</span>
        </button>
      </div>

      {/* TAB: Direct Inbound to Smart Library via WhatsApp */}
      {activeTab === 'inbound' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="p-6 rounded-3xl bg-linear-to-r from-emerald-950 via-teal-900 to-slate-900 border border-emerald-700/40 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-black border border-emerald-500/30 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>الإرسال المباشر للمكتبة الذكية عبر الواتساب</span>
                </span>
                <span className="text-[11px] text-slate-300">نظام سلطنة عمان التربوي</span>
              </div>
              <h3 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <span>إرسال طلبك للمكتبة الذكية وتوليد الدروس والخطابات فوراً</span>
              </h3>
              <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
                اكتب أي طلب تريده (تحضير درس، إنشاء نشاط، تلخيص وحدة، صياغة خطاب رسمي) برقم هاتفك. سيقوم المساعد الذكي بمعالجة طلبك فوراً، وحفظ الدرس كاملاً في «استوديو التحضير» والمكتبة، وتجهيز الرد لإرساله إلى رقم واتساب الخاص بك!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left/Main Column: Inbound Composer */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Send className="w-4 h-4 text-emerald-600" />
                    <span>صندوق إرسال الطلب للمكتبة الذكية</span>
                  </h4>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    اتصال مباشر بالسيرفر والمكتبة
                  </span>
                </div>

                {/* Sender Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>رقم هاتفك (المرسل عبر الواتساب):</span>
                    <span className="text-[10px] text-slate-400 font-normal">مع مفتاح الدولة (مثال: +968...)</span>
                  </label>
                  <input
                    type="text"
                    value={liveTestPhone}
                    onChange={(e) => setLiveTestPhone(e.target.value)}
                    placeholder="+96877394680"
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                {/* Request Text */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    نص الطلب أو موضوع الدرس المطلوب تحضيره:
                  </label>
                  <textarea
                    rows={3}
                    value={inboundRequestText}
                    onChange={(e) => setInboundRequestText(e.target.value)}
                    placeholder="مثال: تحضير درس الأفلاج في سلطنة عمان لمادة الدراسات الاجتماعية للصف التاسع مع الأهداف والأنشطة والتقويم..."
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:outline-hidden resize-none leading-relaxed"
                  />
                </div>

                {/* Quick Preset Buttons */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">⚡ نماذج جاهزة وسريعة للإرسال للمكتبة:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { title: 'تحضير درس: الأفلاج في سلطنة عمان', prompt: 'تحضير درس الأفلاج في سلطنة عمان مع استراتيجيات التدريس والتقويم' },
                      { title: 'تحضير درس: موقع عمان الجغرافي', prompt: 'تحضير درس موقع سلطنة عمان الجغرافي وأهميته الاستراتيجية والحضارية' },
                      { title: 'إنشاء اختبار قصير في الدراسات', prompt: 'إنشاء اختبار قصير من 5 أسئلة موضوعية ومقالية مع نموذج الإجابة' },
                      { title: 'صياغة خطاب شكر وتقدير لولي أمر', prompt: 'صياغة خطاب رسمي موجه لولي أمر طالب متميز أكاديمياً وسلوكياً' }
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setInboundRequestText(item.prompt);
                          handleSendDirectInboundRequest(item.prompt);
                        }}
                        disabled={sendingInboundRequest}
                        className="text-right p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 text-[11px] font-semibold text-slate-800 dark:text-slate-200 transition flex items-center justify-between"
                      >
                        <span className="truncate">{item.title}</span>
                        <Send className="w-3 h-3 text-emerald-600 shrink-0 mr-1.5" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => handleSendDirectInboundRequest()}
                    disabled={sendingInboundRequest || !inboundRequestText.trim()}
                    className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 disabled:opacity-50 transition"
                  >
                    {sendingInboundRequest ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>جاري المعالجة والتوليد في المكتبة الذكية...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>إرسال الطلب للمكتبة الذكية وتوليد المحتوى فوراً 🚀</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleOpenWhatsAppToBotDirectly()}
                    className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-teal-700 hover:bg-teal-800 active:scale-98 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition"
                    title="فتح تطبيق الواتساب بهاتفك لإرسال الرسالة للبوت"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>فتح محادثة الواتساب في هاتفك</span>
                  </button>
                </div>

                {/* Result Card when processed */}
                {inboundRequestResult && (
                  <div className={`p-4 rounded-2xl border transition-all animate-in fade-in space-y-3 ${
                    inboundRequestResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {inboundRequestResult.success ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-rose-600" />
                        )}
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                          {inboundRequestResult.message || (inboundRequestResult.success ? 'تمت معالجة الطلب بنجاح' : 'تعذر تنفيذ الطلب')}
                        </span>
                      </div>
                    </div>

                    {/* Quick Navigation Buttons to Created Lesson or Letter */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {inboundRequestResult.lessonId && (
                        <button
                          onClick={() => setActiveView('lesson_studio')}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>فتح الدرس في استوديو التحضير</span>
                        </button>
                      )}
                      {inboundRequestResult.letterId && (
                        <button
                          onClick={() => setActiveView('letters')}
                          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>فتح الخطاب في المراسلات الرسمية</span>
                        </button>
                      )}
                    </div>

                    {/* WhatsApp Outbound Delivery Diagnostics */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] space-y-1">
                      {inboundRequestResult.metaDispatched ? (
                        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
                          <CheckCheck className="w-4 h-4 text-emerald-600" />
                          <span>تم إرسال نسخة الرد أيضاً إلى هاتفك في الواتساب بنجاح عبر Meta Cloud API!</span>
                        </div>
                      ) : (
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-amber-300 dark:border-amber-700/60 text-slate-700 dark:text-slate-300 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold">
                            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>ملاحظة بخصوص ظهور الرد على هاتفك في تطبيق الواتساب:</span>
                          </div>
                          <p className="leading-relaxed text-[11px]">
                            {inboundRequestResult.metaError?.includes('131030') || inboundRequestResult.metaError?.toLowerCase().includes('not in allowed list')
                              ? 'لقد تم حفظ الدرس في المكتبة واستوديو التحضير 100%! سبب عدم وصول الرسالة لهاتفك هو أن ميتا (Meta Sandbox) تشترط إضافة رقمك إلى قائمة أرقام التجربة (Manage phone number list) في لوحة Meta Developers. راجع قسم الإرشادات جهة اليسار.'
                              : (inboundRequestResult.metaError ? `تم حفظ الدرس في المكتبة! تقرير إرسال ميتا: ${inboundRequestResult.metaError}` : 'تم حفظ الدرس في المكتبة الذكية، وجاهز للاستخدام الفوري!')}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Speech Bubble Preview of Bot Reply */}
                    {inboundRequestResult.replyText && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-bold text-slate-500">نص الرد المولد من المساعد الذكي:</span>
                        <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                          {inboundRequestResult.replyText}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Troubleshooting Guide & Why no reply */}
            <div className="lg:col-span-5 space-y-4">
              {/* Important Alert Box */}
              <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 space-y-3">
                <h4 className="text-xs font-black text-amber-900 dark:text-amber-200 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>حل مشكلة «لم أستلم أي شيء وقت طلبت عن طريق الواتساب»</span>
                </h4>
                <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 space-y-1">
                    <span className="font-extrabold text-amber-800 dark:text-amber-300 text-[11px] block">
                      1. شرط ميتا التجريبي الصارم (Sandbox Whitelist):
                    </span>
                    <p className="text-[11px]">
                      في حسابات مطوري ميتا المجانية، <strong>ترفض ميتا إرسال أي رد إلى رقم هاتفك</strong> إلا إذا قمت بإضافة رقمك في لوحة تحكم ميتا:
                      اذهب إلى <strong>WhatsApp -&gt; API Setup</strong>، وتحت خيار <strong>(To)</strong> اضغط <strong>Manage phone number list</strong>، وأدخل رقمك (+968...) وأكده برمز التحقق SMS.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 dark:border-teal-700/50 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-teal-800 dark:text-teal-300 text-xs flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                        <span>2. كيف تفتح صفحة Webhooks وتفعّل خانة (messages)؟</span>
                      </span>
                      <a
                        href="https://developers.facebook.com/apps/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold transition flex items-center gap-1 shrink-0"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>فتح صفحة ميتا الآن</span>
                      </a>
                    </div>

                    <div className="text-[11px] text-slate-700 dark:text-slate-300 space-y-2 leading-relaxed">
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        لفتح الصفحة والوصول لزر Manage وتفعيل messages، اتبع إحدى الطريقتين:
                      </p>

                      {/* Path 1 */}
                      <div className="p-2.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 space-y-1">
                        <span className="font-extrabold text-teal-900 dark:text-teal-200 block text-[11px]">
                          ⭐ الطريقة الأولى المباشرة (عبر WhatsApp Configuration):
                        </span>
                        <ol className="list-decimal list-inside space-y-1 text-[11px] pr-1">
                          <li>افتح <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer" className="text-teal-600 dark:text-teal-400 font-bold underline">developers.facebook.com/apps</a> واضغط على <strong>اسم تطبيقك</strong>.</li>
                          <li>من القائمة الجانبية اليسرى، انزل إلى قسم <strong>WhatsApp</strong> ثم اضغط على <strong>Configuration (التكوين)</strong>.</li>
                          <li>في قسم <strong>Webhook</strong>، ستجد جدول حقول الويب هوك وزر <strong>Manage (إدارة)</strong> أو <strong>Edit (تعديل)</strong>.</li>
                          <li>اضغط على زر <strong>Manage</strong> ⬅️ ستفتح نافذة منبثقة بها قائمة الحقول.</li>
                          <li>ابحث عن حقل <strong>messages</strong> واضغط زر <strong>Subscribe (اشتراك)</strong> أمامه حتى يتحول للأخضر.</li>
                          <li>اضغط <strong>Save (حفظ)</strong> أو <strong>Done (تم)</strong>.</li>
                        </ol>
                      </div>

                      {/* Path 2 */}
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 block text-[11px]">
                          🔹 الطريقة الثانية (عبر قسم Webhooks العام):
                        </span>
                        <ol className="list-decimal list-inside space-y-1 text-[11px] pr-1">
                          <li>من القائمة الجانبية لتطبيقك في ميتا، اضغط على <strong>Webhooks</strong>.</li>
                          <li>في أعلى الصفحة بالقائمة المنسدلة (Select an object)، اختر <strong>WhatsApp Business Account</strong>.</li>
                          <li>ستظهر لك قائمة الأحداث، ابحث عن <strong>messages</strong> واضغط <strong>Subscribe</strong>.</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 space-y-1">
                    <span className="font-extrabold text-emerald-800 dark:text-emerald-300 text-[11px] block">
                      3. المكتبة استلمت وحفظت الدرس بالفعل!
                    </span>
                    <p className="text-[11px]">
                      حتى في حال لم يظهر الرد في تطبيق واتساب بسبب قيود ميتا، <strong>فإن النظام استلم طلبك وولد الدرس وحفظه في استوديو التحضير</strong>. يمكنك الضغط على زر استوديو التحضير أعلاه لتجده جاهزاً فوراً!
                    </p>
                  </div>
                </div>
              </div>

              {/* Verified Webhook Endpoint Info */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>بيانات الويب هوك المعتمدة لميتا</span>
                  </h4>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200">200 OK</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500">رابط الويب هوك (Callback URL):</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={effectivePublicWebhookUrl}
                      className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[11px] px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono select-all truncate"
                    />
                    <button
                      onClick={() => copyToClipboard(effectivePublicWebhookUrl, 'webhookUrlInbound')}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold transition shrink-0"
                    >
                      {copiedKey === 'webhookUrlInbound' ? 'تم النسخ' : 'نسخ'}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500">رمز التحقق (Verify Token):</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={config.webhookVerifyToken}
                      className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[11px] px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono select-all truncate"
                    />
                    <button
                      onClick={() => copyToClipboard(config.webhookVerifyToken, 'verifyTokenInbound')}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold transition shrink-0"
                    >
                      {copiedKey === 'verifyTokenInbound' ? 'تم النسخ' : 'نسخ'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: Live Interactive WhatsApp Simulator */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Quick Prompts & Explanation */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>كيف يعمل النظام عند إرسال رسالة؟</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                يمكنك اختبار الذكاء الاصطناعي والمحرك التربوي فوراً من خلال كتابة أي رسالة أو الضغط على أحد الأمثلة السريعة أدناه لمشاهدة استجابة النظام الفورية:
              </p>

              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-extrabold text-slate-400">💡 اضغط على أي نموذج للتجربة المباشرة:</span>
                
                <button
                  onClick={() => handleSendSimulatorMessage('أريد تحضير درس بعنوان الأفلاج في سلطنة عمان')}
                  disabled={isTyping}
                  className="w-full text-right p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>تحضير درس: الأفلاج في سلطنة عمان</span>
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-emerald-200">طلب تحضير</span>
                </button>

                <button
                  onClick={() => handleSendSimulatorMessage('أرسل لي جدول الحصص اليوم')}
                  disabled={isTyping}
                  className="w-full text-right p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 transition text-xs font-bold text-teal-950 dark:text-teal-200 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>أرسل لي جدول الحصص اليوم</span>
                  </span>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-teal-200">استعلام جدول</span>
                </button>

                <button
                  onClick={() => handleSendSimulatorMessage('صياغة خطاب رسمي لولي أمر طالب متفوق')}
                  disabled={isTyping}
                  className="w-full text-right p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition text-xs font-bold text-rose-950 dark:text-rose-200 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>خطاب رسمي لولي أمر طالب متفوق</span>
                  </span>
                  <span className="text-[10px] text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-rose-200">صياغة خطاب</span>
                </button>

                <button
                  onClick={() => handleSendSimulatorMessage('ابحث عن كتاب الجغرافيا الاقتصادية')}
                  disabled={isTyping}
                  className="w-full text-right p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>ابحث عن كتاب الجغرافيا الاقتصادية</span>
                  </span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-indigo-200">بحث مكتبة</span>
                </button>

                <button
                  onClick={() => handleSendSimulatorMessage('مساعدة')}
                  disabled={isTyping}
                  className="w-full text-right p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>مساعدة (عرض الأوامر المتاحة)</span>
                  </span>
                  <span className="text-[10px] text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200">أوامر</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-900 dark:text-amber-200 space-y-1.5 leading-relaxed">
              <div className="font-extrabold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>مزامنة تلقائية حية مع النظام:</span>
              </div>
              <p>
                أي درس يتم تحضيره عبر هذه المحادثة يتم حفظه فوراً في <strong>«استوديو التحضير»</strong> ويكون متاحاً لك وللمشرف التربوي للاستعراض والتعديل والطباعة في أي لحظة.
              </p>
            </div>
          </div>

          {/* Interactive WhatsApp Mockup Screen */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border-4 border-slate-800 dark:border-slate-700 bg-[#efeae2] dark:bg-slate-950 overflow-hidden shadow-2xl flex flex-col h-[580px]">
              {/* WhatsApp Chat Header */}
              <div className="bg-[#075e54] text-white p-3.5 flex items-center justify-between shadow-md select-none">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-700 border-2 border-emerald-400/60 flex items-center justify-center font-black text-white text-base shadow-xs">
                    🇴🇲
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold flex items-center gap-1.5">
                      <span>{config.displayName}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                    </h4>
                    <span className="text-[10px] text-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>متصل الآن • بوت المكتبة المدرسية</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-white/80 text-xs">
                  <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-white/10 text-[10px]">
                    {config.phoneNumber}
                  </span>
                </div>
              </div>

              {/* Chat Messages Body */}
              <div
                className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs"
                style={{
                  backgroundImage: `radial-gradient(#075e54 0.5px, transparent 0.5px)`,
                  backgroundSize: '16px 16px'
                }}
              >
                {simMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[85%] ${
                      msg.sender === 'user' ? 'mr-auto items-end' : 'ml-auto items-start'
                    }`}
                  >
                    <div
                      className={`p-3.5 rounded-2xl shadow-xs relative leading-relaxed whitespace-pre-wrap ${
                        msg.sender === 'user'
                          ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-none'
                          : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none border border-slate-100 dark:border-slate-700'
                      }`}
                    >
                      <div>{msg.text}</div>

                      {/* If lesson was created, show quick link */}
                      {msg.lessonId && (
                        <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
                          <button
                            onClick={() => {
                              setActiveView('lesson_studio');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold flex items-center gap-1.5 transition shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>فتح الدرس في استوديو التحضير</span>
                          </button>
                        </div>
                      )}

                      {/* If official letter was created, show quick link */}
                      {msg.letterId && (
                        <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
                          <button
                            onClick={() => {
                              setActiveView('letters');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-extrabold flex items-center gap-1.5 transition shadow-xs"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>فتح الخطاب في المراسلات الرسمية</span>
                          </button>
                        </div>
                      )}

                      <div className="text-[9px] text-slate-400 text-left mt-1.5 flex items-center justify-end gap-1">
                        <span>{msg.time}</span>
                        {msg.sender === 'user' && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-500 px-3 py-2 rounded-2xl w-fit shadow-xs border border-slate-100 dark:border-slate-700 text-[11px] animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                    <span>المساعد الذكي يقوم بإعداد الرد وتحضير المحتوى...</span>
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendSimulatorMessage();
                }}
                className="bg-[#f0f2f5] dark:bg-slate-900 p-2.5 flex items-center gap-2 border-t border-slate-200 dark:border-slate-800"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="اكتب رسالة (مثال: أريد تحضير درس بعنوان الأفلاج، أو أرسل جدول الحصص)..."
                  className="flex-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2.5 rounded-2xl text-xs border border-slate-300 dark:border-slate-700 focus:outline-hidden focus:border-emerald-500 transition"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isTyping}
                  className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 transition shadow-sm"
                  title="إرسال"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: API & Webhook Configuration */}
      {activeTab === 'api' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Webhook Configuration Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>إعدادات الـ Webhook الرسمي (Meta Cloud API / Twilio)</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              هذه البيانات يتم إدخالها في لوحة تحكم Meta Developers أو مزود الـ API لربط رقم الهاتف الفعلي:
            </p>

            {/* Webhook URL */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">رابط الويب هوك (Callback URL / Webhook URL):</label>
                <span className="text-[10px] text-emerald-600 font-extrabold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200">
                  متوافق مع Meta Cloud API
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={effectivePublicWebhookUrl}
                  className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-mono select-all"
                />
                <button
                  onClick={() => copyToClipboard(effectivePublicWebhookUrl, 'webhookUrl')}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1"
                >
                  {copiedKey === 'webhookUrl' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey === 'webhookUrl' ? 'تم النسخ' : 'نسخ'}</span>
                </button>
              </div>

              {/* Webhook Ping Test Button */}
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestWebhookPing}
                  disabled={webhookTesting}
                  className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-[11px] font-bold transition flex items-center gap-1.5"
                >
                  {webhookTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />}
                  <span>اختبار صحة استجابة الرابط مع ميتا (Test Ping)</span>
                </button>
              </div>

              {webhookTestResult && (
                <div className={`p-2.5 rounded-xl text-[11px] font-bold flex items-center gap-2 animate-in fade-in ${
                  webhookTestResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200'
                }`}>
                  {webhookTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
                  <span>{webhookTestResult.message}</span>
                </div>
              )}
            </div>

            {/* Verify Token */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">رمز التحقق (Verify Token):</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={config.webhookVerifyToken}
                  onChange={(e) => setConfig({ ...config, webhookVerifyToken: e.target.value })}
                  className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-mono"
                />
                <button
                  onClick={() => copyToClipboard(config.webhookVerifyToken, 'verifyToken')}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1"
                >
                  {copiedKey === 'verifyToken' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey === 'verifyToken' ? 'تم النسخ' : 'نسخ'}</span>
                </button>
              </div>
            </div>

            {/* How to open Webhooks and enable messages guide */}
            <div className="p-3.5 bg-linear-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/40 border border-teal-200 dark:border-teal-800 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-teal-950 dark:text-teal-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>خطوات فتح صفحة Webhooks وتفعيل حقل (messages) بميتا:</span>
                </span>
                <a
                  href="https://developers.facebook.com/apps/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold transition flex items-center gap-1 shrink-0"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>فتح Meta Developers</span>
                </a>
              </div>
              <p className="text-[11px] text-teal-900/90 dark:text-teal-200/90 leading-relaxed">
                لكي تعيد ميتا توجيه رسائل الواتساب الواردة إلى هذا الخادم تلقائياً:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-teal-950 dark:text-teal-200 pr-1">
                <li>ادخل على <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer" className="underline font-bold text-teal-700 dark:text-teal-300">developers.facebook.com/apps</a> وافتح تطبيقك.</li>
                <li>من القائمة الجانبية اليسرى: اضغط على <strong>WhatsApp</strong> ⬅️ <strong>Configuration</strong>.</li>
                <li>في قسم <strong>Webhook</strong>، اضغط زر <strong>Manage</strong> أمام حقول الويب هوك.</li>
                <li>في النافذة المنبثقة، ابحث عن حقل <strong>messages</strong> واضغط زر <strong>Subscribe</strong> أمامه حتى يظهر باللون الأخضر.</li>
                <li>اضغط <strong>Save</strong> لتأكيد حفظ الاشتراك.</li>
              </ol>
            </div>

            {/* Provider Selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">مزود خدمة الواتساب (Provider):</label>
              <select
                value={config.provider}
                onChange={(e) => setConfig({ ...config, provider: e.target.value as any })}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <option value="cloud_api">Meta WhatsApp Cloud API (الرسمي المباشر)</option>
                <option value="twilio">Twilio for WhatsApp</option>
                <option value="qr_local">الربط المباشر عبر رمز الاستجابة السريعة (QR Code)</option>
                <option value="mock_simulator">وضع المحاكاة والتدريب المباشر</option>
              </select>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">رقم هاتف البوت المسجل في ميتا:</label>
              <input
                type="text"
                value={config.phoneNumber}
                onChange={(e) => setConfig({ ...config, phoneNumber: e.target.value })}
                placeholder="+96872645072"
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
              />
            </div>

            {/* Permanent Storage Status Badge */}
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-2xl flex items-center gap-2 text-[11px] text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>الحفظ الدائم نشط:</strong> يتم حفظ مفاتيح Meta Cloud API في المتصفح وقاعدة البيانات تلقائياً، ولن تحتاج لإعادة إدخالها عند تحديث الصفحة أو فتح النظام مجدداً.</span>
            </div>

            {/* Meta Cloud API: Phone Number ID */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">معرف رقم الهاتف (Phone Number ID):</label>
                <span className="text-[10px] text-teal-600 dark:text-teal-400">من صفحة Step 1 أو Step 2</span>
              </div>
              <input
                type="text"
                value={config.phoneNumberId || ''}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  setConfig({ ...config, phoneNumberId: val });
                  localStorage.setItem(STORAGE_KEY_PHONE_ID, val);
                }}
                onBlur={() => {
                  if (config.phoneNumberId) {
                    saveConfigUpdates({ phoneNumberId: config.phoneNumberId, enabled: true });
                  }
                }}
                placeholder="1362186010314869"
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>

            {/* Meta Cloud API: Access Token */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">رمز الوصول (Access Token):</label>
                <span className="text-[10px] text-teal-600 dark:text-teal-400">Temporary أو Permanent Token</span>
              </div>
              <textarea
                rows={2}
                value={config.apiKey || ''}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  setConfig({ ...config, apiKey: val });
                  localStorage.setItem(STORAGE_KEY_TOKEN, val);
                }}
                onBlur={() => {
                  if (config.apiKey) {
                    saveConfigUpdates({ apiKey: config.apiKey, enabled: true });
                  }
                }}
                placeholder="يبدأ بـ EAAP..."
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-mono resize-none select-all"
              />
            </div>

            {/* WABA ID */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">معرف حساب واتساب للأعمال (WABA ID - اختياري):</label>
              <input
                type="text"
                value={config.wabaId || ''}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  setConfig({ ...config, wabaId: val });
                  localStorage.setItem(STORAGE_KEY_WABA_ID, val);
                }}
                onBlur={() => {
                  if (config.wabaId) {
                    saveConfigUpdates({ wabaId: config.wabaId });
                  }
                }}
                placeholder="1625416795778143"
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={() => saveConfigUpdates({
                  webhookVerifyToken: config.webhookVerifyToken,
                  provider: config.provider,
                  phoneNumber: config.phoneNumber,
                  phoneNumberId: config.phoneNumberId,
                  apiKey: config.apiKey,
                  wabaId: config.wabaId,
                  enabled: true
                })}
                disabled={saving}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>حفظ وتثبيت دائم لإعدادات Meta Cloud API</span>
              </button>
            </div>

            {/* How to get Permanent Token Accordion */}
            <div className="p-3.5 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 rounded-2xl space-y-2 text-xs">
              <button
                type="button"
                onClick={() => setShowPermanentTokenGuide(!showPermanentTokenGuide)}
                className="w-full flex items-center justify-between text-sky-800 dark:text-sky-300 font-bold cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  <span>💡 كيف تجعل رمز الوصول (Access Token) دائماً لا ينتهي كل 24 ساعة؟</span>
                </span>
                <span className="text-[11px] underline">{showPermanentTokenGuide ? 'إخفاء الشرح' : 'عرض الخطوات (دقيقة واحدة)'}</span>
              </button>

              {showPermanentTokenGuide && (
                <div className="pt-2 text-[11px] text-sky-900 dark:text-sky-200 space-y-2 leading-relaxed border-t border-sky-200/60 dark:border-sky-800/60">
                  <p>الرمز الظاهر في شاشة <code>Try it out</code> هو توكن تجريبي مدته 24 ساعة بموجب سياسة ميتا. لجعل الربط دائماً مدى الحياة:</p>
                  <ol className="list-decimal list-inside space-y-2 font-sans">
                    <li>افتح <strong>Meta Business Suite ⬅️ إعدادات الأعمال (Business Settings)</strong>.</li>
                    <li>من القائمة اليمنى اختر <strong>مستخدمو النظام (System Users)</strong> واختر المستخدم.</li>
                    <li className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-xl text-amber-900 dark:text-amber-200">
                      <strong>⚠️ خطوة أساسية لمنع رسالة (No permissions available):</strong><br />
                      اضغط أولاً على زر <strong>تعيين أصول (Assign Assets)</strong> بجوار اسم المستخدم ⬅️ اختر <strong>Apps (التطبيقات)</strong> ⬅️ اختر تطبيقك ⬅️ فعّل مفتاح <strong>Full Control / Manage App (تحكم كامل)</strong> ⬅️ اضغط <strong>Save Changes (حفظ التغييرات)</strong>.
                    </li>
                    <li>بعد حفظ الأصول، اضغط الآن على زر <strong>توليد رمز جديد (Generate Token)</strong> واختر مدة الصلاحية <code>Never (دائم لا ينتهي)</code> وستظهر لك الصلاحيات فوراً دون أي خطأ.</li>
                    <li>فعّل الصلاحيات التالية: <code>whatsapp_business_messaging</code> و <code>whatsapp_business_management</code>.</li>
                    <li>انسخ التوكن الناتج والصقه هنا في خانة (رمز الوصول)، وسيتم حفظه دائماً ولن يطلبه منك النظام مرة أخرى!</li>
                  </ol>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Testing & Quick Dispatcher */}
          <div className="space-y-6">
            {/* Quick Mobile Dispatcher Card (Send lesson plans, timetables, and official letters straight to WhatsApp) */}
            <div className="p-6 rounded-3xl bg-teal-50/80 dark:bg-teal-950/20 border-2 border-teal-500/30 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-teal-900 dark:text-teal-200 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-teal-600" />
                  <span>مُرسل التحضير والجداول والخطابات إلى هاتفك 📲</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300">
                  إرسال فوري إلى الواتساب
                </span>
              </div>
              <p className="text-xs text-teal-800 dark:text-teal-300/90 leading-relaxed">
                استقبل أي تحضير درس، أو جدول حصصك، أو خطاباً رسمياً مباشراً في محادثة الواتساب بهاتفك بلمسة واحدة:
              </p>

              {/* Dispatcher Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-teal-100/60 dark:bg-teal-900/40 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setDispatcherType('lesson')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    dispatcherType === 'lesson'
                      ? 'bg-white dark:bg-slate-800 text-teal-900 dark:text-teal-200 shadow-xs'
                      : 'text-teal-700 dark:text-teal-300 hover:text-teal-900'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                  <span>تحضير درس</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDispatcherType('timetable')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    dispatcherType === 'timetable'
                      ? 'bg-white dark:bg-slate-800 text-teal-900 dark:text-teal-200 shadow-xs'
                      : 'text-teal-700 dark:text-teal-300 hover:text-teal-900'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-sky-600" />
                  <span>جدول الحصص</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDispatcherType('letter')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    dispatcherType === 'letter'
                      ? 'bg-white dark:bg-slate-800 text-teal-900 dark:text-teal-200 shadow-xs'
                      : 'text-teal-700 dark:text-teal-300 hover:text-teal-900'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 text-rose-600" />
                  <span>خطاب رسمي</span>
                </button>
              </div>

              {/* Recipient Phone input common to all */}
              <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-teal-200 dark:border-teal-800/50">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">رقم هاتفك المستلم (الواتساب الشخصي):</label>
                  <input
                    type="text"
                    value={liveTestPhone}
                    onChange={(e) => {
                      setLiveTestPhone(e.target.value);
                      localStorage.setItem(STORAGE_KEY_RECIPIENT, e.target.value.trim());
                    }}
                    placeholder="+96877394680"
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>

                {/* Sub-view: Lesson Prep */}
                {dispatcherType === 'lesson' && (
                  <div className="space-y-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">اختر موضوع الدرس من المنهج:</label>
                      <select
                        value={selectedPresetTopic}
                        onChange={(e) => {
                          setSelectedPresetTopic(e.target.value);
                          setCustomDispatchTopic('');
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                      >
                        <option value="تحضير درس الأفلاج في سلطنة عمان">تحضير درس الأفلاج في سلطنة عمان (أنظمة الري العمانية)</option>
                        <option value="تحضير درس موقع سلطنة عمان الجغرافي وأهميته الحضارية">تحضير درس موقع سلطنة عمان الجغرافي وأهميته الحضارية</option>
                        <option value="تحضير درس عناصر المناخ والعوامل المؤثرة في مناخ عمان">تحضير درس عناصر المناخ والعوامل المؤثرة في مناخ عمان</option>
                        <option value="تحضير درس التنوع الحيوي والمحميات الطبيعية في سلطنة عمان">تحضير درس التنوع الحيوي والمحميات الطبيعية في سلطنة عمان</option>
                        <option value="تحضير درس مصادر الطاقة المتجددة والهيدروجين الأخضر في سلطنة عمان">تحضير درس مصادر الطاقة المتجددة والهيدروجين الأخضر برؤية 2040</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">أو اكتب عنوان درس مخصص:</label>
                      <input
                        type="text"
                        value={customDispatchTopic}
                        onChange={(e) => setCustomDispatchTopic(e.target.value)}
                        placeholder="مثال: تحضير درس قلاع وحصون عمان أو التجارة البحرية..."
                        className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={handleQuickDispatchToWhatsApp}
                        disabled={dispatchingLesson || !liveTestPhone.trim()}
                        className="py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        {dispatchingLesson ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>جاري الإرسال...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>إرسال عبر السيرفر 🚀</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleOpenDirectLessonInWhatsApp}
                        type="button"
                        className="py-2.5 px-3 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4 text-emerald-400" />
                        <span>فتح في واتساب ويب / الهاتف 📲</span>
                      </button>
                    </div>

                    {dispatchStatus && (
                      <div className={`p-3 rounded-xl text-xs font-bold leading-relaxed ${
                        dispatchStatus.success
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200'
                      }`}>
                        {dispatchStatus.message}
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-view: Timetable */}
                {dispatcherType === 'timetable' && (
                  <div className="space-y-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">نطاق الجدول المراد استلامه:</label>
                      <select
                        value={dispatchTimetableFilter}
                        onChange={(e) => setDispatchTimetableFilter(e.target.value as any)}
                        className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                      >
                        <option value="today">جدول حصص اليوم الحالي فقط (مع الحصص والشعب والقاعات)</option>
                        <option value="all">جدول الحصص الأسبوعي كاملاً (الأحد إلى الخميس)</option>
                      </select>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      💡 سيتم تنسيق الجدول المدرسي المعتمد المسجل في قسم "الجدول الأسبوعي" متضمناً أنصبة الحصص والقاعات.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={handleQuickDispatchTimetable}
                        disabled={dispatchingTimetable || !liveTestPhone.trim()}
                        className="py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        {dispatchingTimetable ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>جاري إرسال الجدول...</span>
                          </>
                        ) : (
                          <>
                            <Calendar className="w-4 h-4" />
                            <span>إرسال الجدول لهاتفي 🚀</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleOpenDirectTimetableInWhatsApp}
                        type="button"
                        className="py-2.5 px-3 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4 text-emerald-400" />
                        <span>فتح في واتساب ويب / الهاتف 📲</span>
                      </button>
                    </div>

                    {timetableDispatchStatus && (
                      <div className={`p-3 rounded-xl text-xs font-bold leading-relaxed ${
                        timetableDispatchStatus.success
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200'
                      }`}>
                        {timetableDispatchStatus.message}
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-view: Official Letters */}
                {dispatcherType === 'letter' && (
                  <div className="space-y-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">الجهة الموجه إليها الخطاب:</label>
                      <select
                        value={letterRecipientRole}
                        onChange={(e) => setLetterRecipientRole(e.target.value as any)}
                        className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                      >
                        <option value="parent">إلى ولي أمر الطالب</option>
                        <option value="school_admin">إلى إدارة المدرسة / مدير المدرسة</option>
                        <option value="directorate">إلى المديرية العامة للتربية والتعليم</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">موضوع أو نموذج الخطاب:</label>
                      <select
                        value={selectedLetterPreset}
                        onChange={(e) => {
                          setSelectedLetterPreset(e.target.value);
                          setCustomLetterTopic('');
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                      >
                        {letterRecipientRole === 'parent' && (
                          <>
                            <option value="شكر وتقدير لتفوق وتميز الطالب الأكاديمي">شكر وتقدير لتفوق وتميز الطالب الأكاديمي في مادة الجغرافيا</option>
                            <option value="إشعار بمستوى التحصيل الدراسي وطلب التعاون المشترك">إشعار بمستوى التحصيل الدراسي وطلب التعاون لمتابعة الطالب</option>
                            <option value="استمارة موافقة ولي الأمر على المشاركة في الرحلة الميدانية الجغرافية">استمارة موافقة على المشاركة في رحلة استكشافية جغرافية</option>
                          </>
                        )}
                        {letterRecipientRole === 'school_admin' && (
                          <>
                            <option value="طلب حجز وتخصيص قاعة الحاسوب ومصادر التعلم لتطبيقات GIS">طلب حجز قاعة الحاسوب لتطبيقات الجغرافيا ونظم المعلومات GIS</option>
                            <option value="تقرير نتائج الاختبار القصير الأول والتوصيات الأكاديمية">تقرير نتائج الاختبار القصير الأول وخطة الرعاية الأكاديمية</option>
                            <option value="مقترح إقامة معرض اليوم الجغرافي العماني تزامناً مع العيد الوطني">مقترح تنظيم معرض اليوم الجغرافي العماني</option>
                          </>
                        )}
                        {letterRecipientRole === 'directorate' && (
                          <>
                            <option value="طلب تزويد المدرسة بأجهزة ونظم معلومات جغرافية GIS وأطالس حديثة">طلب تزويد المدرسة بأجهزة حاسوب لنظم المعلومات الجغرافية GIS</option>
                            <option value="إشعار وتنسيق رحلة علمية استكشافية إلى كهف الهوتة والجبل الأخضر">إشعار بتنظيم رحلة علمية جغرافية إلى كهف الهوتة والجبل الأخضر</option>
                            <option value="طلب اعتماد واستضافة مشغل تدريبي لمعلمي الجغرافيا">طلب استضافة مشغل تدريبي حول توظيف الذكاء الاصطناعي</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">أو اكتب موضوع مخصص للخطاب:</label>
                      <input
                        type="text"
                        value={customLetterTopic}
                        onChange={(e) => setCustomLetterTopic(e.target.value)}
                        placeholder="مثال: طلب تكريم الطلبة المتميزين في مسابقة الخرائط..."
                        className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={handleQuickDispatchLetter}
                        disabled={dispatchingLetter || !liveTestPhone.trim()}
                        className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        {dispatchingLetter ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>جاري إرسال الخطاب...</span>
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4" />
                            <span>إرسال الخطاب لهاتفي 🚀</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleOpenDirectLetterInWhatsApp}
                        type="button"
                        className="py-2.5 px-3 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4 text-emerald-400" />
                        <span>فتح في واتساب ويب / الهاتف 📲</span>
                      </button>
                    </div>

                    {letterDispatchStatus && (
                      <div className={`p-3 rounded-xl text-xs font-bold leading-relaxed ${
                        letterDispatchStatus.success
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200'
                      }`}>
                        {letterDispatchStatus.message}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Live WhatsApp Test Greeting Card */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>إرسال رسالة ترحيبية تجريبية 💬</span>
                </h3>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">نص الرسالة الاختبارية:</label>
                  <input
                    type="text"
                    value={liveTestText}
                    onChange={(e) => setLiveTestText(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <button
                  onClick={handleSendLiveTest}
                  disabled={liveTesting || !liveTestPhone.trim()}
                  className="w-full py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  {liveTesting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري الإرسال...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>إرسال الرسالة إلى هاتفي الآن 🚀</span>
                    </>
                  )}
                </button>

                {liveTestStatus && (
                  <div className={`p-3 rounded-xl text-xs font-bold leading-relaxed ${
                    liveTestStatus.success
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200'
                  }`}>
                    {liveTestStatus.message}
                  </div>
                )}
              </div>

              {/* Available WhatsApp Commands Guide */}
              <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 space-y-2 text-[11px] text-slate-700 dark:text-slate-300">
                <div className="font-extrabold flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>الأوامر الذكية المدعومة في التحضير والاستعلام:</span>
                </div>
                <div className="grid grid-cols-1 gap-1 text-[11px]">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700/60">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">📖 لتحضير أي درس: </span>
                    <span>أرسل <em>"تحضير درس [عنوان الدرس]"</em> أو <em>"حضر لي درس الأفلاج في عمان"</em></span>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700/60">
                    <span className="font-bold text-sky-700 dark:text-sky-400">📅 لطلب جدول الحصص: </span>
                    <span>أرسل <em>"جدول الحصص"</em> أو <em>"حصتي اليوم"</em></span>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700/60">
                    <span className="font-bold text-amber-700 dark:text-amber-400">🔍 للبحث في كتب المنهج: </span>
                    <span>أرسل <em>"بحث عن [الموضوع]"</em> أو <em>"كتاب الجغرافيا"</em></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>الربط السريع عبر رمز QR للهاتف المدرسي</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                في حال عدم الرغبة باستخدام Meta Cloud API، يمكن ربط جلسة واتساب ويب مباشرة عبر رمز QR:
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 text-center flex flex-col items-center justify-center gap-2.5">
                <div className="w-32 h-32 bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center">
                  {/* Generated QR Placeholder SVG */}
                  <svg className="w-full h-full text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <rect x="6" y="6" width="1" height="1" fill="currentColor" />
                    <rect x="17" y="6" width="1" height="1" fill="currentColor" />
                    <rect x="6" y="17" width="1" height="1" fill="currentColor" />
                    <path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 18h1v3h-1zM18 14h3v1h-3z" fill="currentColor" />
                  </svg>
                </div>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  امسح الرمز من تطبيق الواتساب في هاتف المدرسة
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold">
                  جاهز للاستقبال والرد التلقائي
                </span>
              </div>
            </div>

            {/* Privacy & Safety Note */}
            <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2 text-xs text-emerald-950 dark:text-emerald-200">
              <div className="font-extrabold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>ضوابط الخصوصية والأمان</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
                <li>لا يستطيع أي رقم مجهول إصدار أوامر تحضير أو استعلام إلا إذا كان مضافاً في قائمة الأرقام المعتمدة.</li>
                <li>تتم معالجة كافة الرسائل داخل الخادم المشفر للمنصة دون تخزين أي بيانات لدى أطراف ثالثة.</li>
                <li>يتم توثيق كل طلب تحضير أو استعلام مع اسم المعلم ورقم الهاتف في سجل التدقيق الأمني.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Authorized Numbers */}
      {activeTab === 'numbers' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>أرقام المعلمين والإدارة المصرح لهم ({config.authorizedNumbers.length})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                فقط الأرقام المسجلة هنا يمكنها إرسال أوامر تحضير الدروس والاستعلام عن الجداول عبر الواتساب.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingNumber(null);
                setNumForm({ name: '', phone: '', role: 'teacher', notes: '' });
                setNumModalOpen(true);
              }}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ إضافة رقم مصرح له</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3">الاسم والصفة</th>
                  <th className="py-2.5 px-3">رقم الواتساب</th>
                  <th className="py-2.5 px-3">الدور والصلاحية</th>
                  <th className="py-2.5 px-3">الحالة</th>
                  <th className="py-2.5 px-3">ملاحظات</th>
                  <th className="py-2.5 px-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {config.authorizedNumbers.map(num => (
                  <tr key={num.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      {num.name}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300 select-all">
                      {num.phone}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        num.role === 'admin'
                          ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          : 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                      }`}>
                        {num.role === 'admin' ? 'إدارة المدرسة' : 'معلم أول / معلم'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleToggleNumberStatus(num.id)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition ${
                          num.active
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {num.active ? 'نشط ومصرح له' : 'معطل مؤقتاً'}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      {num.notes || '—'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingNumber(num);
                            setNumForm({
                              name: num.name,
                              phone: num.phone,
                              role: num.role,
                              notes: num.notes || ''
                            });
                            setNumModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 transition"
                          title="تعديل"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteNumber(num.id)}
                          className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-rose-600 transition"
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

      {/* TAB 4: Inbound Activity Logs */}
      {activeTab === 'logs' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>سجل الرسائل والطلبات المستلمة ({logs.length})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                توثيق كامل لكافة الرسائل، نوع الطلب، ورابط التحضير الذي تم توليده.
              </p>
            </div>
            {logs.length > 0 && (
              <button
                onClick={handleClearLogs}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 text-slate-600 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>إفراغ السجل</span>
              </button>
            )}
          </div>

          {logs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto opacity-30" />
              <p>لا توجد رسائل مستلمة حتى الآن.</p>
              <p className="text-[11px] text-emerald-600 font-bold">
                يمكنك تجربة إرسال رسالة من تبويب «محاكي الواتساب التفاعلي» لتظهر هنا فوراً.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3">الوقت والتاريخ</th>
                    <th className="py-2.5 px-3">المرسل والرقم</th>
                    <th className="py-2.5 px-3">نص الرسالة الواردة</th>
                    <th className="py-2.5 px-3">نوع الطلب</th>
                    <th className="py-2.5 px-3">الحالة والنتيجة</th>
                    <th className="py-2.5 px-3 text-center">الدرس المرتبط</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('ar-OM', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-white">{log.senderName || 'معلم'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{log.fromPhone}</div>
                      </td>
                      <td className="py-3 px-3 max-w-xs truncate font-medium text-slate-800 dark:text-slate-200" title={log.messageText}>
                        {log.messageText}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.intent === 'lesson_request'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : log.intent === 'timetable_request'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : log.intent === 'library_search'
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {log.intent === 'lesson_request' ? 'تحضير درس' :
                           log.intent === 'timetable_request' ? 'جدول حصص' :
                           log.intent === 'library_search' ? 'بحث مكتبة' : 'مساعدة / استعلام'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300 text-[11px]">
                        {log.responseSummary || 'تم الرد'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {log.generatedLessonId ? (
                          <button
                            onClick={() => {
                              setActiveView('lesson_studio');
                            }}
                            className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>استعراض الدرس</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PRE-ACTIVATION CONFIRMATION & WARNING MODAL (Requirement: عرض تنبيه للمستخدم قبل التفعيل) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  تنبيه وإقرار الأمان والخصوصية قبل تفعيل ربط الواتساب
                </h3>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p className="font-bold text-slate-900 dark:text-white">
                يرجى قراءة التنبيهات والضوابط التالية قبل تفعيل استقبال وتنفيذ طلبات الواتساب:
              </p>

              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-[11px] text-amber-900 dark:text-amber-200 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="font-black text-amber-600">1.</span>
                  <span><strong>أمان البيانات وخصوصية المدرسة:</strong> لا يتم مشاركة أرقام الهواتف أو محتويات الدروس والجداول المدرسية مع أي طرف ثالث خارج خادم المنصة.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-black text-amber-600">2.</span>
                  <span><strong>حصر الصلاحيات:</strong> ينبغي إبقاء خيار "الأرقام المصرح لها" مقتصراً على المعلمين والإداريين المعتمدين لمنع أي استعلامات غير مصرح بها.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-black text-amber-600">3.</span>
                  <span><strong>توثيق العمليات:</strong> جميع عمليات توليد الدروس واستعلام الجداول التي تتم عبر الواتساب توثق لحظياً في سجل التدقيق المالي والإداري للنظام.</span>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 select-none">
                  أقر بأنني اطلعت على ضوابط الأمان والخصوصية وأوافق على تفعيل استقبال ومعالجة طلبات الواتساب.
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={confirmActivation}
                disabled={!termsAgreed || saving}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-extrabold transition shadow-md flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تأكيد وبدء التفعيل</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Authorized Number Modal */}
      {numModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>{editingNumber ? 'تعديل بيانات الرقم المصرح له' : 'إضافة رقم هاتف مصرح له'}</span>
              </h3>
              <button
                onClick={() => setNumModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNumber} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">الاسم والصفة:</label>
                <input
                  type="text"
                  required
                  value={numForm.name}
                  onChange={(e) => setNumForm({ ...numForm, name: e.target.value })}
                  placeholder="مثال: أ. مريم المعمرية (معلم أول)"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">رقم الواتساب (مع المفتاح الدولي):</label>
                <input
                  type="text"
                  required
                  value={numForm.phone}
                  onChange={(e) => setNumForm({ ...numForm, phone: e.target.value })}
                  placeholder="+96891234567"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">الدور:</label>
                <select
                  value={numForm.role}
                  onChange={(e) => setNumForm({ ...numForm, role: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <option value="teacher">معلم / معلم أول</option>
                  <option value="admin">إدارة المدرسة / مشرف تربوي</option>
                  <option value="viewer">مطلع</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">ملاحظات إضافية (اختياري):</label>
                <input
                  type="text"
                  value={numForm.notes}
                  onChange={(e) => setNumForm({ ...numForm, notes: e.target.value })}
                  placeholder="مثال: مادة الجغرافيا والصف الحادي عشر"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setNumModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-sm"
                >
                  {editingNumber ? 'حفظ التعديلات' : 'إضافة الرقم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
