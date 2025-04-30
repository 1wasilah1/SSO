const oracledb = require('oracledb');
const getConnection = require('./db/oracle');

// Test koneksi
async function testConnection() {
  try {
    const connection = await getConnection();
    console.log('Connection to Oracle DB successful!');
    await connection.close();
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

testConnection();
