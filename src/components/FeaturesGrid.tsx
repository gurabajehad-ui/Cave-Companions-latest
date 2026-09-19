import React, { useState } from 'react';
import { BookOpen, Compass, Book, Video, Users, Activity, Bell, X, Landmark } from 'lucide-react';
import { PrayerReminderCard } from './PrayerReminderCard';
import { useLanguage } from '../context/LanguageContext';

interface FeaturesGridProps {
  onNavigate: (tab: any) => void;
  onOpenQibla: () => void;
  onOpenTasbih: () => void;
  onShowToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, msg: string) => void;
  onOpenMosques?: () => void;
}

const FEATURE_ITEMS = [
  { id: 'quran', translationKey: 'features.quran', icon: BookOpen },
  { id: 'tasbih', translationKey: 'features.tasbih', icon: Activity },
  { id: 'hisnul_muslim', translationKey: 'features.hisnulMuslim', icon: Book },
  { id: 'qibla', translationKey: 'features.qibla', icon: Compass },
  { id: 'blog', translationKey: 'features.blog', icon: Video },
  { id: 'mosque', translationKey: 'features.mosque', icon: Landmark },
  { id: 'cave_circle', translationKey: 'features.caveCircle', icon: Users },
  { id: 'prayer_reminder', translationKey: 'features.prayerReminder', icon: Bell },
];

export const FeaturesGrid: React.FC<FeaturesGridProps> = React.memo(({ 
  onNavigate, 
  onOpenQibla, 
  onOpenTasbih, 
  onShowToast,
  onOpenMosques 
}) => {
  const { t } = useLanguage();
  const [showReminderModal, setShowReminderModal] = useState(false);

  const handleItemClick = (id: string) => {
    switch (id) {
      case 'quran':
        onNavigate('quran');
        break;
      case 'tasbih':
        onOpenTasbih();
        break;
      case 'hisnul_muslim':
        onNavigate('hisnul_muslim');
        break;
      case 'qibla':
        onOpenQibla();
        break;
      case 'blog':
        onNavigate('blog');
        break;
      case 'mosque':
        if (onOpenMosques) {
          onOpenMosques();
        }
        break;
      case 'prayer_reminder':
        setShowReminderModal(true);
        break;
      case 'cave_circle':
        onNavigate('cave_circle');
        break;
      default:
        break;
    }
  };

  return (
    <>
      <div 
        className="w-full rounded-[28px] border border-amber-500/30 bg-gradient-to-b from-[#04241b] to-[#021812] p-5 shadow-[0_0_15px_rgba(245,158,11,0.1)] text-white gpu-accelerated"
        style={{ contain: 'content', transform: 'translateZ(0)' }}
      >
        <h3 className="text-sm font-bold text-amber-200/90 mb-5 tracking-wide px-1">{t('features.title')}</h3>
        <div className="grid grid-cols-4 gap-y-6 gap-x-2">
          {FEATURE_ITEMS.map((item, idx) => (
            <button
              key={`feat-btn-${item.id}-${idx}`}
              onClick={() => handleItemClick(item.id)}
              className="flex flex-col items-center gap-2 cursor-pointer group outline-none active:scale-95 transition-transform"
            >
              <div className="w-[52px] h-[52px] sm:w-[60px] sm:h-[60px] rounded-full bg-[#06281e] flex items-center justify-center border border-amber-500/30 group-hover:bg-[#083628] group-hover:border-amber-400/60 transition-all shadow-[0_0_10px_rgba(245,158,11,0.05)] group-hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-100/90 group-hover:text-amber-300 transition-colors" strokeWidth={1.2} />
              </div>
              <span className="text-[11px] sm:text-xs font-medium text-emerald-100/80 group-hover:text-amber-200 text-center leading-tight">
                {t(item.translationKey)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {showReminderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowReminderModal(false)}
              className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <PrayerReminderCard onShowToast={onShowToast} />
          </div>
        </div>
      )}
    </>
  );
});
