import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { User, RoleType } from '../../types/index.ts';
import {
  Users, UserCheck, Shield, Key, Plus, Search,
  CheckCircle2, Mail, Calendar, Edit3, Trash2,
  RefreshCw, Sparkles, UserPlus, Info, Check
} from 'lucide-react';
import { EditUserModal } from './EditUserModal.tsx';

export const UsersManagementView: React.FC = () => {
  const {
    currentUser,
    users,
    refreshUsers,
    switchUser,
    openEditUserModal,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'all' | RoleType>('all');
  const [loading, setLoading] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    refreshUsers();
  }, []);

  const handleEditUser = (user: User) => {
    setUserToEdit(user);
    setIsNewUser(false);
    setModalOpen(true);
  };

  const handleCreateUser = () => {
    setUserToEdit(null);
    setIsNewUser(true);
    setModalOpen(true);
  };

  // Find owner
  const ownerUser = users.find(u => u.id === 'usr-admin-1') || users.find(u => u.role === 'admin') || users[0];

  // Filtered users
  const filteredUsers = users.filter(u => {
    if (selectedRoleFilter !== 'all' && u.role !== selectedRoleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = (u.email || '').toLowerCase().includes(q);
      return matchName || matchEmail;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-teal-950 via-slate-900 to-teal-900 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-3 border border-teal-400/20">
              <Users className="w-3.5 h-3.5" />
              <span>إدارة الحسابات والصلاحيات (RBAC) • المكتبة الرقمية العمانية</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
              إدارة وتعديل المستخدمين والأسماء
            </h1>
            <p className="mt-2 text-xs md:text-sm text-teal-100/90 leading-relaxed">
              يمكنك هنا تعديل أسماء المستخدمين، تغيير الصور الشخصية، تحديث الأدوار والصلاحيات (مالك، معلم ومؤلف، مطلع)، وإضافة مستخدمين جدد للمنصة التعليمية.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleCreateUser}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition shadow-lg cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ إضافة مستخدم جديد</span>
            </button>
            <button
              onClick={() => refreshUsers()}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition border border-white/20 cursor-pointer"
              title="تحديث قائمة المستخدمين"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Guide Box */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
          <p className="font-extrabold">💡 كيفية تعديل أسماء وبيانات المستخدمين:</p>
          <p className="leading-relaxed opacity-90">
            لتعديل اسم أي مستخدم أو صورته أو دوره، اضغط على زر <strong>"✏️ تعديل الاسم والبيانات"</strong> الظاهر على بطاقته أدناه. يمكنك إدخال الاسم الجديد، رفع صورة من جهازك أو اختيار صورة رمزية، ثم الضغط على <strong>"حفظ التعديلات"</strong> وسيتم تحديث الاسم فوراً في كامل النظام.
          </p>
        </div>
      </div>

      {/* Owner Profile VIP Section */}
      {ownerUser && (
        <div className="rounded-3xl bg-gradient-to-r from-amber-50 via-teal-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/80 border-2 border-amber-300 dark:border-amber-500/40 p-6 shadow-md">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-right">
              <div className="relative shrink-0">
                <img
                  src={ownerUser.avatarUrl || '/owner_avatar.jpg'}
                  alt={ownerUser.name}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-3xl object-cover ring-4 ring-amber-400 shadow-xl"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] shadow-sm">
                  المالك الرئيسي
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <span className="text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-100 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-full">
                    مالك ومؤسس المكتبة الرقمية
                  </span>
                  {currentUser.id === ownerUser.id && (
                    <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                      الحساب الحالي النشط
                    </span>
                  )}
                </div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                  {ownerUser.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {ownerUser.email || 'arzag111@gmail.com'} • صلاحيات كاملة لإدارة المناهج والملفات
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => handleEditUser(ownerUser)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>✏️ تعديل اسم وصورة المالك</span>
              </button>
              {currentUser.id !== ownerUser.id && (
                <button
                  onClick={() => switchUser(ownerUser.id)}
                  className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-500 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
                >
                  التبديل لحساب المالك
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="بحث بالاسم أو البريد..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Roles Filter */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: `جميع المستخدمين (${users.length})` },
            { id: 'admin', label: `مالك المنصة (${users.filter(u => u.role === 'admin').length})` },
            { id: 'teacher', label: `معلم ومؤلف (${users.filter(u => u.role === 'teacher').length})` },
            { id: 'viewer', label: `مطلع وزائر (${users.filter(u => u.role === 'viewer').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedRoleFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedRoleFilter === tab.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((u) => {
          const isCurrent = currentUser.id === u.id;
          const isOwner = u.id === 'usr-admin-1' || u.role === 'admin';

          return (
            <div
              key={u.id}
              className={`rounded-2xl p-5 border transition flex flex-col justify-between shadow-xs hover:shadow-md bg-white dark:bg-slate-900 ${
                isCurrent
                  ? 'border-teal-500 ring-2 ring-teal-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="space-y-4">
                {/* User Top Row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      {u.avatarUrl ? (
                        <img
                          src={u.avatarUrl}
                          alt={u.name}
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-teal-500/30 shadow-xs"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-black flex items-center justify-center text-base">
                          {u.name.slice(0, 1)}
                        </div>
                      )}
                      {isCurrent && (
                        <span className="w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900 absolute -bottom-0.5 -right-0.5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-sm truncate">
                          {u.name}
                        </h3>
                        {isCurrent && (
                          <span className="px-1.5 py-0.2 rounded-md bg-teal-600 text-white text-[9px] font-black shrink-0">
                            الحالي
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {u.email || 'لا يوجد بريد مسجل'}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold shrink-0 ${
                    u.role === 'admin'
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      : u.role === 'teacher'
                      ? 'bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {u.role === 'admin' ? 'مالك المكتبة' : u.role === 'teacher' ? 'معلم ومؤلف' : 'مطلع وزائر'}
                  </span>
                </div>

                {/* Permissions summary */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <Shield className="w-3.5 h-3.5 text-teal-600" />
                    <span>الصلاحيات المتاحة:</span>
                  </div>
                  <p className="text-[10px]">
                    {u.role === 'admin'
                      ? '✓ إدارة كاملة للمكتبة، رفع وحذف المناهج، تعديل المستخدمين، استرجاع النسخ الاحتياطية'
                      : u.role === 'teacher'
                      ? '✓ استعراض المناهج، توليد الدروس وأوراق العمل، إضافة مراجع خارجية، وتنزيل الكتب'
                      : '✓ تصفح المناهج والبحث فقط بدون صلاحيات تعديل'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleEditUser(u)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-teal-50 dark:bg-slate-800 dark:hover:bg-teal-950/60 text-slate-700 hover:text-teal-700 dark:text-slate-300 dark:hover:text-teal-300 text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 hover:border-teal-400 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>✏️ تعديل الاسم والبيانات</span>
                </button>

                {!isCurrent ? (
                  <button
                    type="button"
                    onClick={() => switchUser(u.id)}
                    className="py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    title="التبديل لاستخدام هذا الحساب"
                  >
                    تبديل
                  </button>
                ) : (
                  <div className="py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-black flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>نشط</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Global User Edit/Create Modal */}
      <EditUserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        user={userToEdit}
        isNewUser={isNewUser}
        onSuccess={() => {
          refreshUsers();
        }}
      />
    </div>
  );
};
