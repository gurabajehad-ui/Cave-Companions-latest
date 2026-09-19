import fs from 'fs';
let content = fs.readFileSync('server/routes/adminRoutes.ts', 'utf8');

content = content.replace(
  /await db\.saveUploadedMedia\(mediaId, buffer, mimeType\);/g,
  "await db.saveUploadedMedia({ id: mediaId, filename: fileName || mediaId, mimeType, buffer });"
);

fs.writeFileSync('server/routes/adminRoutes.ts', content);
console.log('Fixed saveUploadedMedia args');
