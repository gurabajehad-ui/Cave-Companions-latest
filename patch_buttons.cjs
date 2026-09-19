const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

const targetStr = `                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          disabled={!canApprove || actionLoading === \`approve-mch-\${selectedMerchantVerification.id}\`}
                          onClick={() => handleOpenApprovalModal(selectedMerchantVerification)}`;

const endStr = `                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>`;

const startIdx = content.indexOf(targetStr);
let endIdx = -1;

if (startIdx !== -1) {
  endIdx = content.indexOf(endStr, startIdx);
  if (endIdx !== -1) {
    const statusVar = `const mchStatus = selectedMerchantVerification.verificationStatus?.toLowerCase().trim();`;
    const replacement = `                      <div className="flex flex-wrap items-center gap-3">
                        {mchStatus === 'approved' ? (
                          <div className="flex-1 py-3 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black text-sm flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            <span>APPROVED</span>
                          </div>
                        ) : mchStatus === 'rejected' ? (
                          <div className="flex-1 py-3 px-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-black text-sm flex items-center justify-center gap-2">
                            <X className="w-5 h-5" />
                            <span>REJECTED</span>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              disabled={!canApprove || actionLoading === \`approve-mch-\${selectedMerchantVerification.id}\`}
                              onClick={() => handleOpenApprovalModal(selectedMerchantVerification)}
                              className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                            >
                              {actionLoading === \`approve-mch-\${selectedMerchantVerification.id}\` ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle2 className="w-5 h-5" />
                                  <span>APPROVE MERCHANT (অনুমোদন করুন)</span>
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              disabled={actionLoading === \`corr-mch-\${selectedMerchantVerification.id}\`}
                              onClick={() => handleOpenCorrectionModal(selectedMerchantVerification)}
                              className="py-3 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <AlertCircle className="w-5 h-5" />
                              <span>REQUEST CORRECTION (সংশোধন অনুরোধ)</span>
                            </button>
                            <button
                              type="button"
                              disabled={actionLoading === \`reject-mch-\${selectedMerchantVerification.id}\`}
                              onClick={() => handleOpenRejectionModal(selectedMerchantVerification)}
                              className="py-3 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/80 text-rose-300 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <X className="w-5 h-5" />
                              <span>REJECT (বাতিল করুন)</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>`;

    
    const blockStartStr = `                {(() => {
                  const missing = getMissingRequirements(selectedMerchantVerification);
                  const canApprove = missing.length === 0;
                  return (`;
    
    const blockStartIdx = content.indexOf(blockStartStr);
    const blockReplacement = `                {(() => {
                  const missing = getMissingRequirements(selectedMerchantVerification);
                  const canApprove = missing.length === 0;
                  const mchStatus = selectedMerchantVerification.verificationStatus?.toLowerCase().trim();
                  return (`;

    let finalContent = content.substring(0, blockStartIdx) + blockReplacement + content.substring(blockStartIdx + blockStartStr.length, startIdx) + replacement + content.substring(endIdx + endStr.length);
    fs.writeFileSync('src/components/AdminDashboardView.tsx', finalContent);
    console.log("Successfully patched buttons!");
  } else {
    console.log("Could not find end of buttons block.");
  }
} else {
  console.log("Could not find start of buttons block.");
}
