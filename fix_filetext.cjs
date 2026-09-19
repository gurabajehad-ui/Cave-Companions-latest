const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

if (!code.includes('FileText')) {
  code = code.replace("import {\n  Navigation,", "import {\n  FileText,\n  Navigation,");
}

fs.writeFileSync('src/components/AdminDashboardView.tsx', code);
console.log("Added FileText import");
