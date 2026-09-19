import fs from 'fs';
import path from 'path';

const filesToFix = [
  'src/components/AdvertisementManagement.tsx',
  'src/components/AdminDashboardView.tsx',
  'src/components/MerchantRegistrationWizard.tsx',
  'src/components/AccountsManagement.tsx'
];

filesToFix.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace value={obj.prop} with value={obj.prop ?? ''} 
  // We only match simple property access to avoid breaking expressions
  content = content.replace(/value=\{([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)\}/g, "value={$1 ?? ''}");
  
  fs.writeFileSync(file, content);
  console.log(`Fixed ${file}`);
});
