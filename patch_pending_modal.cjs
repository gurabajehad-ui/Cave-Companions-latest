const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

// Add state
const statePattern = "  const [selectedMosqueForEdit, setSelectedMosqueForEdit] = useState<Mosque | null>(null);";
code = code.replace(statePattern, statePattern + "\n  const [selectedPendingMosque, setSelectedPendingMosque] = useState<Mosque | null>(null);");

// Inject the modal before Mosque Edit Modal
const editModalPattern = "      {/* Mosque Edit Modal */}";
const pendingModalStr = `      {/* PENDING MOSQUE REVIEW MODAL */}
      {selectedPendingMosque && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl my-8"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold">
                  পেন্ডিং আবেদন
                </span>
                <h3 className="text-base font-bold text-white">আবেদন বিস্তারিত</h3>
              </div>
              <button
                onClick={() => setSelectedPendingMosque(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <span>আবেদনের তারিখ:</span>
                  <span className="text-slate-200 font-medium">
                    {new Date(selectedPendingMosque.createdAt || selectedPendingMosque.created_at || new Date().toISOString()).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </span>
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                  <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-white font-bold">{selectedPendingMosque.requestedByName || 'ব্যবহারকারী'}</span>
                  <span className="text-slate-400 font-mono">({selectedPendingMosque.requestedByPhone || 'ফোন নেই'})</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div className="space-y-3">
                  <h4 className="text-lg font-bold text-white">{selectedPendingMosque.nameBn || selectedPendingMosque.name}</h4>
                  
                  <div className="space-y-2 text-xs">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <p className="flex items-start gap-2 text-slate-300">
                        <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>
                          <strong className="block text-slate-400 mb-0.5">পূর্ণাঙ্গ ঠিকানা:</strong>
                          {selectedPendingMosque.address}<br/>
                          {selectedPendingMosque.area && selectedPendingMosque.area + ', '}
                          {selectedPendingMosque.district}
                        </span>
                      </p>
                      {selectedPendingMosque.latitude && selectedPendingMosque.longitude ? (
                        <a 
                          href={\`https://www.google.com/maps/search/?api=1&query=\${selectedPendingMosque.latitude},\${selectedPendingMosque.longitude}\`}
                          target="_blank" rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-emerald-400 hover:bg-slate-700 transition-colors text-[10px]"
                        >
                          ম্যাপে লোকেশন দেখুন
                        </a>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                        <strong className="text-slate-500 block text-[10px] uppercase">ইংরেজি নাম</strong>
                        <span>{selectedPendingMosque.name}</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                        <strong className="text-slate-500 block text-[10px] uppercase">জেলা</strong>
                        <span>{selectedPendingMosque.district}</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                        <strong className="text-slate-500 block text-[10px] uppercase">ইমামের নাম</strong>
                        <span>{selectedPendingMosque.imamName || 'তথ্য নেই'}</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                        <strong className="text-slate-500 block text-[10px] uppercase">ফোন নম্বর</strong>
                        <span className="font-mono">{selectedPendingMosque.contactNumber || 'তথ্য নেই'}</span>
                      </div>
                    </div>
                  </div>

                  {selectedPendingMosque.description && (
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                      <strong className="text-slate-500 block text-[10px] uppercase mb-1">বিশেষ বিবরণ</strong>
                      <p className="text-slate-300 italic">"{selectedPendingMosque.description}"</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">মসজিদের ছবি</span>
                    {selectedPendingMosque.imageUrl ? (
                      <img
                        src={selectedPendingMosque.imageUrl}
                        alt="Mosque"
                        className="w-full h-40 rounded-lg object-cover border border-slate-800"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-40 rounded-lg bg-slate-900 border border-dashed border-slate-800 flex items-center justify-center text-xs text-slate-500">
                        ছবি নেই
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">ইমামের ছবি</span>
                    {selectedPendingMosque.imamImageUrl ? (
                      <img
                        src={selectedPendingMosque.imamImageUrl}
                        alt="Imam"
                        className="w-full h-40 rounded-lg object-cover border border-slate-800"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-40 rounded-lg bg-slate-900 border border-dashed border-slate-800 flex items-center justify-center text-xs text-slate-500">
                        ছবি নেই
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
              <button
                disabled={actionLoading === \`mosque-approve-\${selectedPendingMosque.id}\`}
                onClick={() => {
                  handleApproveMosque(selectedPendingMosque);
                  setSelectedPendingMosque(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-950/50 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                {actionLoading === \`mosque-approve-\${selectedPendingMosque.id}\` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Approve (এপ্রুভ ও লাইভ)</span>
              </button>
              <button
                disabled={actionLoading === \`mosque-reject-\${selectedPendingMosque.id}\`}
                onClick={() => {
                  handleRejectMosque(selectedPendingMosque);
                  setSelectedPendingMosque(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-600/40 text-amber-300 text-sm font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
                <span>Reject (বাতিল)</span>
              </button>
              <button
                disabled={actionLoading === \`mosque-del-\${selectedPendingMosque.id}\`}
                onClick={() => {
                  handleDeleteMosque(selectedPendingMosque);
                  setSelectedPendingMosque(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-700/60 text-rose-300 text-sm font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete (মুছে ফেলুন)</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

`;
code = code.replace(editModalPattern, pendingModalStr + editModalPattern);

fs.writeFileSync('src/components/AdminDashboardView.tsx', code);
console.log('Added pending modal');
