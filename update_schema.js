const fs = require('fs');
let content = fs.readFileSync('server/pgInit.ts', 'utf8');

const tableCreationSQL = `
      // Advertisement Management System
      await client.query(\`
        CREATE TABLE IF NOT EXISTS advertisements (
          id VARCHAR(50) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          sponsor_name VARCHAR(255),
          description TEXT,
          image_url VARCHAR(1000) NOT NULL,
          ad_type VARCHAR(50) DEFAULT 'BANNER',
          destination_type VARCHAR(50) DEFAULT 'NONE',
          destination_id VARCHAR(255),
          external_url VARCHAR(1000),
          start_at TIMESTAMP WITH TIME ZONE,
          end_at TIMESTAMP WITH TIME ZONE,
          status VARCHAR(20) DEFAULT 'ACTIVE',
          created_by VARCHAR(50),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      \`);

      await client.query(\`
        CREATE TABLE IF NOT EXISTS advertisement_display_locations (
          id VARCHAR(50) PRIMARY KEY,
          advertisement_id VARCHAR(50) REFERENCES advertisements(id) ON DELETE CASCADE,
          page_name VARCHAR(50) NOT NULL,
          placement_slot VARCHAR(50) NOT NULL,
          display_size VARCHAR(20) DEFAULT 'MEDIUM',
          space_profile VARCHAR(20) DEFAULT 'STANDARD',
          width_profile VARCHAR(20) DEFAULT 'FULL',
          height_profile VARCHAR(20) DEFAULT 'STANDARD',
          priority INTEGER DEFAULT 10,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(advertisement_id, page_name, placement_slot)
        );
      \`);

      await client.query(\`
        CREATE TABLE IF NOT EXISTS advertisement_page_settings (
          id VARCHAR(50) PRIMARY KEY,
          page_name VARCHAR(50) NOT NULL,
          placement_slot VARCHAR(50),
          max_ads INTEGER DEFAULT 3,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(page_name, placement_slot)
        );
      \`);
`;

if (!content.includes('CREATE TABLE IF NOT EXISTS advertisements')) {
  // Insert before the commit statement or catch block
  content = content.replace(/(\s*)(await client\.query\(`\s*CREATE INDEX IF NOT EXISTS)/, tableCreationSQL + "$1$2");
  fs.writeFileSync('server/pgInit.ts', content);
  console.log('Added advertisement tables to pgInit.ts');
} else {
  console.log('Advertisement tables already exist in pgInit.ts');
}
