const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

const startStr = `              filteredShops.map(shop => {
                const isUpdating = actionLoading === \`shop-status-\${shop.id}\` || actionLoading === \`shop-qr-\${shop.id}\`;
                return (
                  <div
                    key={shop.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all"
                  >`;

const endStr = `                      </div>
                    </div>
                  </div>
                );
              })`;

const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf(endStr, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `              filteredShops.map(shop => {
                const isUpdating = actionLoading === \`shop-status-\${shop.id}\` || actionLoading === \`shop-qr-\${shop.id}\`;
                return (
                  <div
                    key={shop.id}
                    onClick={() => handleSelectMerchantVerification(shop.id)}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 rounded-2xl p-4 transition-all cursor-pointer"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                          <Store className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{shop.nameBn || shop.name}</h4>
                          <p className="text-[10px] text-slate-500 hidden sm:block">Click to view full shop registration details</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span
                          className={\`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 \${
                            shop.status === 'ACTIVE'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                              : shop.status === 'PENDING'
                              ? 'bg-amber-950 text-amber-300 border border-amber-700/60'
                              : 'bg-rose-950 text-rose-300 border border-rose-700/60'
                          }\`}
                        >
                          {shop.status}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleShopStatus(shop.id, shop.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE');
                            }}
                            disabled={isUpdating}
                            className={\`p-1.5 rounded-lg border transition-colors cursor-pointer \${
                              shop.status === 'ACTIVE'
                                ? 'bg-rose-950/40 border-rose-800/60 text-rose-400 hover:bg-rose-900/60'
                                : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400 hover:bg-emerald-900/60'
                            }\`}
                            title={shop.status === 'ACTIVE' ? 'Suspend Shop' : 'Activate Shop'}
                          >
                            {isUpdating ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : shop.status === 'ACTIVE' ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })`;
              
  const newContent = content.substring(0, startIdx) + replacement + content.substring(endIdx + endStr.length);
  fs.writeFileSync('src/components/AdminDashboardView.tsx', newContent);
  console.log("Successfully replaced shops tab rendering!");
} else {
  console.log("Could not find start/end bounds.");
}
