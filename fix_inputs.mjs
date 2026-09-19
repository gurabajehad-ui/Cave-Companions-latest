import fs from 'fs';

let content = fs.readFileSync('src/components/AdvertisementManagement.tsx', 'utf8');

// Replace value={formData.xxx} with value={formData.xxx || ''}
content = content.replace(/value=\{formData\.title\}/g, "value={formData.title || ''}");
content = content.replace(/value=\{formData\.sponsorName\}/g, "value={formData.sponsorName || ''}");
content = content.replace(/value=\{formData\.destinationType === 'EXTERNAL' \? formData\.externalUrl : formData\.destinationId\}/g, "value={formData.destinationType === 'EXTERNAL' ? (formData.externalUrl || '') : (formData.destinationId || '')}");

content = content.replace(/value=\{loc\.pageName\}/g, "value={loc.pageName || ''}");
content = content.replace(/value=\{loc\.placementSlot\}/g, "value={loc.placementSlot || ''}");
content = content.replace(/value=\{loc\.displaySize\}/g, "value={loc.displaySize || ''}");
content = content.replace(/value=\{loc\.priority\}/g, "value={loc.priority ?? 1}");

content = content.replace(/value=\{s\.maxAds\}/g, "value={s.maxAds ?? ''}");

fs.writeFileSync('src/components/AdvertisementManagement.tsx', content);
console.log('Fixed inputs in AdvertisementManagement.tsx');
