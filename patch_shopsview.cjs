const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

const targetStr = `      {/* ========================================================= */}
      {/* SECTION 3: PARTNER SHOPS MANAGEMENT                       */}
      {/* ========================================================= */}
      {activeTab === 'shops' && !selectedMerchantVerification && (
        <div className="space-y-4">
          {/* Action & Filter Bar */}`;

const endStr = `            )}
          </div>
        </div>
      )}`;

const startIdx = content.indexOf(targetStr);
let endIdx = -1;

if (startIdx !== -1) {
  endIdx = content.indexOf(endStr, startIdx);
  if (endIdx !== -1) {
    const replacement = `      {/* ========================================================= */}
      {/* SECTION 3: PARTNER SHOPS MANAGEMENT                       */}
      {/* ========================================================= */}
      {activeTab === 'shops' && !selectedMerchantVerification && (
        <PartnerShopsView 
          onSelectShop={handleSelectMerchantVerification} 
          onAddShopClick={() => setIsAddShopModalOpen(true)} 
        />
      )}`;

    content = content.substring(0, startIdx) + replacement + content.substring(endIdx + endStr.length);
    fs.writeFileSync('src/components/AdminDashboardView.tsx', content);
    console.log("Successfully replaced shops tab with PartnerShopsView component!");
  } else {
    console.log("Could not find end of shops tab.");
  }
} else {
  console.log("Could not find start of shops tab.");
}
