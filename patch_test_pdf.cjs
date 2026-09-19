const fs = require('fs');
let code = fs.readFileSync('dist/server.cjs', 'utf-8');
code = code.replace(
  "app.listen(PORT,",
  `app.get('/test-pdf', async (req, res) => {
    try {
      const { generatePDFReport } = require('./server/reports/financialReportGenerator.js');
      const buffer = await generatePDFReport({ shopName: 'Test', generatedAt: 'Now', summary: { totalAmount: 100, totalCount: 1 }, transactions: [] });
      res.setHeader('Content-Type', 'application/pdf');
      res.send(buffer);
    } catch (e) {
      console.error(e);
      res.status(500).send(e.message);
    }
  });
  app.listen(PORT,`
);
fs.writeFileSync('dist/server.cjs', code);
