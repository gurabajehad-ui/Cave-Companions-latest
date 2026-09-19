const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

if (code.includes('Navigation') && !code.includes('Navigation,')) {
  // ensure Navigation is imported from lucide-react
  code = code.replace("import {", "import { Navigation,");
}
fs.writeFileSync('src/components/AdminDashboardView.tsx', code);
console.log("Ensured Navigation import");
