import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Phone,
  Calendar,
  ShieldCheck,
  LogOut,
  Edit2,
  Award,
  Clock,
  MapPin,
  CheckCircle2,
  Activity,
  Sparkles,
  History,
  Store,
  X,
  Trash2,
  AlertTriangle,
  Lock,
  Key,
  Loader2,
  ShieldAlert,
  ChevronRight,
  Flame,
  Coins,
  Compass,
  BookOpen,
  Bike
} from 'lucide-react';
import { BANGLADESH_DISTRICTS, getDistrictUpazilaItems } from '../data/bangladeshGeo';
import { toBnNumber, formatBnDate } from '../data/prayerConfig';
import { FeaturesGrid } from './FeaturesGrid';
import { getStoredMerchantToken, getStoredRiderToken } from '../services/api';

interface ProfileViewProps {
  onLogout: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, msg: string) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenLegal?: (type: 'privacy' | 'terms' | 'about') => void;
  onOpenTasbih?: () => void;
  onOpenQibla?: () => void;
  onOpenMosques?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = React.memo(({
  onLogout,
  onShowToast,
  onNavigateTab,
  onOpenLegal,
  onOpenTasbih,
  onOpenQibla,
  onOpenMosques
}) => {
  const { user, userStats, updateProfile, deleteAccount } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const userDistrictName = React.useMemo(() => {
    if (!user?.district) return '';
    const found = BANGLADESH_DISTRICTS.find(d => d.district === user.district || d.districtBn === user.district);
    return language === 'bn' ? (found?.districtBn || user.district) : (found?.district || user.district);
  }, [user?.district, language]);

  // Qibla modal state

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.fullName || '');
  const [newDistrict, setNewDistrict] = useState(user?.district || '');
  const [newUpazila, setNewUpazila] = useState(user?.upazila || '');
  const [newAddress, setNewAddress] = useState(user?.address || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Delete account state
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);

  const handleDeleteAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteAccountError(null);
    setIsDeletingAccount(true);

    try {
      const res = await deleteAccount(deletePassword, deleteConfirmText);
      if (res.success) {
        onShowToast(
          'success', 
          language === 'bn' ? 'অ্যাকাউন্ট মুছে ফেলা হয়েছে' : 'Account Deleted', 
          res.message || (language === 'bn' ? 'আপনার অ্যাকাউন্টটি সফলভাবে মুছে ফেলা হয়েছে।' : 'Your account has been deleted successfully.')
        );
        setIsDeleteAccountOpen(false);
        onLogout();
      } else {
        setDeleteAccountError(res.message || (language === 'bn' ? 'অ্যাকাউন্ট মুছে ফেলতে সমস্যা হয়েছে।' : 'Failed to delete account.'));
      }
    } catch (err: any) {
      setDeleteAccountError(err.message || (language === 'bn' ? 'অ্যাকাউন্ট মুছে ফেলতে নেটওয়ার্ক বা সার্ভারে ত্রুটি দেখা দিয়েছে।' : 'A network or server error occurred while deleting account.'));
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setSavingProfile(true);
    try {
      const ok = await updateProfile({
        fullName: newName.trim(),
        district: newDistrict.trim() || undefined,
        upazila: newUpazila.trim() || undefined,
        address: newAddress.trim() || undefined
      });
      if (ok) {
        onShowToast(
          'success', 
          language === 'bn' ? 'সফল' : 'Success', 
          language === 'bn' ? 'প্রোফাইল তথ্য সফলভাবে পরিবর্তন করা হয়েছে।' : 'Profile updated successfully.'
        );
        setIsEditing(false);
      }
    } catch (err: any) {
      onShowToast(
        'error', 
        language === 'bn' ? 'ত্রুটি' : 'Error', 
        err.message || (language === 'bn' ? 'আপডেট করতে ব্যর্থ হয়েছে।' : 'Failed to update profile.')
      );
    } finally {
      setSavingProfile(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 space-y-4 pb-24 text-slate-100">
      
      {/* Top Profile Hero Card */}
      <div 
        style={{
          backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(16, 185, 129, 0.1) 0%, transparent 45%), radial-gradient(circle at 0% 100%, rgba(245, 158, 11, 0.05) 0%, transparent 45%), linear-gradient(135deg, #04241b 0%, #021c15 50%, #01140e 100%)',
          contain: 'content',
          transform: 'translateZ(0)'
        }}
        className="relative overflow-hidden rounded-3xl border border-emerald-700/60 p-5 sm:p-6 shadow-2xl shadow-emerald-950/50 text-white gpu-accelerated"
      >
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 relative z-10 text-center sm:text-left">
          {/* Avatar with Golden Ring */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl ring-2 ring-amber-400/70 border-2 border-[#021812] p-0.5 bg-gradient-to-tr from-emerald-700 to-amber-500 shadow-xl shadow-black/60">
              <div className="w-full h-full bg-[#021812] rounded-[14px] flex items-center justify-center text-3xl font-black text-amber-300 overflow-hidden">
                {user.photoUrl ? (
                  <img src={user.photoUrl} alt={user.fullName} className="w-full h-full object-cover rounded-[14px]" loading="lazy" decoding="async" />
                ) : (
                  user.fullName ? user.fullName.charAt(0) : 'U'
                )}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-[#021812] border-2 border-[#021812] shadow-xs" title={language === 'bn' ? 'সক্রিয় ও যাচাইকৃত' : 'Active & Verified'}>
              <ShieldCheck className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>

          {/* User Information */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight truncate">
                {user.fullName}
              </h2>
              <button
                onClick={() => {
                  setNewName(user.fullName);
                  setNewDistrict(user.district || '');
                  setNewUpazila(user.upazila || '');
                  setNewAddress(user.address || '');
                  setIsEditing(true);
                }}
                className="p-1.5 text-amber-300 hover:text-white bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-700/50 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                title={language === 'bn' ? 'প্রোফাইল সম্পাদন করুন' : 'Edit Profile'}
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Phone & ID Pills */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2 text-xs">
              <span className="flex items-center gap-1.5 bg-emerald-950/80 px-2.5 py-1 rounded-xl border border-emerald-800/60 text-emerald-200">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-medium">{user.phone}</span>
              </span>

              <span className="flex items-center gap-1 font-mono text-[11px] bg-emerald-950/80 px-2.5 py-1 rounded-xl border border-emerald-800/60 text-emerald-300/90">
                {language === 'bn' ? `আইডি: ${toBnNumber(user.id)}` : `ID: ${user.id}`}
              </span>
            </div>

            {/* Location Tag */}
            {(user.district || user.upazila || user.address) && (
              <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-2.5 text-xs text-amber-300/90 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800/40">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <div className="truncate font-medium">
                  {user.district && (
                    <span className="text-white font-semibold">
                      {userDistrictName}
                      {user.upazila ? `, ${user.upazila}` : ''}
                    </span>
                  )}
                  {user.address && <span className="text-[11px] text-emerald-300/80 ml-1.5 truncate">({user.address})</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Grid & Prayer Push Reminder */}
      <FeaturesGrid 
        onNavigate={onNavigateTab || (() => {})} 
        onOpenQibla={onOpenQibla || (() => {})}
        onOpenTasbih={onOpenTasbih || (() => {})}
        onShowToast={onShowToast}
        onOpenMosques={onOpenMosques}
      />

      {/* Language Switcher Card (Bilingual i18n Foundation) */}
      <div 
        style={{ contain: 'content', transform: 'translateZ(0)' }}
        className="rounded-3xl bg-gradient-to-br from-[#042017]/90 via-[#021812]/90 to-[#01140e]/90 border border-emerald-800/60 p-4 sm:p-5 shadow-xl space-y-3 gpu-accelerated"
      >
        <h3 className="text-xs font-bold text-emerald-300/90 uppercase tracking-wider px-1 flex items-center justify-between">
          <span>{t('profile.language')}</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-sans">ভাষা</span>
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => setLanguage('bn')}
            className={`py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              language === 'bn'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-900/40'
                : 'bg-[#031d16] text-emerald-300/80 border-emerald-800/60 hover:bg-[#052d22]'
            }`}
          >
            <span>বাংলা (Bangla)</span>
            {language === 'bn' && <span className="w-2 h-2 rounded-full bg-amber-400" />}
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-900/40'
                : 'bg-[#031d16] text-emerald-300/80 border-emerald-800/60 hover:bg-[#052d22]'
            }`}
          >
            <span>English</span>
            {language === 'en' && <span className="w-2 h-2 rounded-full bg-amber-400" />}
          </button>
        </div>
      </div>

      {/* Navigation & Shortcuts Bento */}
      <div 
        style={{ contain: 'content', transform: 'translateZ(0)' }}
        className="rounded-3xl bg-gradient-to-br from-[#042017]/90 via-[#021812]/90 to-[#01140e]/90 border border-emerald-800/60 p-4 sm:p-5 shadow-xl space-y-3 gpu-accelerated"
      >
        <h3 className="text-xs font-bold text-emerald-300/90 uppercase tracking-wider px-1">
          {language === 'bn' ? 'সেটিংস ও প্রয়োজনীয় মেন্যু' : 'Settings & Menus'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {onNavigateTab && (
            <>
              <button
                onClick={() => onNavigateTab('support')}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#031d16]/80 hover:bg-[#052d22]/90 border border-emerald-800/60 hover:border-emerald-600/70 transition-all text-left cursor-pointer group active:scale-[0.99] shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-teal-950/90 border border-teal-700/50 text-teal-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block group-hover:text-amber-300 transition-colors">
                      {language === 'bn' ? 'হেল্প ও সাপোর্ট' : 'Help & Support'}
                    </span>
                    <span className="text-[10.5px] text-emerald-300/70 truncate block">
                      {language === 'bn' ? 'প্রশ্নোত্তর ও সরাসরি সহায়তা' : 'FAQ & Direct Support'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-500 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>

              {/* Only show Merchant Portal if user has an existing merchant account or active merchant session */}
              {(user?.isMerchant || !!getStoredMerchantToken()) && (
                <button
                  onClick={() => onNavigateTab('merchant')}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#031d16]/80 hover:bg-[#052d22]/90 border border-emerald-800/60 hover:border-amber-600/60 transition-all text-left cursor-pointer group active:scale-[0.99] shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-700/50 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                      <Store className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5 group-hover:text-amber-300 transition-colors">
                        {language === 'bn' ? 'মার্চেন্ট পোর্টাল' : 'Merchant Portal'}
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-sans border border-amber-500/30">
                          {language === 'bn' ? 'মার্চেন্ট' : 'SHOP'}
                        </span>
                      </span>
                      <span className="text-[10.5px] text-emerald-300/70 truncate block">
                        {language === 'bn' ? 'টোকেন রিডেম্পশন ও কেনাবেচা' : 'Token Redemption & Sales'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-500 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              )}

              {/* Only show Rider Portal if user has an existing rider account or active rider session */}
              {(user?.isRider || !!getStoredRiderToken()) && (
                <button
                  onClick={() => onNavigateTab('rider')}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#031d16]/80 hover:bg-[#052d22]/90 border border-emerald-800/60 hover:border-cyan-600/60 transition-all text-left cursor-pointer group active:scale-[0.99] shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-700/50 text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                      <Bike className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5 group-hover:text-cyan-300 transition-colors">
                        {language === 'bn' ? 'ডেলিভারি রাইডার পোর্টাল' : 'Delivery Rider Portal'}
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-sans border border-cyan-500/30">
                          {language === 'bn' ? 'রাইডার' : 'RIDER'}
                        </span>
                      </span>
                      <span className="text-[10.5px] text-emerald-300/70 truncate block">
                        {language === 'bn' ? 'অর্ডার গ্রহণ ও ডেলিভারি পরিচালনা' : 'Accept Orders & Deliveries'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-500 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              )}

              <button
                onClick={() => onNavigateTab('admin')}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#031d16]/80 hover:bg-[#052d22]/90 border border-emerald-800/60 hover:border-rose-600/60 transition-all text-left cursor-pointer group active:scale-[0.99] shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-700/50 text-rose-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5 group-hover:text-rose-300 transition-colors">
                      {language === 'bn' ? 'এডমিন ড্যাশবোর্ড' : 'Admin Dashboard'}
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-sans border border-rose-500/30">
                        {language === 'bn' ? 'এডমিন' : 'ADMIN'}
                      </span>
                    </span>
                    <span className="text-[10.5px] text-emerald-300/70 truncate block">
                      {language === 'bn' ? 'শপ ও মসজিদ পরিচালনা' : 'Shop & Mosque Management'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-500 group-hover:text-rose-300 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            </>
          )}
        </div>

        {/* Legal links */}
        {onOpenLegal && (
          <div className="pt-2 border-t border-emerald-800/40 flex flex-wrap items-center justify-center gap-4 text-xs text-emerald-300/80 font-medium">
            <button
              onClick={() => onOpenLegal('privacy')}
              className="hover:text-amber-300 transition-colors cursor-pointer"
            >
              {language === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}
            </button>
            <span>•</span>
            <button
              onClick={() => onOpenLegal('terms')}
              className="hover:text-amber-300 transition-colors cursor-pointer"
            >
              {language === 'bn' ? 'শর্তাবলী' : 'Terms & Conditions'}
            </button>
            <span>•</span>
            <button
              onClick={() => onOpenLegal('about')}
              className="hover:text-amber-300 transition-colors cursor-pointer"
            >
              {language === 'bn' ? 'অ্যাপ সম্পর্কে' : 'About App'}
            </button>
          </div>
        )}
      </div>

      {/* Logout & Ultra-Compact Delete Account Action */}
      <div className="space-y-3 pt-1">
        {/* Primary Logout Button */}
        <button
          onClick={onLogout}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-950/60 via-red-950/70 to-rose-950/60 hover:from-rose-900/80 hover:to-red-900/80 border border-rose-800/60 text-rose-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-950/30 active:scale-[0.99]"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>{language === 'bn' ? 'লগআউট করুন' : 'Log Out'}</span>
        </button>

        {/* Minimal Compact Delete Account Button */}
        <div className="flex justify-center">
          <button
            onClick={() => {
              setDeletePassword('');
              setDeleteConfirmText('');
              setDeleteAccountError(null);
              setIsDeleteAccountOpen(true);
            }}
            className="text-[11px] text-rose-400/80 hover:text-rose-300 flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3 text-rose-400/70" />
            <span>{language === 'bn' ? 'অ্যাকাউন্ট স্থায়ীভাবে মুছুন' : 'Delete Account Permanently'}</span>
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gradient-to-br from-[#04241b] via-[#021c15] to-[#01140e] border border-emerald-700/70 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-emerald-800/50 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-amber-400" />
                  <span>{language === 'bn' ? 'প্রোফাইল সম্পাদন' : 'Edit Profile'}</span>
                </h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1 text-emerald-300/80 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1.5">
                    {language === 'bn' ? 'আপনার নাম' : 'Your Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-emerald-200 mb-1.5">
                      {language === 'bn' ? 'জেলা' : 'District'}
                    </label>
                    <select
                      value={newDistrict}
                      onChange={e => {
                        setNewDistrict(e.target.value);
                        setNewUpazila('');
                      }}
                      className="w-full px-3 py-2.5 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    >
                      <option value="">{language === 'bn' ? 'জেলা নির্বাচন করুন' : 'Select District'}</option>
                      {BANGLADESH_DISTRICTS.map((d, idx) => (
                        <option key={`${d.district}-${idx}`} value={d.district}>
                          {language === 'bn' ? d.districtBn : d.district}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-emerald-200 mb-1.5">
                      {language === 'bn' ? 'উপজেলা' : 'Upazila'}
                    </label>
                    <select
                      disabled={!newDistrict}
                      value={newUpazila}
                      onChange={e => setNewUpazila(e.target.value)}
                      className="w-full px-3 py-2.5 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!newDistrict 
                          ? (language === 'bn' ? 'প্রথমে জেলা' : 'Select District First') 
                          : (language === 'bn' ? 'উপজেলা নির্বাচন' : 'Select Upazila')}
                      </option>
                      {newDistrict && getDistrictUpazilaItems(newDistrict).map((u, idx) => (
                        <option key={`${u.nameEn}-${idx}`} value={language === 'bn' ? u.nameBn : u.nameEn}>
                          {language === 'bn' ? u.label : `${u.nameEn} (${u.nameBn})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1.5">
                    {language === 'bn' ? 'পূর্ণ ঠিকানা' : 'Full Address'}
                  </label>
                  <textarea
                    rows={2}
                    value={newAddress}
                    onChange={e => setNewAddress(e.target.value)}
                    placeholder={language === 'bn' ? 'গ্রাম/মহল্লা, রোড, বাড়ি বা বিস্তারিত ঠিকানা' : 'Village/Area, Road, House or Detailed Address'}
                    className="w-full px-3.5 py-2 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-200 text-xs font-semibold cursor-pointer"
                  >
                    {language === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {savingProfile ? (language === 'bn' ? 'সংরক্ষণ...' : 'Saving...') : (language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Changes')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {isDeleteAccountOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gradient-to-br from-[#1a0808] via-[#120505] to-[#0a0303] border border-rose-800/80 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-slate-100 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Title */}
              <div className="flex items-start justify-between border-b border-rose-900/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-950 border border-rose-800 text-rose-400">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {language === 'bn' ? 'অ্যাকাউন্ট মুছে ফেলা' : 'Delete Account'}
                    </h3>
                    <p className="text-[11px] text-rose-300/90">
                      {language === 'bn' ? 'এই প্রক্রিয়াটি চূড়ান্ত ও অপরিবর্তনীয়' : 'This action is final and irreversible'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDeleteAccountOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Data Loss Info Box */}
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-900/60 space-y-1.5 text-rose-200">
                  <span className="font-bold block text-rose-300">
                    {language === 'bn' ? '⚠️ যা স্থায়ীভাবে মুছে যাবে:' : '⚠️ Data that will be permanently lost:'}
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-200/90 leading-relaxed">
                    <li>{language === 'bn' ? 'ব্যক্তিগত প্রোফাইল তথ্য (নাম, ফোন, ঠিকানা)' : 'Personal profile information (name, phone, address)'}</li>
                    <li>{language === 'bn' ? 'দৈনিক সালাত হাজিরা ও আত্মিক জার্নি রেকর্ড' : 'Daily prayer records and spiritual journey logs'}</li>
                    <li>{language === 'bn' ? 'অর্জিত রিডেম্পশন টোকেন ও শপিং কার্ট' : 'Earned redemption tokens and cart items'}</li>
                  </ul>
                </div>
              </div>

              {/* Error Banner */}
              {deleteAccountError && (
                <div className="p-2.5 rounded-xl bg-rose-950/90 border border-rose-700 text-rose-200 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{deleteAccountError}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleDeleteAccountSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{language === 'bn' ? 'পাসওয়ার্ড দিন:' : 'Enter Password:'}</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder={language === 'bn' ? 'আপনার পাসওয়ার্ড লিখুন' : 'Enter your password'}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-rose-900/60 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {language === 'bn' ? (
                      <>নিশ্চিত করতে <span className="text-rose-400 font-mono">DELETE</span> অথবা <span className="text-rose-400 font-mono">মুছে ফেলুন</span> টাইপ করুন:</>
                    ) : (
                      <>Type <span className="text-rose-400 font-mono">DELETE</span> to confirm:</>
                    )}
                  </label>
                  <input
                    type="text"
                    required
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-rose-900/60 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsDeleteAccountOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {language === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isDeletingAccount}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {isDeletingAccount ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{language === 'bn' ? 'ডিলিট হচ্ছে...' : 'Deleting...'}</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>{language === 'bn' ? 'হ্যাঁ, মুছুন' : 'Yes, Delete'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Qibla Finder Modal */}
    </div>
  );
});

