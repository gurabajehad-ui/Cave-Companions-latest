const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

// Check lucide-react imports
if (!code.includes('Navigation') && code.includes('Compass')) {
  code = code.replace("Compass,", "Navigation,");
}
code = code.replace(/<Compass /g, '<Navigation ');

fs.writeFileSync('src/components/AdminDashboardView.tsx', code);
console.log("Fixed Compass icon reference");
