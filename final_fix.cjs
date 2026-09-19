const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

// 1. Fix mchStatus definition
const target = 'const canApprove = missing.length === 0;';
const replacement = 'const canApprove = missing.length === 0;\n                  const mchStatus = selectedMerchantVerification.verificationStatus?.toLowerCase().trim();';

if (content.includes(target) && !content.includes('const mchStatus')) {
    content = content.replace(target, replacement);
    console.log("Added mchStatus definition.");
}

// 2. Fix potential duplicate imports or weird spacing at top
// Let's just make sure the imports are clean.
// I noticed line 1 and 2 might be merged or something.
// But cat -n showed they are fine. 
// I'll leave them if they look okay now.

fs.writeFileSync('src/components/AdminDashboardView.tsx', content);
