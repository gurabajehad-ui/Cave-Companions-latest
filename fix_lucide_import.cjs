const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

code = code.replace("import {\n  Info,", "import {\n  Navigation,\n  Info,");

fs.writeFileSync('src/components/AdminDashboardView.tsx', code);
console.log("Added Navigation to lucide-react import");
