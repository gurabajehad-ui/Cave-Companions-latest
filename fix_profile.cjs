const fs = require('fs');
let content = fs.readFileSync('src/components/ProfileView.tsx', 'utf8');

// Add import
const importStr = "import { PrayerReminderCard } from './PrayerReminderCard';\n";
const lastImportIndex = content.lastIndexOf('import ');
const insertionIndex = content.indexOf('\\n', lastImportIndex) + 1;

content = content.replace(
  "import { toBnNumber, formatBnDate, formatBnTime, PRAYERS_CONFIG } from '../data/prayerConfig';",
  "import { toBnNumber, formatBnDate, formatBnTime, PRAYERS_CONFIG } from '../data/prayerConfig';\nimport { PrayerReminderCard } from './PrayerReminderCard';"
);

// Add the card to the UI
const targetString = "{/* Quick Navigation & Support Section */}";
const cardStr = `
      {/* Prayer Reminder Notification Settings */}
      <PrayerReminderCard
        onShowToast={onShowToast}
        userDistrict={user?.district}
      />\n\n      `;
content = content.replace(targetString, cardStr + targetString);

fs.writeFileSync('src/components/ProfileView.tsx', content, 'utf8');
console.log('ProfileView.tsx updated');
