import { query } from './server/pg';
export async function getAdminPartnerShopsCombined(status?: string) {
  let sql = `
    SELECT 
      s.id as shop_id,
      s.name as shop_name,
      s.address as shop_address,
      s.area,
      s.district,
      s.category as business_type,
      s.photo_url as shop_photo_url,
      s.verification_status as shop_verification_status,
      m.id as merchant_id,
      m.name as owner_name,
      m.phone,
      v.id as verification_id,
      v.verification_status,
      v.nid_number,
      v.trade_license_number
    FROM shops s
    LEFT JOIN merchants m ON m.shop_id = s.id
    LEFT JOIN merchant_verifications v ON v.shop_id = s.id
  `;
  const params: any[] = [];
  if (status && status !== 'ALL') {
    sql += ` WHERE UPPER(COALESCE(v.verification_status, s.verification_status)) = $1`;
    params.push(status.toUpperCase());
  }
  sql += ` ORDER BY s.created_at DESC`;
  const res = await query(sql, params);
  
  return res.rows.map(row => ({
    id: row.verification_id || row.shop_id,
    merchantId: row.merchant_id || '',
    shopId: row.shop_id,
    ownerName: row.owner_name || 'No Owner',
    phone: row.phone || 'No Phone',
    shopName: row.shop_name,
    businessType: row.business_type || 'General',
    shopAddress: row.shop_address || row.area || '',
    district: row.district || '',
    upazilaThana: row.area || '',
    shopPhotoUrl: row.shop_photo_url || '',
    verificationStatus: (row.verification_status || row.shop_verification_status || 'PENDING').toUpperCase(),
    nidNumber: row.nid_number || '',
    tradeLicenseNumber: row.trade_license_number || '',
    // Just mock the rest for the list view
    nidFrontUrl: '', nidBackUrl: '', ownerSelfieUrl: '', tradeLicenseUrl: '', agreementAccepted: true
  }));
}

async function run() {
  console.log(await getAdminPartnerShopsCombined());
  process.exit(0);
}
run();
