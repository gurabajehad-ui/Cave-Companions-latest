const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

const targetListStart = `          {/* PENDING MOSQUES SECTION */}`;
const targetListEndStr = `          {mosqueSubTab === 'pending' && (
            <div className="space-y-3">
              {pendingMosquesList.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl p-6 text-slate-500 text-xs">
                  কোনো পেন্ডিং মসজিদ আবেদন নেই।
                </div>
              ) : (
                pendingMosquesList.map(mosque => {
                  const isApproving = actionLoading === \`mosque-approve-\${mosque.id}\`;
                  const isRejecting = actionLoading === \`mosque-reject-\${mosque.id}\`;
                  const isDeleting = actionLoading === \`mosque-del-\${mosque.id}\`;
                  const appDate = mosque.createdAt || mosque.created_at || new Date().toISOString();
                  const formattedDate = new Date(appDate).toLocaleString('bn-BD', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  });
                  return (
                    <div
                      key={mosque.id}
                      className="bg-slate-900 border border-amber-500/30 hover:border-amber-500/50 rounded-2xl p-5 space-y-4 transition-all"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold">
                            পেন্ডিং আবেদন
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <span>আবেদনের তারিখ:</span>
                            <span className="text-slate-200 font-medium">{formattedDate}</span>
                          </span>
                        </div>
                        {/* Applicant Info */}
                        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                          <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-white font-bold">{mosque.applicantName || 'ব্যবহারকারী'}</span>
                          <span className="text-slate-400 font-mono">({mosque.applicantPhone || 'ফোন নেই'})</span>
                        </div>
                      </div>
                      {/* Mosque Details & Photos */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <div className="space-y-2 md:col-span-2">
                          <h4 className="text-base font-bold text-white">{mosque.nameBn || mosque.name}</h4>
                          <p className="text-xs text-slate-300 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{mosque.address}, {mosque.area || mosque.district}</span>
                          </p>
                          <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-slate-300">
                            <div><strong className="text-slate-400">ইংরেজি নাম:</strong> {mosque.name}</div>
                            <div><strong className="text-slate-400">জেলা:</strong> {mosque.district}</div>
                            <div><strong className="text-slate-400">ইমাম:</strong> {mosque.imamName || 'তথ্য নেই'}</div>
                            <div><strong className="text-slate-400">ফোন:</strong> <span className="font-mono">{mosque.contactNumber || 'তথ্য নেই'}</span></div>
                            <div className="col-span-2"><strong className="text-slate-400">জিপিএস:</strong> <span className="font-mono text-amber-300">{mosque.latitude}, {mosque.longitude}</span></div>
                          </div>
                          {mosque.description && (
                            <p className="text-xs text-slate-400 italic pt-1">
                              "{mosque.description}"
                            </p>
                          )}
                        </div>
                        {/* Photos (Mosque & Imam) */}
                        <div className="flex items-center gap-3 justify-end">
                          <div className="space-y-1 text-center">
                            <span className="text-[10px] text-slate-400 block font-semibold">মসজিদের ছবি</span>
                            {mosque.imageUrl ? (
                              <img
                                src={mosque.imageUrl}
                                alt="Mosque"
                                className="w-20 h-20 rounded-xl object-cover border border-slate-700 shadow"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] text-slate-500">
                                ছবি নেই
                              </div>
                            )}
                          </div>
                          <div className="space-y-1 text-center">
                            <span className="text-[10px] text-slate-400 block font-semibold">ইমামের ছবি</span>
                            {mosque.imamImageUrl ? (
                              <img
                                src={mosque.imamImageUrl}
                                alt="Imam"
                                className="w-20 h-20 rounded-xl object-cover border border-slate-700 shadow"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] text-slate-500">
                                ছবি নেই
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Action Tabs: Approve, Reject, Delete */}
                      <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                        <button
                          disabled={isApproving}
                          onClick={() => handleApproveMosque(mosque)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          {isApproving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          <span>Approve (এপ্রুভ ও লাইভ)</span>
                        </button>
                        <button
                          disabled={isRejecting}
                          onClick={() => handleRejectMosque(mosque)}
                          className="px-4 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-600/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject (বাতিল)</span>
                        </button>
                        <button
                          disabled={isDeleting}
                          onClick={() => handleDeleteMosque(mosque)}
                          className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-700/60 text-rose-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete (মুছে ফেলুন)</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}`;

const replacement = `          {/* PENDING MOSQUES SECTION */}
          {mosqueSubTab === 'pending' && (
            <div className="space-y-3">
              {pendingMosquesList.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl p-6 text-slate-500 text-xs">
                  কোনো পেন্ডিং মসজিদ আবেদন নেই।
                </div>
              ) : (
                pendingMosquesList.map(mosque => {
                  const appDate = mosque.createdAt || mosque.created_at || new Date().toISOString();
                  const formattedDate = new Date(appDate).toLocaleString('bn-BD', {
                    dateStyle: 'medium'
                  });
                  return (
                    <div
                      key={mosque.id}
                      className="bg-slate-900 border border-amber-500/30 hover:border-amber-500/50 rounded-2xl p-4 transition-all"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div 
                          onClick={() => setSelectedPendingMosque(mosque)}
                          className="space-y-1.5 max-w-xl cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5">
                            <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                              {mosque.imageUrl && (
                                <img src={mosque.imageUrl} className="w-6 h-6 rounded-md object-cover" referrerPolicy="no-referrer" />
                              )}
                              {mosque.nameBn || mosque.name}
                            </h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              PENDING
                            </span>
                            <span className="text-[10px] text-amber-400 underline opacity-0 group-hover:opacity-100 transition-opacity">
                              বিস্তারিত ও রিভিউ
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-500" />
                              {mosque.address}, {mosque.district}
                            </span>
                            <span className="text-slate-300">আবেদন: {mosque.requestedByName || 'অজানা'}</span>
                            <span className="text-slate-500">{formattedDate}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setSelectedPendingMosque(mosque)}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all"
                          >
                            রিভিউ করুন
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}`;

let startIdx = code.indexOf(targetListStart);
if (startIdx === -1) {
  console.log('Target start not found');
  process.exit(1);
}

// Just replace the block directly.
code = code.replace(targetListEndStr, replacement);
fs.writeFileSync('src/components/AdminDashboardView.tsx', code);
console.log('Replaced list part');
