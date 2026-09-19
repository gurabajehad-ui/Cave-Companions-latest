import fs from 'fs';

// 1. Add endpoint to server/routes/adminRoutes.ts
let content = fs.readFileSync('server/routes/adminRoutes.ts', 'utf8');

const uploadRoute = `
// =====================================
// Advertisement Media Upload
// =====================================
adminRoutes.post('/upload-media', requireAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { fileData, fileName } = req.body;
    if (!fileData) {
      res.status(400).json({ success: false, message: 'Missing file data' });
      return;
    }
    
    const base64Data = fileData.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    const mimeMatch = fileData.match(/^data:([A-Za-z-+/]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    
    const buffer = Buffer.from(base64Data, 'base64');
    
    if (buffer.length > 5 * 1024 * 1024) {
      res.status(400).json({ success: false, message: 'File too large (max 5MB)' });
      return;
    }
    
    const mediaId = require('crypto').randomUUID() + (fileName ? '_' + fileName.replace(/[^a-zA-Z0-9.]/g, '') : '.jpg');
    
    await db.saveUploadedMedia(mediaId, buffer, mimeType);
    
    const cacheDir = require('path').join(process.cwd(), 'uploads', 'media');
    if (!require('fs').existsSync(cacheDir)) {
      require('fs').mkdirSync(cacheDir, { recursive: true });
    }
    require('fs').writeFileSync(require('path').join(cacheDir, mediaId), buffer);
    
    res.json({ success: true, url: \`/api/media/images/\${mediaId}\` });
  } catch (err: any) {
    console.error('Admin upload error:', err);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});
`;

if (!content.includes('/upload-media')) {
  content = content.replace(/export const adminRoutes = Router\(\);/, 'export const adminRoutes = Router();\n' + uploadRoute);
  fs.writeFileSync('server/routes/adminRoutes.ts', content);
  console.log('Added upload route to adminRoutes.ts');
}

// 2. Add api.uploadMedia to src/services/api.ts
let apiContent = fs.readFileSync('src/services/api.ts', 'utf8');

const apiFunc = `
  // Advertisement Admin Upload
  uploadMedia: (fileData: string, fileName?: string) =>
    request<{ success: boolean; url: string }>('/api/admin/upload-media', {
      method: 'POST',
      body: JSON.stringify({ fileData, fileName }),
    }),
`;

if (!apiContent.includes('uploadMedia:')) {
  apiContent = apiContent.replace(/export const api = \{/, 'export const api = {\n' + apiFunc);
  fs.writeFileSync('src/services/api.ts', apiContent);
  console.log('Added uploadMedia to api.ts');
}

