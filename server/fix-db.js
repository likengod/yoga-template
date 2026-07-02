const mysql = require('mysql2/promise');

async function run() {
  try {
    console.log('Connecting to MySQL...');
    const conn = await mysql.createConnection({ host: '127.0.0.1', user: 'root', password: '' });
    
    console.log('Running ALTER USER commands...');
    await conn.query("ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';");
    await conn.query("ALTER USER 'root'@'127.0.0.1' IDENTIFIED WITH mysql_native_password BY '';");
    await conn.query("FLUSH PRIVILEGES;");
    
    console.log('Fixed DB auth plugin successfully');
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}

run();
