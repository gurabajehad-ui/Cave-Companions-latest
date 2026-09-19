const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

const startTag = "{/* PENDING MOSQUE REVIEW MODAL */}";
const endTag = "{/* Mosque Edit Modal */}";

const startIdx = code.indexOf(startTag);
const endIdx = code.indexOf(endTag);

if (startIdx === -1 || endIdx === -1) {
  console.error("Tags not found", startIdx, endIdx);
  process.exit(1);
}

const newModal = `{/* PENDING MOSQUE REVIEW MODAL */}
      {selectedPendingMosque && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 max-w-3xl w-full space-y-6 shadow-2xl my-8 text-slate-100"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  পেন্ডিং মসজিদ আবেদন বিস্তারিত
                </span>
                <span className="text-xs text-slate-400">
                  আবেদনের তারিখ: {new Date(selectedPendingMosque.createdAt || selectedPendingMosque.created_at || new Date().toISOString()).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
              <button
                onClick={() => setSelectedPendingMosque(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. Applicant Account Info */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">আবেদনকারী অ্যাকাউন্ট</span>
                  <h4 className="text-sm font-bold text-white">{selectedPendingMosque.requestedByName || 'নাম পাওয়া যায়নি'}</h4>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400">মোবাইল:</span>
                <span className="text-amber-300 font-mono font-bold">{selectedPendingMosque.requestedByPhone || 'ফোন নম্বর নেই'}</span>
              </div>
            </div>

            {/* 2. Addresses Comparison (User Box vs Map Location) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* User Input Address Box */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  ইউজার ফরম বক্সের ঠিকানা
                </span>
                <p className="text-xs text-slate-200 font-medium leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  {selectedPendingMosque.address || 'ঠিকানা দেওয়া হয়নি'}
                  {selectedPendingMosque.area ? \`, \${selectedPendingMosque.area}\` : ''}
                  {selectedPendingMosque.district ? \`, \${selectedPendingMosque.district}\` : ''}
                </p>
              </div>

              {/* Map Location & Geocoded Address Box */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5" />
                  ম্যাপ লোকেশন ও জিপিএস অ্যাড্রেস
                </span>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="text-slate-300 font-mono">
                    <span className="text-slate-500">অক্ষাংশ, দ্রাঘিমাংশ:</span>{' '}
                    <span className="text-emerald-300 font-bold">{selectedPendingMosque.latitude || 0}, {selectedPendingMosque.longitude || 0}</span>
                  </div>
                  {selectedPendingMosque.latitude && selectedPendingMosque.longitude ? (
                    <a
                      href={\`https://www.google.com/maps/search/?api=1&query=\${selectedPendingMosque.latitude},\${selectedPendingMosque.longitude}\`}
                      target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] transition-all"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>গুগল ম্যাপে লোকেশন দেখুন</span>
                    </a>
                  ) : (
                    <span className="text-rose-400 text-[11px]">জিপিএস স্থানাঙ্ক যুক্ত করা হয়নি</span>
                  )}
                </div>
              </div>
            </div>

            {/* 3. All Registration Data Grid */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider">রেজিস্ট্রেশনের সমস্ত তথ্য</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">বাংলা নাম</span>
                  <span className="text-white font-bold">{selectedPendingMosque.nameBn || 'নেই'}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">ইংরেজি নাম</span>
                  <span className="text-white font-medium">{selectedPendingMosque.name || 'নেই'}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">জেলা</span>
                  <span className="text-white font-medium">{selectedPendingMosque.district || 'নেই'}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">এলাকা</span>
                  <span className="text-white font-medium">{selectedPendingMosque.area || 'নেই'}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">ইমামের নাম</span>
                  <span className="text-white font-medium">{selectedPendingMosque.imamName || 'তথ্য নেই'}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">ইমামের ফোন</span>
                  <span className="text-white font-mono">{selectedPendingMosque.contactNumber || 'তথ্য নেই'}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 col-span-2">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">QR Identifier</span>
                  <span className="text-amber-300 font-mono text-[11px]">{selectedPendingMosque.qrIdentifier || 'স্বয়ংক্রিয়'}</span>
                </div>
              </div>
            </div>

            {/* 4. Description Box */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                বিবরণী বক্স (Description / বিশেষ মন্তব্য)
              </h5>
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 min-h-[60px] italic">
                {selectedPendingMosque.description ? \`"\${selectedPendingMosque.description}"\` : '<কোনো বিবরণ বা মন্তব্য লেখা হয়নি>'}
              </div>
            </div>

            {/* Photos Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2 text-center">
                <span className="text-xs text-slate-400 font-semibold block uppercase">মসজিদের ছবি</span>
                {selectedPendingMosque.imageUrl ? (
                  <img
                    src={selectedPendingMosque.imageUrl}
                    alt="Mosque"
                    className="w-full h-44 rounded-xl object-cover border border-slate-800 shadow-lg"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-44 rounded-xl bg-slate-900 border border-dashed border-slate-800 flex items-center justify-center text-xs text-slate-500">
                    মসজিদের কোনো ছবি দেওয়া হয়নি
                  </div>
                )}
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2 text-center">
                <span className="text-xs text-slate-400 font-semibold block uppercase">ইমাম সাহেবের ছবি</span>
                {selectedPendingMosque.imamImageUrl ? (
                  <img
                    src={selectedPendingMosque.imamImageUrl}
                    alt="Imam"
                    className="w-full h-44 rounded-xl object-cover border border-slate-800 shadow-lg"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-44 rounded-xl bg-slate-900 border border-dashed border-slate-800 flex items-center justify-center text-xs text-slate-500">
                    ইমাম সাহেবের কোনো ছবি দেওয়া হয়নি
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                disabled={actionLoading === \`mosque-approve-\${selectedPendingMosque.id}\`}
                onClick={() => {
                  handleApproveMosque(selectedPendingMosque);
                  setSelectedPendingMosque(null);
                }}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-xl shadow-emerald-950/50 flex items-center gap-2 cursor-pointer transition-all"
              >
                {actionLoading === \`mosque-approve-\${selectedPendingMosque.id}\` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Approve (এপ্রুভ ও লাইভ করুন)</span>
              </button>
              <button
                disabled={actionLoading === \`mosque-reject-\${selectedPendingMosque.id}\`}
                onClick={() => {
                  handleRejectMosque(selectedPendingMosque);
                  setSelectedPendingMosque(null);
                }}
                className="px-6 py-3 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-600/40 text-amber-300 text-sm font-bold flex items-center gap-2 cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
                <span>Reject (বাতিল করুন)</span>
              </button>
              <button
                disabled={actionLoading === \`mosque-del-\${selectedPendingMosque.id}\`}
                onClick={() => {
                  handleDeleteMosque(selectedPendingMosque);
                  setSelectedPendingMosque(null);
                }}
                className="px-6 py-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-700/60 text-rose-300 text-sm font-bold flex items-center gap-2 cursor-pointer transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete (স্থায়ীভাবে মুছুন)</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      `;

code = code.slice(0, startIdx) + newModal + code.slice(endIdx);
fs.writeFileSync('src/components/AdminDashboardView.tsx', code);
console.log("Successfully updated pending mosque review modal with all required details!");
