const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

const pendingMerchantsStart = content.indexOf(`      {/* ========================================================= */}
      {/* SECTION: PENDING MERCHANT REQUESTS & VERIFICATION DETAILS */}
      {/* ========================================================= */}
      {activeTab === 'pending-merchants' && (
        <div className="space-y-6">`);

if (pendingMerchantsStart === -1) {
    console.log("Could not find pending merchants start.");
    process.exit(1);
}

// Inside pending-merchants, there is:
// {selectedMerchantVerificationLoading ? ( ... ) : selectedMerchantVerification ? ( ... ) : ( ... pending merchants list ... )}

const loadingStart = content.indexOf(`{selectedMerchantVerificationLoading ?`, pendingMerchantsStart);
if (loadingStart === -1) {
    console.log("Could not find loading start.");
    process.exit(1);
}

// Find the start of the `else` block containing the pending merchants list
const listStartStr = `) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">`;
const listStartIdx = content.indexOf(listStartStr, loadingStart);

if (listStartIdx === -1) {
    console.log("Could not find list start.");
    process.exit(1);
}

// Find the end of the pending-merchants tab
const pendingMerchantsEndStr = `                </div>
              ))}
            </div>
          )}
        </div>
      )}`;
      
const pendingMerchantsEndIdx = content.indexOf(pendingMerchantsEndStr, listStartIdx) + pendingMerchantsEndStr.length;

// Now, extract the two parts:
// 1. The overlay part (from loadingStart to listStartIdx + 3)
const overlayPart = content.substring(loadingStart, listStartIdx + 4); 

// 2. The pending list part (from listStartIdx + 4 to pendingMerchantsEndIdx)
// Wait, the pending list part should replace the entire pending-merchants block content.
const pendingListPart = content.substring(listStartIdx + 4, pendingMerchantsEndIdx);

// Construct the new pending-merchants block:
const newPendingMerchantsBlock = `      {/* ========================================================= */}
      {/* SECTION: PENDING MERCHANT REQUESTS & VERIFICATION DETAILS */}
      {/* ========================================================= */}
      {activeTab === 'pending-merchants' && (
        <div className="space-y-6">
${pendingListPart}
`;


// We need to place the overlay around all tabs.
// Where do tabs start?
const tabsStartStr = `      {/* ========================================================= */}
      {/* SECTION 1: OVERVIEW & TELEMETRY                           */}
      {/* ========================================================= */}`;
const tabsStartIdx = content.indexOf(tabsStartStr);


// The end of all tabs is before the Modals section.
const modalsStartStr = `      {/* ========================================================= */}
      {/* MODALS & OVERLAYS                                         */}
      {/* ========================================================= */}`;
const modalsStartIdx = content.indexOf(modalsStartStr);

// Now let's stitch it all together!
// 1. Before tabs
const beforeTabs = content.substring(0, tabsStartIdx);

// 2. The tabs content (but we need to replace the old pending-merchants block with the new one)
let tabsContent = content.substring(tabsStartIdx, modalsStartIdx);
tabsContent = tabsContent.replace(content.substring(pendingMerchantsStart, pendingMerchantsEndIdx), newPendingMerchantsBlock);

// 3. After modals
const afterTabs = content.substring(modalsStartIdx);

// Now, combine with the overlay wrapper!
const newContent = `${beforeTabs}${overlayPart}
        <>
${tabsContent}
        </>
      )}
${afterTabs}`;

fs.writeFileSync('src/components/AdminDashboardView.tsx', newContent);
console.log("Successfully extracted overlay and wrapped tabs!");

