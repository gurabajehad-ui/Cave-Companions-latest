import fs from 'fs';

let content = fs.readFileSync('server/db.ts', 'utf8');

const target1 = `  async getMerchantVerificationByMerchantId(merchantIdOrShopId: string): Promise<MerchantVerificationRecord | null> {`;
const target1End = `  async getMerchantVerificationsByStatus(status?: string): Promise<MerchantVerificationRecord[]> {`;

const target2 = `  async getMerchantVerificationsByStatus(status?: string): Promise<MerchantVerificationRecord[]> {`;
const target2End = `  async approveMerchantVerification(merchantIdOrShopId: string, adminName: string): Promise<MerchantVerificationRecord | null> {`;

const start1 = content.indexOf(target1);
const end1 = content.indexOf(target1End);

const start2 = content.indexOf(target2);
const end2 = content.indexOf(target2End);

if (start1 === -1 || start2 === -1) {
  console.log("Targets not found.");
  process.exit(1);
}

const replacement = `
  async getMerchantVerificationByMerchantId(merchantIdOrShopId: string): Promise<MerchantVerificationRecord | null> {
    let sql = \`
      SELECT 
        s.id as shop_id, s.name as shop_name, s.address as shop_address, s.area, s.district, s.category as business_type, s.photo_url as shop_photo_url, s.verification_status as shop_verification_status, s.latitude, s.longitude, s.description, s.created_at,
        m.id as merchant_id, m.name as owner_name, m.phone,
        v.id as verification_id, v.verification_status, v.nid_number, v.trade_license_number, v.nid_front_url, v.nid_back_url, v.owner_selfie_url, v.trade_license_url, v.agreement_accepted, v.business_description, v.submitted_at, v.updated_at, v.correction_history
      FROM shops s
      LEFT JOIN merchants m ON m.shop_id = s.id
      LEFT JOIN merchant_verifications v ON v.shop_id = s.id
      WHERE s.id = $1 OR m.id = $1 OR v.id = $1
      ORDER BY s.created_at DESC LIMIT 1
    \`;
    const res = await query(sql, [merchantIdOrShopId]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.verification_id || row.shop_id,
      merchantId: row.merchant_id || '',
      shopId: row.shop_id,
      ownerName: row.owner_name || 'No Owner',
      phone: row.phone || 'No Phone',
      shopName: row.shop_name,
      businessType: row.business_type || 'others',
      shopAddress: row.shop_address || row.area || '',
      district: row.district || '',
      upazilaThana: row.area || '',
      latitude: row.latitude || 0,
      longitude: row.longitude || 0,
      shopPhotoUrl: row.shop_photo_url || '',
      businessDescription: row.business_description || row.description || '',
      verificationStatus: (row.verification_status || row.shop_verification_status || 'PENDING').toUpperCase(),
      nidNumber: row.nid_number || 'Not provided',
      tradeLicenseNumber: row.trade_license_number || 'Not provided',
      nidFrontUrl: row.nid_front_url || '',
      nidBackUrl: row.nid_back_url || '',
      ownerSelfieUrl: row.owner_selfie_url || '',
      tradeLicenseUrl: row.trade_license_url || '',
      agreementAccepted: row.agreement_accepted || true,
      agreementAcceptedAt: row.submitted_at || row.created_at,
      agreementVersion: 'v1.0',
      acceptedTotalCommission: 6,
      acceptedGoldUserBenefit: 5,
      acceptedGoldPlatformCommission: 1,
      acceptedSilverUserBenefit: 4,
      acceptedSilverPlatformCommission: 2,
      acceptedBronzeUserBenefit: 3,
      acceptedBronzePlatformCommission: 3,
      submittedAt: row.submitted_at || row.created_at,
      updatedAt: row.updated_at || row.created_at,
      correctionHistory: Array.isArray(row.correction_history) ? row.correction_history : (typeof row.correction_history === 'string' ? JSON.parse(row.correction_history) : [])
    } as any;
  }

  async getMerchantVerificationsByStatus(status?: string): Promise<MerchantVerificationRecord[]> {
    let sql = \`
      SELECT 
        s.id as shop_id, s.name as shop_name, s.address as shop_address, s.area, s.district, s.category as business_type, s.photo_url as shop_photo_url, s.verification_status as shop_verification_status, s.created_at,
        m.id as merchant_id, m.name as owner_name, m.phone,
        v.id as verification_id, v.verification_status, v.nid_number, v.trade_license_number, v.nid_front_url, v.nid_back_url, v.owner_selfie_url, v.trade_license_url, v.agreement_accepted, v.submitted_at
      FROM shops s
      LEFT JOIN merchants m ON m.shop_id = s.id
      LEFT JOIN merchant_verifications v ON v.shop_id = s.id
    \`;
    const params: any[] = [];
    if (status && status !== 'ALL') {
      sql += \` WHERE UPPER(COALESCE(v.verification_status, s.verification_status, 'PENDING')) = $1\`;
      params.push(status.toUpperCase());
    }
    sql += \` ORDER BY COALESCE(v.submitted_at, s.created_at) DESC\`;
    const res = await query(sql, params);
    
    return res.rows.map(row => ({
      id: row.verification_id || row.shop_id,
      merchantId: row.merchant_id || '',
      shopId: row.shop_id,
      ownerName: row.owner_name || 'No Owner',
      phone: row.phone || 'No Phone',
      shopName: row.shop_name,
      businessType: row.business_type || 'others',
      shopAddress: row.shop_address || row.area || '',
      district: row.district || '',
      upazilaThana: row.area || '',
      shopPhotoUrl: row.shop_photo_url || '',
      verificationStatus: (row.verification_status || row.shop_verification_status || 'PENDING').toUpperCase(),
      nidNumber: row.nid_number || 'Not provided',
      tradeLicenseNumber: row.trade_license_number || 'Not provided',
      nidFrontUrl: row.nid_front_url || '',
      nidBackUrl: row.nid_back_url || '',
      ownerSelfieUrl: row.owner_selfie_url || '',
      tradeLicenseUrl: row.trade_license_url || '',
      agreementAccepted: row.agreement_accepted || true,
      submittedAt: row.submitted_at || row.created_at,
      updatedAt: row.submitted_at || row.created_at,
    } as any));
  }
`;

content = content.substring(0, start1) + replacement + "\n" + content.substring(end2);
fs.writeFileSync('server/db.ts', content);
console.log("DB updated.");
