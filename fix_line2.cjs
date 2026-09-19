const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

code = code.replace("import { Navigation, motion, AnimatePresence } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';");

fs.writeFileSync('src/components/AdminDashboardView.tsx', code);
console.log("Cleaned line 2");
