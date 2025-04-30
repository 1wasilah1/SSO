const oracledb = require('oracledb');
require('dotenv').config();

// Setup optional untuk mengoptimalkan
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = false;

// Fungsi untuk konek ke database
async function getConnection() {
    try {
      console.log('Attempting to connect to Oracle DB...');
      const conn = await oracledb.getConnection({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        connectString: process.env.DB_CONNECT_STRING
      });
      console.log('Successfully connected to Oracle DB');
      return conn;
    } catch (err) {
      console.error('Error connecting to Oracle DB:', err);
      throw err;
    }
  }
  

module.exports = getConnection;
