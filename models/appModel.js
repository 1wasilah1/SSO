// models/appModel.js
const getConnection = require('../db/oracle');

const AppModel = {
  // Menambahkan aplikasi baru
  async create(appData) {
    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        `INSERT INTO apps (id, name, description)
         VALUES (apps_seq.NEXTVAL, :name, :description)
         RETURNING id INTO :id`,
        {
          name: appData.name,
          description: appData.description,
          id: { type: require('oracledb').NUMBER, dir: require('oracledb').BIND_OUT }
        }
      );
      const appId = result.outBinds.id[0];
      await conn.commit();
      return appId;
    } catch (err) {
      console.error('Error creating app:', err);
      throw new Error(`Error creating app: ${err.message}`);
    } finally {
      if (conn) {
        try {
          await conn.close();
        } catch (err) {
          console.error('Error closing connection:', err);
        }
      }
    }
  },

  // Mengambil semua aplikasi
  async findAll() {
    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        `SELECT id, name, description, created_at, updated_at FROM apps`,
        [],
        { outFormat: require('oracledb').OUT_FORMAT_OBJECT }
      );
      return result.rows;
    } catch (err) {
      console.error('Error fetching apps:', err);
      throw new Error(`Error fetching apps: ${err.message}`);
    } finally {
      if (conn) {
        try {
          await conn.close();
        } catch (err) {
          console.error('Error closing connection:', err);
        }
      }
    }
  },

  // Mengambil aplikasi berdasarkan ID
  async findById(id) {
    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        `SELECT id, name, description, created_at, updated_at FROM apps WHERE id = :id`,
        [id],
        { outFormat: require('oracledb').OUT_FORMAT_OBJECT }
      );
      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0];
    } catch (err) {
      console.error('Error fetching app by ID:', err);
      throw new Error(`Error fetching app by ID: ${err.message}`);
    } finally {
      if (conn) {
        try {
          await conn.close();
        } catch (err) {
          console.error('Error closing connection:', err);
        }
      }
    }
  },

  // Mengupdate aplikasi
  async update(id, appData) {
    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        `UPDATE apps
         SET name = :name, description = :description, updated_at = SYSDATE
         WHERE id = :id`,
        {
          id: id,
          name: appData.name,
          description: appData.description
        }
      );
      await conn.commit();
      return result.rowsAffected > 0;
    } catch (err) {
      console.error('Error updating app:', err);
      throw new Error(`Error updating app: ${err.message}`);
    } finally {
      if (conn) {
        try {
          await conn.close();
        } catch (err) {
          console.error('Error closing connection:', err);
        }
      }
    }
  },

  // Menghapus aplikasi berdasarkan ID
  async delete(id) {
    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        `DELETE FROM apps WHERE id = :id`,
        [id]
      );
      await conn.commit();
      return result.rowsAffected > 0;
    } catch (err) {
      console.error('Error deleting app:', err);
      throw new Error(`Error deleting app: ${err.message}`);
    } finally {
      if (conn) {
        try {
          await conn.close();
        } catch (err) {
          console.error('Error closing connection:', err);
        }
      }
    }
  }
};

module.exports = AppModel;
