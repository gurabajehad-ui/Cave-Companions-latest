import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.SQL_HOST || '127.0.0.1',
  user: process.env.SQL_USER || process.env.SQL_ADMIN_USER || 'postgres',
  password: process.env.SQL_PASSWORD || process.env.SQL_ADMIN_PASSWORD,
  database: process.env.SQL_DB_NAME || 'cloud_sql_development_database',
  port: Number(process.env.SQL_PORT) || 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export async function initPostgresSchema() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(255),
        password_hash TEXT,
        gender VARCHAR(50) NOT NULL DEFAULT 'male',
        age INTEGER,
        marital_status VARCHAR(50),
        is_verified BOOLEAN DEFAULT TRUE,
        photo_url TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
    `);

    // 2. Mosques Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS mosques (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        name_bn VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        area VARCHAR(255) NOT NULL,
        district VARCHAR(255) NOT NULL,
        qr_identifier VARCHAR(255) NOT NULL UNIQUE,
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        imam_name VARCHAR(255),
        contact_number VARCHAR(50)
      );
      CREATE INDEX IF NOT EXISTS idx_mosques_qr ON mosques(qr_identifier);
    `);

    // 3. Prayer Attendances Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS prayer_attendances (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        mosque_id VARCHAR(255) NOT NULL,
        mosque_name VARCHAR(255) NOT NULL,
        prayer_type VARCHAR(50) NOT NULL,
        date VARCHAR(50) NOT NULL,
        verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        status VARCHAR(50) NOT NULL DEFAULT 'verified',
        qr_payload TEXT,
        CONSTRAINT unique_user_daily_prayer UNIQUE (user_id, date, prayer_type)
      );
      CREATE INDEX IF NOT EXISTS idx_att_user_date ON prayer_attendances(user_id, date);
    `);

    // 4. OTPs Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS otps (
        identifier VARCHAR(255) PRIMARY KEY,
        code VARCHAR(50) NOT NULL,
        purpose VARCHAR(100) NOT NULL,
        expires_at BIGINT NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        registration_data JSONB
      );
    `);

    // 5. Tokens Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tokens (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_type VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
        earned_date VARCHAR(50) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        used_at TIMESTAMPTZ,
        redemption_ref VARCHAR(255),
        source_prayer_count INTEGER NOT NULL DEFAULT 3,
        CONSTRAINT unique_user_daily_token UNIQUE (user_id, earned_date)
      );
      CREATE INDEX IF NOT EXISTS idx_tokens_user ON tokens(user_id);
    `);

    // 6. Shops Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS shops (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        name_bn VARCHAR(255) NOT NULL,
        owner_id VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        address TEXT NOT NULL,
        area VARCHAR(255) NOT NULL,
        district VARCHAR(255) NOT NULL,
        latitude DOUBLE PRECISION DEFAULT 0,
        longitude DOUBLE PRECISION DEFAULT 0,
        category VARCHAR(255) NOT NULL,
        description TEXT,
        logo_url TEXT,
        photo_url TEXT,
        opening_hours VARCHAR(255),
        status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
        qr_identifier VARCHAR(255) NOT NULL UNIQUE,
        qr_secret VARCHAR(255) NOT NULL,
        gold_discount NUMERIC DEFAULT 15,
        silver_discount NUMERIC DEFAULT 10,
        bronze_discount NUMERIC DEFAULT 7,
        pending_gold_discount NUMERIC,
        pending_silver_discount NUMERIC,
        pending_bronze_discount NUMERIC,
        commission_rate NUMERIC DEFAULT 3.0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_by VARCHAR(255)
      );
      CREATE INDEX IF NOT EXISTS idx_shops_status ON shops(status);

      CREATE TABLE IF NOT EXISTS commission_change_requests (
        id VARCHAR(255) PRIMARY KEY,
        shop_id VARCHAR(255) NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
        current_commission_percent NUMERIC NOT NULL,
        requested_commission_percent NUMERIC NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        reviewed_at TIMESTAMPTZ,
        reviewed_by VARCHAR(255)
      );
      CREATE INDEX IF NOT EXISTS idx_commission_requests_shop ON commission_change_requests(shop_id);
      CREATE INDEX IF NOT EXISTS idx_commission_requests_status ON commission_change_requests(status);
    `);

    // 7. Merchants Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS merchants (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL UNIQUE,
        pin TEXT NOT NULL,
        shop_id VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'MERCHANT',
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_merchants_phone ON merchants(phone);
    `);

    // 8. Redemptions Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS redemptions (
        id VARCHAR(255) PRIMARY KEY,
        token_id VARCHAR(255) NOT NULL,
        token_type VARCHAR(50) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        user_phone VARCHAR(50) NOT NULL,
        shop_id VARCHAR(255) NOT NULL,
        shop_name VARCHAR(255) NOT NULL,
        merchant_id VARCHAR(255) NOT NULL,
        merchant_name VARCHAR(255) NOT NULL,
        bill_amount NUMERIC NOT NULL,
        discount_percent NUMERIC NOT NULL,
        discount_amount NUMERIC NOT NULL,
        final_amount NUMERIC NOT NULL,
        commission_rate NUMERIC NOT NULL,
        commission_amount NUMERIC NOT NULL,
        merchant_payout_amount NUMERIC NOT NULL,
        redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        date VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED'
      );
      CREATE INDEX IF NOT EXISTS idx_redemptions_user ON redemptions(user_id);
      CREATE INDEX IF NOT EXISTS idx_redemptions_shop ON redemptions(shop_id);
    `);

    // 9. Notifications Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        title_bn VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        message_bn TEXT NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        metadata JSONB
      );
      CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id);
    `);

    // 10. Support Tickets Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id VARCHAR(255) PRIMARY KEY,
        ticket_number VARCHAR(100) NOT NULL UNIQUE,
        user_id VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        user_phone VARCHAR(50) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        category VARCHAR(100) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
        priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        messages JSONB DEFAULT '[]',
        admin_notes TEXT,
        resolution TEXT
      );
    `);

    // 11. Admin Accounts Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_accounts (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'ADMIN',
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        permissions JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_by VARCHAR(255)
      );
    `);

    // 12. Audit Logs Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(255) PRIMARY KEY,
        admin_id VARCHAR(255) NOT NULL,
        admin_email VARCHAR(255) NOT NULL,
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(100) NOT NULL,
        resource_id VARCHAR(255),
        details JSONB,
        ip_address VARCHAR(100),
        timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 13. Global Config Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS global_config (
        key VARCHAR(100) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 14. Nasiha Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS nasiha (
        id VARCHAR(255) PRIMARY KEY,
        text_bn TEXT NOT NULL,
        source_bn TEXT NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 15. Cave Circles Tables
    await client.query(`
        CREATE TABLE IF NOT EXISTS circles (
            id VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            admin_id VARCHAR(255) NOT NULL REFERENCES users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_circles_admin ON circles(admin_id);

        CREATE TABLE IF NOT EXISTS circle_members (
            id VARCHAR(255) PRIMARY KEY,
            circle_id VARCHAR(255) NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
            user_id VARCHAR(255) NOT NULL REFERENCES users(id),
            role VARCHAR(50) DEFAULT 'MEMBER',
            joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            status VARCHAR(50) DEFAULT 'ACTIVE',
            UNIQUE(circle_id, user_id)
        );
        CREATE INDEX IF NOT EXISTS idx_circle_members_circle ON circle_members(circle_id);
        CREATE INDEX IF NOT EXISTS idx_circle_members_user ON circle_members(user_id);

        CREATE TABLE IF NOT EXISTS circle_invites (
            id VARCHAR(255) PRIMARY KEY,
            circle_id VARCHAR(255) NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
            invite_code VARCHAR(100) NOT NULL UNIQUE,
            created_by VARCHAR(255) NOT NULL REFERENCES users(id),
            expires_at TIMESTAMP WITH TIME ZONE,
            revoked_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_circle_invites_code ON circle_invites(invite_code);

        CREATE TABLE IF NOT EXISTS circle_challenges (
            id VARCHAR(255) PRIMARY KEY,
            circle_id VARCHAR(255) NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            challenge_type VARCHAR(100) NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            created_by VARCHAR(255) NOT NULL REFERENCES users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_circle_challenges_circle ON circle_challenges(circle_id);
    `);

    await client.query('COMMIT');
    console.log('[PostgreSQL] Schema initialized successfully.');

    // Now seed data from database.json only if explicitly requested via SEED_DB=true
    if (process.env.SEED_DB === 'true') {
      await seedFromDatabaseJson(client);
    } else {
      console.log('[PostgreSQL] SEED_DB is not true (default). Skipping database.json seeding in production/runtime.');
    }

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[PostgreSQL] Schema initialization error:', err);
    throw err;
  } finally {
    client.release();
  }
}

async function seedFromDatabaseJson(client: pg.PoolClient) {
  if (process.env.SEED_DB !== 'true') {
    return;
  }
  const dbPath = path.join(process.cwd(), 'data', 'database.json');
  if (!fs.existsSync(dbPath)) return;

  const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  // 1. Seed Users
  if (Array.isArray(data.users)) {
    for (const u of data.users) {
      await client.query(`
        INSERT INTO users (id, full_name, phone, email, password_hash, gender, age, marital_status, is_verified, photo_url, status, created_at, last_login_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (phone) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          password_hash = EXCLUDED.password_hash,
          last_login_at = EXCLUDED.last_login_at
      `, [
        u.id, u.fullName || u.name, u.phone, u.email || null, u.passwordHash || null,
        u.gender || 'male', u.age || null, u.maritalStatus || null, u.isVerified !== false,
        u.photoUrl || null, u.status || 'active', u.createdAt || new Date().toISOString(),
        u.lastLoginAt || new Date().toISOString()
      ]);
    }
  }

  // 2. Seed Mosques
  if (Array.isArray(data.mosques)) {
    for (const m of data.mosques) {
      await client.query(`
        INSERT INTO mosques (id, name, name_bn, address, area, district, qr_identifier, status, created_at, imam_name, contact_number)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO NOTHING
      `, [
        m.id, m.name, m.nameBn || m.name, m.address, m.area, m.district,
        m.qrIdentifier, m.status || 'active', m.createdAt || new Date().toISOString(),
        m.imamName || null, m.contactNumber || null
      ]);
    }
  }

  // 3. Seed Attendances
  if (Array.isArray(data.attendances)) {
    for (const a of data.attendances) {
      await client.query(`
        INSERT INTO prayer_attendances (id, user_id, mosque_id, mosque_name, prayer_type, date, verified_at, status, qr_payload)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (user_id, date, prayer_type) DO NOTHING
      `, [
        a.id, a.userId, a.mosqueId, a.mosqueName, a.prayerType, a.date,
        a.verifiedAt || new Date().toISOString(), a.status || 'verified', a.qrPayload || ''
      ]);
    }
  }

  // 4. Seed Shops
  if (Array.isArray(data.shops)) {
    for (const s of data.shops) {
      await client.query(`
        INSERT INTO shops (id, name, name_bn, owner_id, phone, address, area, district, latitude, longitude, category, description, logo_url, photo_url, opening_hours, status, qr_identifier, qr_secret, gold_discount, silver_discount, bronze_discount, commission_rate, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
        ON CONFLICT (id) DO NOTHING
      `, [
        s.id, s.name, s.nameBn || s.name, s.ownerId, s.phone, s.address, s.area, s.district,
        s.latitude || 0, s.longitude || 0, s.category, s.description || '', s.logoUrl || null, s.photoUrl || null,
        s.openingHours || '', s.status || 'ACTIVE', s.qrIdentifier, s.qrSecret,
        s.goldDiscount ?? 15, s.silverDiscount ?? 10, s.bronzeDiscount ?? 7, s.commissionRate ?? 3.0,
        s.createdAt || new Date().toISOString(), s.updatedAt || new Date().toISOString()
      ]);
    }
  }

  // 5. Seed Merchants
  if (Array.isArray(data.merchants)) {
    for (const m of data.merchants) {
      await client.query(`
        INSERT INTO merchants (id, name, phone, pin, shop_id, role, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (phone) DO NOTHING
      `, [
        m.id, m.name, m.phone, m.pin, m.shopId, m.role || 'MERCHANT',
        m.status || 'active', m.createdAt || new Date().toISOString()
      ]);
    }
  }

  // 6. Seed Nasiha
  if (Array.isArray(data.nasiha)) {
    for (const n of data.nasiha) {
      await client.query(`
        INSERT INTO nasiha (id, text_bn, source_bn, active, created_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO NOTHING
      `, [
        n.id, n.textBn, n.sourceBn || '', n.active !== false, n.createdAt || new Date().toISOString()
      ]);
    }
  }

  // 7. Seed Admin Accounts
  if (Array.isArray(data.adminAccounts)) {
    for (const adm of data.adminAccounts) {
      await client.query(`
        INSERT INTO admin_accounts (id, email, name, role, status, permissions, created_at, last_login_at, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (email) DO NOTHING
      `, [
        adm.id, adm.email, adm.name, adm.role || 'ADMIN', adm.status || 'active',
        JSON.stringify(adm.permissions || []), adm.createdAt || new Date().toISOString(),
        adm.lastLoginAt || new Date().toISOString(), adm.createdBy || null
      ]);
    }
  }

  // 8. Seed Global Config
  if (data.globalConfig) {
    await client.query(`
      INSERT INTO global_config (key, value, updated_at)
      VALUES ('platform_rates', $1, NOW())
      ON CONFLICT (key) DO NOTHING
    `, [JSON.stringify(data.globalConfig)]);
  }

  console.log('[PostgreSQL] Seeded initial data from database.json into PostgreSQL successfully.');
}
