const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

code = code.replace(
  "setMosques(prev => prev.map(m => (m.id === mosque.id ? res.mosque : s => s)));",
  "setMosques(prev => prev.map(m => (m.id === mosque.id ? res.mosque : m)));"
);

fs.writeFileSync('src/components/AdminDashboardView.tsx', code);
