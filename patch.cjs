const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

const replacement = `              <div className="flex items-center justify-between mt-3 border-t border-slate-800 pt-3">
                <label className="text-xs font-semibold text-slate-300 block mb-1">অবস্থান (Map)</label>
                <button
                  type="button"
                  onClick={() => setIsMosqueLocationPickerOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-900 text-[10px] font-bold hover:bg-emerald-900 transition-colors"
                >
                  ম্যাপ থেকে লোকেশন সিলেক্ট করুন
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Latitude (অক্ষাংশ)</label>
                  <input
`;
code = code.replace(`              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Latitude (অক্ষাংশ)</label>
                  <input`, replacement);
                  
const photoBlock = `
              <div className="flex gap-4 mb-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block font-semibold">মসজিদের ছবি</span>
                  {selectedMosqueForEdit.imageUrl ? (
                    <img src={selectedMosqueForEdit.imageUrl} className="w-20 h-20 rounded-xl object-cover border border-slate-700 shadow" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] text-slate-500">ছবি নেই</div>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block font-semibold">ইমাম সাহেবের ছবি</span>
                  {selectedMosqueForEdit.imamImageUrl ? (
                    <img src={selectedMosqueForEdit.imamImageUrl} className="w-20 h-20 rounded-xl object-cover border border-slate-700 shadow" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] text-slate-500">ছবি নেই</div>
                  )}
                </div>
              </div>
`;

code = code.replace(`            <form
              onSubmit={e => handleSaveMosqueEdit(e, selectedMosqueForEdit.id, {`, photoBlock + `            <form
              onSubmit={e => handleSaveMosqueEdit(e, selectedMosqueForEdit.id, {`);

fs.writeFileSync('src/components/AdminDashboardView.tsx', code);
