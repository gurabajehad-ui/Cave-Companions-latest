const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

// Fix motion import
code = code.replace("import { Navigation, motion, AnimatePresence } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';");

// Ensure Navigation is imported from lucide-react
if (code.includes("import {")) {
  code = code.replace("import {", "import { Navigation,");
}

fs.writeFileSync('src/components/AdminDashboardView.tsx', code);
console.log("Fixed imports in AdminDashboardView.tsx");
