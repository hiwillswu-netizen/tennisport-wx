const mysql = require('mysql2/promise');
const fs = require('fs');

async function main() {
  const envContent = fs.readFileSync('.env', 'utf-8');
  const match = envContent.match(/DATABASE_URL=(.+)/);
  if (!match) {
    console.error('DATABASE_URL not found');
    process.exit(1);
  }
  
  const url = match[1].trim();
  console.log('Connecting to database...');
  
  const conn = await mysql.createConnection(url);
  
  // 查看所有用户
  const [rows] = await conn.execute('SELECT id, name, email, role, unionId FROM users');
  console.log(`\n共有 ${rows.length} 个用户:`);
  rows.forEach(r => {
    console.log(`  ID: ${r.id}, Name: ${r.name}, Role: ${r.role}`);
  });
  
  // 将所有用户设为管理员
  if (rows.length > 0) {
    for (const row of rows) {
      await conn.execute("UPDATE users SET role = 'admin' WHERE id = ?", [row.id]);
    }
    
    const [updated] = await conn.execute('SELECT id, name, role FROM users');
    console.log('\n已更新为管理员:');
    updated.forEach(r => {
      console.log(`  ID: ${r.id}, Name: ${r.name}, Role: ${r.role}`);
    });
  }
  
  await conn.end();
  console.log('\n✅ 所有用户已设为管理员！现在可以访问 /admin 了');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
