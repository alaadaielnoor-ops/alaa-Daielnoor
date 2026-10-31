import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { User, RoleType } from '../../types/index.ts';
import {
  X, User as UserIcon, Mail, Shield, Upload, Camera,
  Check, Trash2, Sparkles, RefreshCw, AlertCircle
} from 'lucide-react';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  isNewUser?: boolean;
  onSuccess?: () => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  user,
  isNewUser = false,
  onSuccess
}) => {
  const { currentUser, refreshUsers, updateCurrentUser, showToast } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<RoleType>('teacher');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [previewAvatar, setPreviewAvatar] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [confirmDelete, setConfirmDelete] = useState(false);

  // Preset avatars for quick selection
  const PRESET_AVATARS = [
    { label: 'صورة المالك الأصلية (المرفوعة)', url: '/owner_avatar.jpg' },
    { label: 'بروفايل المالك الرسمي', url: '/owner_profile.jpg' },
    { label: 'أيقونة المنصة الرسمية', url: '/icon.svg' },
    { label: 'معلم أول', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80' },
    { label: 'معلمة ومؤلفة', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80' },
    { label: 'باحث أكاديمي', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80' },
    { label: 'مشرفة تربوية', url: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=256&q=80' }
  ];

  useEffect(() => {
    if (isOpen) {
      setConfirmDelete(false);
      if (user && !isNewUser) {
        setName(user.name);
        setEmail(user.email);
        setRole(user.role);
        setAvatarUrl(user.avatarUrl || '');
        setPreviewAvatar(user.avatarUrl || '');
      } else {
        setName('');
        setEmail('');
        setRole('teacher');
        setAvatarUrl('/icon.svg');
        setPreviewAvatar('/icon.svg');
      }
      setError(null);
    }
  }, [isOpen, user, isNewUser]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('يرجى اختيار ملف صورة صالح (JPEG, PNG, WEBP, SVG)');
      return;
    }

    setUploading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        setPreviewAvatar(base64);

        // Upload to server
        const res = await api.uploadImage(base64, file.name, 'avatar');
        if (res.success && res.url) {
          setAvatarUrl(res.url);
          setPreviewAvatar(res.url);
          showToast('تم تحميل الصورة بنجاح', 'success');
        } else {
          // Fallback to base64 if upload endpoint fails
          setAvatarUrl(base64);
        }
      } catch (err: any) {
        console.warn('Upload error, using local base64 preview:', err);
        setAvatarUrl(reader.result as string);
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => {
      setError('فشلت قراءة ملف الصورة');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('اسم المستخدم مطلوب ولا يمكن تركه فارغاً');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (isNewUser || !user) {
        // Create new user
        const res = await api.addUser({
          name: name.trim(),
          email: email.trim() || undefined,
          role,
          avatarUrl: avatarUrl.trim() || undefined
        }, currentUser.id);

        if (res.success) {
          showToast(`تمت إضافة المستخدم "${res.user.name}" بنجاح`, 'success');
          await refreshUsers();
          if (onSuccess) onSuccess();
          onClose();
        }
      } else {
        // Update existing user
        const res = await api.updateUser(user.id, {
          name: name.trim(),
          email: email.trim(),
          role,
          avatarUrl: avatarUrl.trim()
        }, currentUser.id);

        if (res.success) {
          showToast(`تم تحديث اسم وبيانات "${res.user.name}" بنجاح`, 'success');
          updateCurrentUser(res.user);
          await refreshUsers();
          if (onSuccess) onSuccess();
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message || 'فشل حفظ التعديلات');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user || user.id === 'usr-admin-1') {
      showToast('لا يمكن حذف المالك الرئيسي للمكتبة', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await api.deleteUser(user.id, currentUser.id);
      if (res.success) {
        showToast(res.message, 'success');
        await refreshUsers();
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'فشل حذف المستخدم');
    } finally {
      setSaving(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 md:p-6 overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-right">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-xs">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {isNewUser ? 'إضافة مستخدم جديد للنظام' : 'تعديل بيانات واسم المستخدم'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isNewUser ? 'إنشاء حساب جديد وتعيين الصلاحيات' : `تعديل اسم وحساب: ${user?.name}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="relative shrink-0">
              {previewAvatar ? (
                <img
                  src={previewAvatar}
                  alt={name || 'المستخدم'}
                  className="w-20 h-20 rounded-2xl object-cover ring-2 ring-teal-500 shadow-md"
                  onError={() => setPreviewAvatar('/icon.svg')}
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xl shadow-md">
                  {name ? name.slice(0, 1) : <UserIcon className="w-8 h-8" />}
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-2 -left-2 p-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-lg transition cursor-pointer"
                title="تغيير الصورة الشخصية"
              >
                {uploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-right">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                الصورة الشخصية للمستخدم
              </span>
              <p className="text-[11px] text-slate-500">
                يمكنك رفع صورة من جهازك، أو إدخال رابط مباشر، أو اختيار صورة رمزية.
              </p>

              <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 transition flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-teal-600" />
                  <span>رفع من الجهاز</span>
                </button>

                {PRESET_AVATARS.slice(0, 3).map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setAvatarUrl(p.url);
                      setPreviewAvatar(p.url);
                    }}
                    className={`text-[10px] px-2 py-1 rounded-lg border font-bold transition ${
                      avatarUrl === p.url
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-teal-600" />
              <span>اسم المستخدم الكامل *</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: الاستاذ علاءالدين ضي النور محمد خليفة"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500 font-bold"
            />
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-teal-600" />
              <span>البريد الإلكتروني</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Role Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-teal-600" />
              <span>الدور والصلاحيات في المنصة (RBAC)</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as RoleType)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500 font-bold"
            >
              <option value="admin">مالك المكتبة ومدير النظام (كامل الصلاحيات والإدارة)</option>
              <option value="teacher">معلم أول ومؤلف (إدارة المصادر، التحضير، والأنشطة)</option>
              <option value="viewer">مطلع وزائر (قراءة الكتب، البحث، والاستعراض فقط)</option>
            </select>
          </div>

          {/* Avatar URL direct input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              رابط الصورة المباشر (اختياري)
            </label>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => {
                setAvatarUrl(e.target.value);
                setPreviewAvatar(e.target.value);
              }}
              placeholder="/owner_avatar.jpg أو https://..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500 font-mono text-[11px]"
            />
          </div>

          {/* Buttons Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <div>
              {!isNewUser && user && user.id !== 'usr-admin-1' && (
                confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-rose-600 font-bold">تأكيد الحذف؟</span>
                    <button
                      type="button"
                      onClick={handleDeleteUser}
                      disabled={saving}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition"
                    >
                      نعم، حذف
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-2 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold"
                    >
                      تراجع
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    disabled={saving}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف المستخدم</span>
                  </button>
                )
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition"
              >
                إلغاء
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>{isNewUser ? 'إضافة المستخدم' : 'حفظ التعديلات'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
