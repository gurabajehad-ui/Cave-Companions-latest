const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

const startMarker = "          {/* PENDING MOSQUES SECTION */}";
const endMarker = "          {/* APPROVED MOSQUES SECTION */}";

const startIdx = code.indexOf(startMarker);
const endIdx = code.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
    console.error("Markers not found");
    process.exit(1);
}

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
          )}

`;

code = code.slice(0, startIdx) + replacement + code.slice(endIdx);
fs.writeFileSync('src/components/AdminDashboardView.tsx', code);
console.log("Successfully replaced pending section");
