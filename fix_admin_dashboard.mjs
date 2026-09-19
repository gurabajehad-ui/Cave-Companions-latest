import fs from 'fs';
let content = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

// Add import if not present
if (!content.includes('AdvertisementManagement')) {
  content = content.replace(
    /import \{ AdminDeliveryChargeView \} from '\.\/AdminDeliveryChargeView';/,
    "import { AdminDeliveryChargeView } from './AdminDeliveryChargeView';\nimport { AdvertisementManagement } from './AdvertisementManagement';"
  );
}

// Add rendering block
const renderBlock = `
      {/* ========================================================= */}
      {/* SECTION: ADVERTISEMENT MANAGEMENT                           */}
      {/* ========================================================= */}
      {activeTab === 'ads' && !selectedMerchantVerification && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <AdvertisementManagement />
        </div>
      )}
`;

if (!content.includes('activeTab === \\\'ads\\\' && !selectedMerchantVerification')) {
  content = content.replace(
    /\{\/\* ========================================================= \*\/\}\s*\{\/\* SECTION 13: MENU & ACCESS CONTROL \(FB PAGE STYLE\)       \*\/\}/,
    renderBlock + "\n      {/* ========================================================= */}\n      {/* SECTION 13: MENU & ACCESS CONTROL (FB PAGE STYLE)       */}"
  );
}

fs.writeFileSync('src/components/AdminDashboardView.tsx', content);
console.log('Fixed AdminDashboardView.tsx');
