const getConnection = require('../db/oracle');

const AppsActiveModel = {
  // Menambahkan aplikasi yang sedang diakses oleh pengguna
  async addAppToActive(userId, appId) {
    const conn = await getConnection();
    try {
      await conn.execute(
        `INSERT INTO apps_active (id, user_id, app_id)
         VALUES (apps_active_seq.NEXTVAL, :user_id, :app_id)`,
        { user_id: userId, app_id: appId },
        { autoCommit: true }
      );
    } catch (err) {
      console.error('Error adding app to active:', err);
      throw new Error(`Error adding app to active: ${err.message}`);
    } finally {
      await conn.close();
    }
  },

  // Menghapus aplikasi yang tidak lagi diakses oleh pengguna
  async removeAppFromActive(userId, appId) {
    const conn = await getConnection();
    try {
      await conn.execute(
        `DELETE FROM apps_active WHERE user_id = :user_id AND app_id = :app_id`,
        { user_id: userId, app_id: appId },
        { autoCommit: true }
      );
    } catch (err) {
      console.error('Error removing app from active:', err);
      throw new Error(`Error removing app from active: ${err.message}`);
    } finally {
      await conn.close();
    }
  },

  // Mengambil daftar aplikasi yang sedang diakses oleh pengguna
  async getUserActiveApps(userId) {
    const conn = await getConnection();
    try {
      const result = await conn.execute(
        `SELECT a.app_name, aa.active_since
         FROM apps_active aa
         JOIN apps a ON aa.app_id = a.id
         WHERE aa.user_id = :user_id`,
        { user_id: userId },
        { outFormat: require('oracledb').OUT_FORMAT_OBJECT }
      );
      return result.rows.map(row => row.app_id); // hanya mengembalikan app_id
    } catch (err) {
      console.error('Error fetching active apps for user:', err);
      throw new Error(`Error fetching active apps for user: ${err.message}`);
    } finally {
      await conn.close();
    }
  }
};

module.exports = AppsActiveModel;
