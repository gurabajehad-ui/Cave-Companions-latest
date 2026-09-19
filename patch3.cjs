const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

const targetStr = `<h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                              {mosque.nameBn || mosque.name}
                            </h4>`;

const replacement = `<h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                              {mosque.imageUrl && (
                                <img src={mosque.imageUrl} className="w-6 h-6 rounded-md object-cover" referrerPolicy="no-referrer" />
                              )}
                              {mosque.nameBn || mosque.name}
                            </h4>`;

code = code.replace(targetStr, replacement);
fs.writeFileSync('src/components/AdminDashboardView.tsx', code);
