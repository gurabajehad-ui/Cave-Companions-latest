import { generatePDFReport } from './server/reports/financialReportGenerator';

async function test() {
  try {
    const data = {
      shopName: 'Test Shop',
      periodLabel: 'All Time',
      generatedAt: 'Now',
      summary: { totalAmount: 100, totalCount: 1 },
      transactions: []
    };
    const buffer = await generatePDFReport(data);
    console.log('PDF generated successfully, size:', buffer.length);
  } catch (err) {
    console.error('Failed to generate PDF:', err);
  }
}
test();
