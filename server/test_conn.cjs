const mysql = require('mysql2/promise');

async function test(user, password) {
  try {
    const conn = await mysql.createConnection({
      host: '127.0.0.1',
      user: user,
      password: password,
      database: 'shaakti'
    });
    console.log(`Success with ${user}:${password}`);
    await conn.end();
  } catch (err) {
    console.log(`Failed for ${user}:${password} - ${err.message}`);
  }
}

async function run() {
  await test('shaakti123', '');
  await test('shaakti123', 'shaakti123');
  await test('root', '');
  await test('root', 'root');
}

run();
