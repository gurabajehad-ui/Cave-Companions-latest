# Replace Approved Mosques Card with Embedded Feature Discovery Card

Replace the static "Approved Mosques" (`ApprovedMosquesCard`) on the Home Page feed with an auto-rotating Feature Discovery Card styled seamlessly with the dark emerald Home feed theme.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following choices were explicitly confirmed by the user in Phase 1:

- **Replacement Target**: Remove `<ApprovedMosquesCard />` from the Home Page stream inside `App.tsx`.
- **Card Styling**: Dark emerald rounded card (`bg-[#022119] border border-[#0c4334] rounded-3xl p-4 shadow-md text-white`) matching the Home Page feed aesthetic.
- **Dismiss Button**: Removed completely, rendering it as a permanent feature discovery card in the Home feed stream.
- **Rotation Interval**: 2.5-second auto-rotate with smooth slide-fade animation and pause-on-touch interaction.

---

## 1. Overview & Core Concept

- **What It Does**: Replaces the "Approved Mosques" card on the Home feed with a dynamic, animated "Feature Discovery" card. Every 2.5 seconds, the card rotates through interactive prompts encouraging users to explore Quran, Qibla, Hisnul Muslim, Cave Circles, and Mosque Directory.
- **Target Audience**: Users scrolling through the Home Page who want an engaging, interactive card showcasing what the app offers.
- **Key Value**: Streamlines the Home feed, removes visual clutter, and increases engagement across all app tools.

---

## 2. User Experience & Visual Design

### Card Layout & Visual Tokens
- **Container**: `rounded-3xl border border-[#0c4334] bg-[#022119] p-4 sm:p-5 shadow-md text-white space-y-3 relative overflow-hidden`.
- **Header**:
  - Left: Glowing badge with sparkle icon and title "অ্যাপের সেরা ফিচারসমূহ" / "Featured Tools".
  - Right: Auto-rotating slide indicator dots (1 to 5).
- **Body**:
  - Auto-animating Bengali prompt text ("কুরআন মাজীদ তিলাওয়াত করতে চান?", "কিবলা খুঁজে পাচ্ছেন না?", etc.).
  - Right CTA Button: Gold gradient pill button (`bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-full`) triggering direct feature navigation on click.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Replacing Approved Mosques Card**
  - *Chosen Approach*: Remove `<ApprovedMosquesCard />` from `App.tsx` home stream and insert the inline `<FeatureDiscoveryCard />` in its exact location.
  - *Why*: User requested removing the Approved Mosques card and putting feature discovery directly in its place.
- **Decision 2: Permanent Feed Presence (No Close/Dismiss Button)**
  - *Chosen Approach*: Omit the dismiss/close `X` button so it functions as a core home card alongside Daily Progress, Prayer Times, and Daily Nasiha.

---

## 4. Technical Architecture & Data Strategy

### Home Feed Component Layout

```
┌──────────────────────────────────────────────────────────────┐
│                        Home Feed Area                        │
│                                                              │
│  1. AdBanner                                                 │
│  2. DailyProgressCard                                        │
│  3. CompactPrayersCard                                       │
│  4. DailyNasihaCard                                          │
│  5. SehriIftarCard                                           │
│  6. FeatureDiscoveryCard (Replaces ApprovedMosquesCard)      │
│     ┌─────────────────────────────────────────────────────┐  │
│     │ [Sparkle] অ্যাপের সেরা ফিচারসমূহ        (• • • • •) │  │
│     │                                                     │  │
│     │ [Icon] "বন্ধু ও পরিবারকে ভালো কাজের দাওয়াত দিন"     │  │
│     │                                      [কেভ সার্কেল →]│  │
│     └─────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## Pre-Flight Verification Checklist

1. **Approved Mosques Card Removed**: `<ApprovedMosquesCard />` removed from the home feed list in `App.tsx`.
2. **Feature Discovery Embedded**: Replaced with inline `<FeatureDiscoveryCard />` matching home feed card tokens (`#022119` bg, `#0c4334` border).
3. **No Dead Clicks**: Tapping any slide's CTA button directly navigates to the requested tab/modal.
