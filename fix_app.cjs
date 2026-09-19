const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Remove import
content = content.replace(/import { PrayerReminderCard } from '\.\/components\/PrayerReminderCard';\n/g, '');

// Remove component rendering
const componentMatch = `            {/* Location-Based 10-Minute Prayer Reminder Settings Card */}
            <PrayerReminderCard
              onShowToast={showToast}
              userDistrict={user?.district}
            />\n`;
content = content.replace(componentMatch, '');

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('App.tsx updated');
