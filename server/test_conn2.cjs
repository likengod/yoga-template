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
  await test('shaakti123', '12345');
  await test('shaakti123', '123456');
  await test('root', '12345');
  await test('root', '123456');
  await test('username', '12345');
}

run();
