const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

const tabStartStr = `      {/* ========================================================= */}
      {/* SECTION 1: OVERVIEW & TELEMETRY                           */}
      {/* ========================================================= */}`;

// The start of the overlay logic is at:
const overlayStartStr = `          {selectedMerchantVerificationLoading ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">`;

const overlayEndStr = `          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 2: MOSQUES MANAGEMENT (ADD / QR / STATUS)         */}`;


const overlayMatchStartIdx = content.indexOf(`{/* ========================================================= */}
      {/* SECTION: PENDING MERCHANT REQUESTS & VERIFICATION DETAILS */}
      {/* ========================================================= */}
      {activeTab === 'pending-merchants' && (
        <div className="space-y-6">`);


