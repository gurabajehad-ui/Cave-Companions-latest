const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

const targetStr = `          ) : (
            /* PENDING MERCHANTS LIST VIEW */
            <div className="space-y-4">`;

const replaceStr = `          ) : activeTab === 'pending-merchants' ? (
            /* PENDING MERCHANTS LIST VIEW */
            <div className="space-y-4">`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync('src/components/AdminDashboardView.tsx', content);
  console.log("Syntax fixed!");
} else {
  console.log("Could not find the target string.");
}
