import fs from 'fs';
let content = fs.readFileSync('src/components/AdvertisementManagement.tsx', 'utf8');
content = content.replace(/value=\{formData\.destinationType\}/g, "value={formData.destinationType || 'NONE'}");
fs.writeFileSync('src/components/AdvertisementManagement.tsx', content);
