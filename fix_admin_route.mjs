import fs from 'fs';
let content = fs.readFileSync('server/routes/adminRoutes.ts', 'utf8');

content = content.replace(
  /adminRoutes\.post\('\/upload-media', requireAdminAuth, async \(req: AuthRequest, res: Response\) => \{/,
  "adminRoutes.post('/upload-media', requirePermission('ADMIN_VIEW'), async (req: any, res: any) => {"
);

fs.writeFileSync('server/routes/adminRoutes.ts', content);
console.log('Fixed adminRoutes.ts upload-media route');
