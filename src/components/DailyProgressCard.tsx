import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Calendar, ChevronRight, BarChart3, AlertCircle, Check, Award, Coins } from 'lucide-react';
import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes, Madhab } from 'adhan';
import { getSavedOrGpsLocation, getFastInitialLocation, getDhakaDateClient, isFridayClient } from '../services/prayerTimeService';
import { toBnNumber, formatBnDate, getHijriDate, parseAppDate } from '../data/prayerConfig';
import { api } from '../services/api';
import { JourneyTeaser, TodayPrayerStatus, PrayerType, UserToken } from '../types';
import { offlineSyncService } from '../services/offlineSyncService';
import { useLanguage } from '../context/LanguageContext';

interface DailyProgressCardProps {
  todayStatus?: TodayPrayerStatus | null;
  completedCount: number;
  totalPrayers?: number;
  dateStr: string;
  userDistrict?: string;
  userGender?: string;
  onOpenJourney?: () => void;
  onOpenTokens?: () => void;
}

interface HeroCountdownProps {
  coords: { lat: number; lng: number } | null;
}

const SemiCirclePrayerHero: React.FC<HeroCountdownProps> = React.memo(({ coords }) => {
  const { t, language } = useLanguage();
  const timeRef = useRef<HTMLSpanElement>(null);
  const prayerNameRef = useRef<HTMLHeadingElement>(null);
  const statusLabelRef = useRef<HTMLSpanElement>(null);
  const progressArcRef = useRef<SVGPathElement>(null);
  const forbiddenBadgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!coords) return;

    // Arc length for semi-circle with r = 70: Math.PI * 70 ≈ 219.91
    const ARC_LENGTH = 219.91;

    let cachedDateStr = '';
    let ptCache: any = null;
    let ptTomorrowCache: any = null;

    const updateDOM = () => {
      const nowUtc = new Date();
      const dhakaDate = getDhakaDateClient(nowUtc);
      const dateKey = `${dhakaDate.getFullYear()}-${dhakaDate.getMonth()}-${dhakaDate.getDate()}_${coords.lat}_${coords.lng}`;

      if (dateKey !== cachedDateStr || !ptCache) {
        cachedDateStr = dateKey;
        const coordinates = new Coordinates(coords.lat, coords.lng);
        const params = CalculationMethod.Karachi();
        params.madhab = Madhab.Hanafi;
        ptCache = new AdhanPrayerTimes(coordinates, dhakaDate, params);
        const tomorrow = new Date(dhakaDate.getTime() + 24 * 60 * 60 * 1000);
        ptTomorrowCache = new AdhanPrayerTimes(coordinates, tomorrow, params);
      }

      const pt = ptCache;
      const ptTomorrow = ptTomorrowCache;
      const isFriday = isFridayClient(nowUtc);

      let nextName = '';
      let startTime = new Date();
      let targetTime = new Date();
      let isEnding = true;

      if (nowUtc < pt.fajr) {
        nextName = language === 'bn' ? 'ফজর' : 'Fajr';
        startTime = new Date(pt.fajr.getTime() - 8 * 60 * 60 * 1000);
        targetTime = pt.fajr;
        isEnding = false;
      } else if (nowUtc >= pt.fajr && nowUtc < pt.sunrise) {
        nextName = language === 'bn' ? 'ফজর' : 'Fajr';
        startTime = pt.fajr;
        targetTime = pt.sunrise;
        isEnding = true;
      } else if (nowUtc >= pt.sunrise && nowUtc < pt.dhuhr) {
        nextName = language === 'bn' ? (isFriday ? 'জুম\'আ' : 'যোহর') : (isFriday ? 'Jumu\'ah' : 'Dhuhr');
        startTime = pt.sunrise;
        targetTime = pt.dhuhr;
        isEnding = false;
      } else if (nowUtc >= pt.dhuhr && nowUtc < pt.asr) {
        nextName = language === 'bn' ? (isFriday ? 'জুম\'আ' : 'যোহর') : (isFriday ? 'Jumu\'ah' : 'Dhuhr');
        startTime = pt.dhuhr;
        targetTime = pt.asr;
        isEnding = true;
      } else if (nowUtc >= pt.asr && nowUtc < pt.maghrib) {
        nextName = language === 'bn' ? 'আসর' : 'Asr';
        startTime = pt.asr;
        targetTime = pt.maghrib;
        isEnding = true;
      } else if (nowUtc >= pt.maghrib && nowUtc < pt.isha) {
        nextName = language === 'bn' ? 'মাগরিব' : 'Maghrib';
        startTime = pt.maghrib;
        targetTime = pt.isha;
        isEnding = true;
      } else {
        nextName = language === 'bn' ? 'এশা' : 'Isha';
        startTime = pt.isha;
        targetTime = ptTomorrow.fajr;
        isEnding = true;
      }

      const isSunriseForbidden = nowUtc >= pt.sunrise && nowUtc < new Date(pt.sunrise.getTime() + 15 * 60 * 1000);
      const isMiddayForbidden = nowUtc >= new Date(pt.dhuhr.getTime() - 7 * 60 * 1000) && nowUtc < pt.dhuhr;
      const isSunsetForbidden = nowUtc >= new Date(pt.maghrib.getTime() - 15 * 60 * 1000) && nowUtc < pt.maghrib;
      const isForbidden = isSunriseForbidden || isMiddayForbidden || isSunsetForbidden;

      const totalDuration = Math.max(1, targetTime.getTime() - startTime.getTime());
      const elapsed = Math.max(0, Math.min(totalDuration, nowUtc.getTime() - startTime.getTime()));
      const progressFraction = isEnding ? Math.max(0, Math.min(1, 1 - elapsed / totalDuration)) : Math.max(0, Math.min(1, elapsed / totalDuration));

      const diffMs = Math.max(0, targetTime.getTime() - nowUtc.getTime());
      const diffSecondsTotal = Math.floor(diffMs / 1000);

      const hours = Math.floor(diffSecondsTotal / 3600);
      const minutes = Math.floor((diffSecondsTotal % 3600) / 60);
      const seconds = diffSecondsTotal % 60;

      const hStr = String(hours).padStart(2, '0');
      const mStr = String(minutes).padStart(2, '0');
      const sStr = String(seconds).padStart(2, '0');

      const formatted = language === 'bn'
        ? `${toBnNumber(hStr)}:${toBnNumber(mStr)}:${toBnNumber(sStr)}`
        : `${hStr}:${mStr}:${sStr}`;

      if (timeRef.current) {
        timeRef.current.textContent = formatted;
      }

      if (prayerNameRef.current) {
        prayerNameRef.current.textContent = nextName;
      }

      if (statusLabelRef.current) {
        statusLabelRef.current.textContent = isEnding ? t('prayer.timeRemaining') : t('prayer.startsIn');
      }

      if (progressArcRef.current) {
        const offset = ARC_LENGTH * (1 - progressFraction);
        progressArcRef.current.style.strokeDashoffset = `${offset}`;
      }

      if (forbiddenBadgeRef.current) {
        forbiddenBadgeRef.current.style.display = isForbidden ? 'inline-flex' : 'none';
      }
    };

    updateDOM();
    const timer = setInterval(updateDOM, 1000);
    return () => clearInterval(timer);
  }, [coords, language, t]);

  return (
    <div className="relative flex flex-col items-center justify-center shrink-0 w-44 sm:w-52">
      {/* Semi-Circular SVG Arc matching screenshot */}
      <div className="relative w-44 sm:w-52 h-26 sm:h-30 flex items-center justify-center overflow-hidden [transform:translateZ(0)] will-change-transform">
        <svg
          viewBox="0 0 170 95"
          className="absolute top-0 w-full h-full pointer-events-none"
        >
          <defs>
            <linearGradient id="screenshotArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>

          {/* Background Dark Track Arc */}
          <path
            d="M 15 88 A 70 70 0 0 1 155 88"
            fill="none"
            stroke="rgba(30, 41, 59, 0.9)"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Active Highlight Arc */}
          <path
            ref={progressArcRef}
            d="M 15 88 A 70 70 0 0 1 155 88"
            fill="none"
            stroke="url(#screenshotArcGrad)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="219.91"
            strokeDashoffset="70"
          />
        </svg>

        {/* Center content inside the Arc */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center mt-3 space-y-0.5">
          <h3
            ref={prayerNameRef}
            className="text-lg sm:text-xl font-bold text-white tracking-tight leading-tight"
          >
            {language === 'bn' ? "জুম'আ" : "Jumu'ah"}
          </h3>

          <span
            ref={statusLabelRef}
            className="text-[10px] text-emerald-200/80 font-medium leading-none"
          >
            {t('prayer.timeRemaining')}
          </span>

          <span
            ref={timeRef}
            className="text-base sm:text-lg font-black font-mono tracking-wider text-amber-300 pt-0.5 leading-none"
          >
            {language === 'bn' ? '০১:৫১:১৫' : '01:51:15'}
          </span>

          <div
            ref={forbiddenBadgeRef}
            style={{ display: 'none' }}
            className="items-center gap-1 text-[9px] font-bold text-rose-300 bg-rose-950/90 border border-rose-600/40 px-1.5 py-0.2 rounded-full mt-0.5"
          >
            <AlertCircle className="w-2.5 h-2.5" />
            {t('prayer.forbidden')}
          </div>
        </div>
      </div>
    </div>
  );
});

export const DailyProgressCard: React.FC<DailyProgressCardProps> = React.memo(({
  todayStatus,
  completedCount,
  totalPrayers = 5,
  dateStr,
  userDistrict,
  userGender,
  onOpenJourney,
  onOpenTokens
}) => {
  const { t, language } = useLanguage();
  const hijri = getHijriDate(dateStr);
  const isFemale = (userGender || '').toLowerCase() === 'female';

  const [teaser, setTeaser] = useState<JourneyTeaser | null>(null);
  const [todayToken, setTodayToken] = useState<UserToken | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(() => {
    const init = getFastInitialLocation(userDistrict);
    return { lat: init.latitude, lng: init.longitude };
  });
  const [offlinePendingState, setOfflinePendingState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const checkOffline = () => {
      const types: PrayerType[] = ['fajr', 'dhuhr', 'jumuah', 'asr', 'maghrib', 'isha'];
      const map: Record<string, boolean> = {};
      types.forEach(t => {
        map[t] = Boolean(offlineSyncService.isPrayerPendingInOfflineQueue(t));
      });
      setOfflinePendingState(map);
    };

    checkOffline();
    window.addEventListener('cave_offline_queue_updated', checkOffline);
    return () => {
      window.removeEventListener('cave_offline_queue_updated', checkOffline);
    };
  }, []);

  const isFriday = useMemo(() => {
    if (typeof todayStatus?.isFriday === 'boolean') {
      return todayStatus.isFriday;
    }
    return isFridayClient(new Date());
  }, [todayStatus?.isFriday]);

  const prayerSteps = useMemo(() => {
    const dhuhrOrJumuahKey: PrayerType = isFriday ? 'jumuah' : 'dhuhr';
    const dhuhrOrJumuahLabel = isFriday
      ? (language === 'bn' ? 'জুম\'আ' : 'Jumu\'ah')
      : (language === 'bn' ? 'যোহর' : 'Dhuhr');

    const checkDone = (type: PrayerType) => {
      if (todayStatus?.prayers && (todayStatus.prayers as any)[type]) {
        return Boolean((todayStatus.prayers as any)[type]?.completed);
      }
      if (todayStatus?.attendances && Array.isArray(todayStatus.attendances)) {
        return todayStatus.attendances.some((a: any) => {
          if (type === 'jumuah' || type === 'dhuhr') {
            return a.prayerType === 'jumuah' || a.prayerType === 'dhuhr';
          }
          return a.prayerType === type;
        });
      }
      return false;
    };

    return [
      { key: 'fajr' as PrayerType, label: language === 'bn' ? 'ফজর' : 'Fajr', isDone: checkDone('fajr') || Boolean(offlinePendingState['fajr']) },
      { key: dhuhrOrJumuahKey, label: dhuhrOrJumuahLabel, isDone: checkDone('jumuah') || checkDone('dhuhr') || Boolean(offlinePendingState['jumuah']) || Boolean(offlinePendingState['dhuhr']) },
      { key: 'asr' as PrayerType, label: language === 'bn' ? 'আসর' : 'Asr', isDone: checkDone('asr') || Boolean(offlinePendingState['asr']) },
      { key: 'maghrib' as PrayerType, label: language === 'bn' ? 'মাগরিব' : 'Maghrib', isDone: checkDone('maghrib') || Boolean(offlinePendingState['maghrib']) },
      { key: 'isha' as PrayerType, label: language === 'bn' ? 'এশা' : 'Isha', isDone: checkDone('isha') || Boolean(offlinePendingState['isha']) },
    ];
  }, [isFriday, todayStatus?.prayers, offlinePendingState, language]);

  useEffect(() => {
    let isMounted = true;
    const token = typeof window !== 'undefined' ? localStorage.getItem('cave_companions_auth_token') : null;
    if (!token) return;

    api.getJourneySummary().then(res => {
      if (isMounted && res?.teaser) {
        setTeaser(res.teaser);
      }
    }).catch(err => {
      console.warn('Failed to load journey teaser:', err);
    });

    api.getMyTokens().then(res => {
      if (isMounted && res?.success) {
        const todayStr = dateStr || new Date().toISOString().split('T')[0];
        const allTokens = [...(res.availableTokens || []), ...(res.usedTokens || [])];
        const match = allTokens.find(t => t.earnedDate === todayStr);
        if (match) {
          setTodayToken(match);
        }
      }
    }).catch(err => {
      console.warn('Failed to load tokens:', err);
    });

    return () => {
      isMounted = false;
    };
  }, [completedCount, dateStr]);

  useEffect(() => {
    let isMounted = true;
    getSavedOrGpsLocation(userDistrict).then(loc => {
      if (isMounted) {
        setCoords(prev => {
          if (prev && Math.abs(prev.lat - loc.latitude) < 0.0001 && Math.abs(prev.lng - loc.longitude) < 0.0001) {
            return prev;
          }
          return { lat: loc.latitude, lng: loc.longitude };
        });
      }
    }).catch(() => {
      if (isMounted) {
        setCoords(prev => prev || { lat: 23.8103, lng: 90.4125 });
      }
    });
    return () => { isMounted = false; };
  }, [userDistrict]);

  // Token Tier details & Motivational Messaging
  const tokenTierInfo = useMemo(() => {
    const effectiveCount = completedCount;
    const tokenType = todayToken?.tokenType;

    if (tokenType === 'GOLD' || effectiveCount >= 5) {
      return {
        type: 'GOLD',
        tokenName: language === 'bn' ? 'গোল্ড টোকেন' : 'Gold Token',
        prefix: language === 'bn' ? 'আজ অর্জিত:' : 'Earned Today:',
        emoji: '🥇',
        badgeColor: 'bg-gradient-to-r from-amber-500/20 via-amber-400/20 to-amber-600/20 border-amber-400/50 text-amber-200',
        textColor: 'text-amber-300',
        pillBg: 'bg-amber-400/25 text-amber-300 border-amber-400/40',
        headline: language === 'bn' ? 'আজ অর্জিত' : 'Earned Today',
        subtext: language === 'bn' ? 'মাশাআল্লাহ! ৫ ওয়াক্ত সালাত সম্পন্ন করে সর্বোচ্চ গোল্ড টোকেন অর্জন করেছেন' : 'MashaAllah! Completed 5 prayers and earned the highest Gold Token'
      };
    }
    if (tokenType === 'SILVER' || effectiveCount === 4) {
      return {
        type: 'SILVER',
        tokenName: language === 'bn' ? 'সিলভার টোকেন' : 'Silver Token',
        prefix: language === 'bn' ? 'আজ অর্জিত:' : 'Earned Today:',
        emoji: '🥈',
        badgeColor: 'bg-gradient-to-r from-slate-400/20 via-slate-300/20 to-slate-500/20 border-slate-300/50 text-slate-100',
        textColor: 'text-slate-100',
        pillBg: 'bg-slate-300/25 text-slate-100 border-slate-300/40',
        headline: language === 'bn' ? 'আজ অর্জিত' : 'Earned Today',
        subtext: language === 'bn' ? 'আলহামদুলিল্লাহ! আর ১ ওয়াক্ত সালাত পড়লেই গোল্ড টোকেন অর্জন করবেন' : 'Alhamdulillah! Just 1 more prayer to unlock Gold Token'
      };
    }
    if (tokenType === 'BRONZE' || effectiveCount === 3) {
      return {
        type: 'BRONZE',
        tokenName: language === 'bn' ? 'ব্রোঞ্জ টোকেন' : 'Bronze Token',
        prefix: language === 'bn' ? 'আজ অর্জিত:' : 'Earned Today:',
        emoji: '🥉',
        badgeColor: 'bg-gradient-to-r from-amber-800/20 via-amber-700/20 to-amber-900/20 border-amber-600/50 text-amber-200',
        textColor: 'text-amber-400',
        pillBg: 'bg-amber-700/30 text-amber-200 border-amber-600/40',
        headline: language === 'bn' ? 'আজ অর্জিত' : 'Earned Today',
        subtext: language === 'bn' ? 'আলহামদুলিল্লাহ! পরবর্তী ওয়াক্ত সালাত আদায় করে সিলভার টোকেনের দিকে এগিয়ে যান' : 'Alhamdulillah! Complete next prayer to advance towards Silver Token'
      };
    }
    return {
      type: 'NONE',
      tokenName: language === 'bn' ? 'কোনো টোকেন নেই' : 'No Token',
      prefix: language === 'bn' ? 'আজ আপনার অর্জিত' : 'Today\'s Earnings',
      emoji: '🪙',
      badgeColor: 'bg-slate-900/80 border-slate-700/80 text-slate-300',
      textColor: 'text-amber-400',
      pillBg: 'bg-slate-800 text-slate-300 border-slate-700',
      headline: language === 'bn' ? 'আজ আপনার অর্জিত' : 'Today\'s Earnings',
      subtext: completedCount === 0 
        ? (language === 'bn' ? 'সালাত আদায় শুরু করুন এবং ৩ ওয়াক্ত পড়লেই পেয়ে যান ব্রোঞ্জ টোকেন!' : 'Start praying and complete 3 prayers to unlock Bronze Token!')
        : (language === 'bn' ? `আর মাত্র ${toBnNumber(3 - completedCount)} ওয়াক্ত সালাত সম্পন্ন করলেই আজ ব্রোঞ্জ টোকেন আনলক হবে!` : `Only ${3 - completedCount} more prayer(s) to unlock today's Bronze Token!`)
    };
  }, [todayToken, completedCount, language]);

  const gregorianDateText = useMemo(() => {
    if (language === 'bn') return formatBnDate(dateStr);
    try {
      const d = parseAppDate(dateStr);
      return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  }, [dateStr, language]);

  return (
    <div 
      style={{ contain: 'layout style', transform: 'translateZ(0)' }}
      className="relative rounded-3xl border border-[#0c4334] bg-[#022119] p-5 shadow-lg text-white space-y-5"
    >
      {/* Top Row: Compact 2-Line Date Section (Golden Hijri Date + Light-White Gregorian Date) */}
      <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#0a4838]">
        <div className="w-8 h-8 rounded-xl bg-[#033024] border border-[#0a4838] flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
          <Calendar className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex flex-col min-w-0 justify-center">
          {/* Line 1: Golden Hijri Date */}
          <h2 className="text-xs sm:text-[13px] font-bold text-amber-300 leading-tight truncate">
            {language === 'bn' ? (hijri.bengali || '২৮ ই রবিউল আউয়াল ১৪৪৮ হিজরী') : (hijri.english || '28 Rabi al-Awwal 1448 AH')}
          </h2>
          {/* Line 2: Light White English/Gregorian Date */}
          <span className="text-[11px] sm:text-xs text-emerald-300/90 font-normal leading-tight mt-0.5 truncate">
            {gregorianDateText}
          </span>
        </div>
      </div>

      {/* Hero Centerpiece: Left (Big Bold Progress) + Right (Semi-Circular Arc) */}
      <div className="flex items-center justify-between gap-3 pt-1">
        {/* Left Column: Big Bold Progress Statement */}
        <div className="flex flex-col justify-center space-y-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg sm:text-xl font-bold text-slate-200 mr-1">
              {language === 'bn' ? 'আজ' : 'Today'}
            </span>
            {/* Highlighted Big Completed Number */}
            <span 
              style={{ textShadow: '0 0 10px rgba(251,191,36,0.4)' }}
              className="text-4xl sm:text-5xl font-black text-amber-300 font-mono leading-none tracking-tight scale-110 origin-bottom"
            >
              {language === 'bn' ? toBnNumber(completedCount) : completedCount}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-amber-400/70 mx-0.5">
              /
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-400/90 font-mono">
              {language === 'bn' ? toBnNumber(totalPrayers) : totalPrayers}
            </span>
          </div>

          <span className="text-xl sm:text-2xl font-bold text-white">
            {language === 'bn' ? 'ওয়াক্ত' : 'Prayers'}
          </span>

          <span className="text-sm sm:text-base font-medium text-emerald-100/90 pt-1">
            {isFemale 
              ? (language === 'bn' ? 'সালাত সম্পন্ন' : 'Prayers Completed') 
              : (language === 'bn' ? 'সালাত জামাতে' : 'Prayers in Jama\'ah')}
          </span>
          {!isFemale && (
            <span className="text-sm sm:text-base font-medium text-emerald-100/90 leading-none">
              {language === 'bn' ? 'সম্পন্ন' : 'Completed'}
            </span>
          )}
        </div>

        {/* Right Column: Semi-Circular Arc Timer */}
        <SemiCirclePrayerHero coords={coords} />
      </div>

      {/* 5-Prayer Bottom Pills / Step Indicators */}
      <div className="grid grid-cols-5 gap-2 pt-2">
        {prayerSteps.map((step, idx) => {
          const isDone = Boolean(step.isDone);

          return (
            <div key={`dpc-step-${step.key}-${idx}`} className="flex flex-col items-center gap-1.5">
              {/* Pill Indicator Bar: Golden ONLY if completed */}
              <div
                className={`w-full h-2 rounded-full transition-all ${
                  isDone
                    ? 'bg-gradient-to-r from-amber-400 to-amber-300'
                    : 'bg-[#033024] border border-[#0a4838]'
                }`}
              />

              {/* Label + Check Icon ONLY if completed */}
              <div className="flex items-center justify-center gap-1">
                {isDone && (
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-400/20 border border-amber-400/60 flex items-center justify-center text-amber-300 shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                )}
                <span
                  className={`text-xs truncate ${
                    isDone
                      ? 'text-amber-300 font-bold'
                      : 'text-emerald-300/50 font-medium'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Daily Earned Token Motivational Status Capsule (Compact Informational Box, No Links) */}
      <div 
        className="w-full py-2 px-3 rounded-xl bg-[#02141a] border border-[#0a4838] flex items-center gap-2.5 shadow-xs"
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg shrink-0 shadow-inner border ${
          tokenTierInfo.type !== 'NONE'
            ? 'bg-amber-500/15 border-amber-400/40'
            : 'bg-[#033024] border-[#0a4838]'
        }`}>
          {tokenTierInfo.emoji}
        </div>

        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 flex-wrap leading-tight">
            <span className="text-[11px] text-emerald-200/90 font-medium">
              {tokenTierInfo.headline}
            </span>
            <span className={`text-xs font-black tracking-tight ${tokenTierInfo.textColor}`}>
              {tokenTierInfo.tokenName}
            </span>
            {tokenTierInfo.type !== 'NONE' && (
              <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${tokenTierInfo.pillBg}`}>
                {language === 'bn' ? 'অর্জিত' : 'Earned'}
              </span>
            )}
          </div>
          <span className="text-[11px] text-emerald-300/80 mt-0.5 truncate font-normal leading-tight">
            {tokenTierInfo.subtext}
          </span>
        </div>
      </div>

      {/* Journey Teaser Link: Dark Capsule at bottom with Icon & Percentage Pill */}
      {onOpenJourney && (
        <button
          onClick={onOpenJourney}
          className="w-full text-left p-3.5 rounded-2xl bg-[#02141a] hover:bg-[#031b23] border border-[#093e32] transition-colors flex items-center justify-between gap-3 cursor-pointer shadow-xs"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#033024] border border-[#0a4838] flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <BarChart3 className="w-5 h-5 text-amber-400" />
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {language === 'bn' ? 'আমার কেভ জার্নি' : 'My Cave Journey'}
                </span>
                <span className="text-[11px] font-bold text-emerald-300 bg-[#033628] border border-[#0b5440] px-2 py-0.5 rounded-md">
                  ↑ {language === 'bn' ? '১১%' : '11%'}
                </span>
              </div>
              <span className="text-xs text-emerald-300/80 mt-0.5 truncate font-normal">
                {language === 'bn'
                  ? (teaser ? `${teaser.primaryStat} • ${teaser.secondaryStat}` : 'এই সপ্তাহে ৫/৩৫ ওয়াক্ত • গত সপ্তাহের তুলনায় ...')
                  : `${completedCount}/35 prayers this week • Progress active`}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-400 shrink-0" />
        </button>
      )}
    </div>
  );
});
