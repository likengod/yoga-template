const mysql = require('mysql2/promise');

async function test() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'shakti_yoga'
    });
    console.log('Successfully connected using mysql2!');
    const [rows, fields] = await connection.execute('SELECT 1');
    console.log(rows);
    
    // Try to fix the auth plugin for Prisma
    await connection.execute("ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';");
    await connection.execute("FLUSH PRIVILEGES;");
    console.log('Successfully altered user to use mysql_native_password.');
    
    await connection.end();
  } catch (error) {
    console.error('Connection failed:', error.message);
  }
}
test();
