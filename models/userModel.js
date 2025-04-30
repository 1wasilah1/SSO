const getConnection = require('../db/oracle');

const UserModel = {
  async findByUsername(username) {
    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        `SELECT id, username, password FROM users WHERE username = :username`,
        [username],
        { outFormat: require('oracledb').OUT_FORMAT_OBJECT }
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (err) {
      console.error('Error fetching user by username:', err);
      throw new Error(`Error fetching user by username: ${err.message}`);
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
  async getUserRole(userId) {
    const conn = await getConnection();
    try {
      const result = await conn.execute(
        `SELECT r.role_name FROM roles r
         JOIN user_roles ur ON r.id = ur.role_id
         WHERE ur.user_id = :userId`,
        { userId },
        { outFormat: require('oracledb').OUT_FORMAT_OBJECT }
      );
  
      return result.rows[0];
    } catch (err) {
      console.error('Error fetching user role:', err);
      throw new Error(`Error fetching user role: ${err.message}`);
    } finally {
      await conn.close();
    }
  },
// Menambahkan fungsi getActiveApps
// userModel.js - mengambil aplikasi aktif
async getActiveApps(userId) {
  let conn;
  try {
    conn = await getConnection();

    const result = await conn.execute(
      `SELECT app_id FROM user_active_apps WHERE user_id = :user_id`,
      [userId],
      { outFormat: require('oracledb').OUT_FORMAT_OBJECT }
    );

    // Periksa hasil query dan pastikan memetakan app_id dengan benar
    console.log('Active apps query result:', result.rows);

    // Menghindari nilai null, pastikan yang dikembalikan adalah array dengan app_id
    return result.rows.map(row => row.APP_ID);  // Pastikan memetakan ke APP_ID
  } catch (err) {
    console.error('Error fetching active apps:', err);
    throw new Error(`Error fetching active apps: ${err.message}`);
  } finally {
    if (conn) {
      await conn.close();
    }
  }
},



async findAll() {
  let conn;
  try {
    conn = await getConnection();

    const result = await conn.execute(
      `SELECT u.id, u.username, u.email, u.password, r.role_name
       FROM users u
       JOIN user_roles ur ON u.id = ur.user_id
       JOIN roles r ON ur.role_id = r.id`,
      [],
      { outFormat: require('oracledb').OUT_FORMAT_OBJECT }
    );

    const users = result.rows;

    // Fetch active apps untuk setiap user
    const finalUsers = [];
    for (let user of users) {
      const activeApps = await this.getActiveApps(user.id);
      finalUsers.push({
        id: user.ID,
        username: user.USERNAME,
        email: user.EMAIL,
        password: user.PASSWORD,
        role: user.ROLE_NAME,
        activeApps: activeApps,
      });
    }

    return finalUsers;
  } catch (err) {
    console.error('Error fetching users:', err);
    throw new Error(`Error fetching users: ${err.message}`);
  } finally {
    if (conn) {
      await conn.close();
    }
  }
},


  async create(user, hashedPassword) {
    const conn = await getConnection();
    try {
      const result = await conn.execute(
        `INSERT INTO users (id, username, password, email)
         VALUES (users_seq.NEXTVAL, :username, :password, :email)
         RETURNING id INTO :id`,
        {
          username: user.username,
          password: hashedPassword,
          email: user.email,
          id: { type: require('oracledb').NUMBER, dir: require('oracledb').BIND_OUT }
        }
      );
      const userId = result.outBinds.id[0];

      await conn.execute(
        `INSERT INTO user_roles (id, user_id, role_id)
         VALUES (user_roles_seq.NEXTVAL, :user_id, :role_id)`,
        { user_id: userId, role_id: user.role_id }
      );

      await conn.commit();
      return userId;
    } catch (err) {
      console.error('Error creating user:', err);
      throw new Error(`Error creating user: ${err.message}`);
    } finally {
      await conn.close();
    }
  },

  async update(id, user) {
    const conn = await getConnection();
    try {
      const roleExists = await conn.execute(
        `SELECT id FROM roles WHERE id = :id`,
        { id: user.role_id }
      );
  
      if (roleExists.rows.length === 0) {
        throw new Error("Role ID not found");
      }
  
      const userFields = [];
      const userBindParams = { id: id };
  
      if (user.password) {
        userFields.push(`password = :password`);
        userBindParams.password = user.password;
      }
  
      if (userFields.length > 0) {
        const sqlUpdateUser = `UPDATE users SET ${userFields.join(', ')} WHERE id = :id`;
        await conn.execute(sqlUpdateUser, userBindParams);
      }
  
      if (user.role_id) {
        const sqlUpdateRole = `UPDATE user_roles SET role_id = :role_id WHERE user_id = :user_id`;
        await conn.execute(sqlUpdateRole, { role_id: user.role_id, user_id: id });
      }
  
      await conn.commit();
    } catch (err) {
      console.error('Error updating user:', err);
      throw new Error(`Error updating user: ${err.message}`);
    } finally {
      await conn.close();
    }
  },  

  async delete(id) {
    const conn = await getConnection();
    try {
      await conn.execute(`DELETE FROM user_roles WHERE user_id = :id`, [id]);
      await conn.execute(`DELETE FROM users WHERE id = :id`, [id]);
      await conn.commit();
    } catch (err) {
      console.error('Error deleting user:', err);
      throw new Error(`Error deleting user: ${err.message}`);
    } finally {
      await conn.close();
    }
  },
// userModel.js - menghapus aplikasi aktif
async removeActiveApp(userId, appId) {
  let conn;
  try {
    conn = await getConnection();

    // Hapus aplikasi dari daftar aktif
    console.log(`Removing app ${appId} from active apps for user ${userId}`);
    await conn.execute(
      `DELETE FROM user_active_apps WHERE user_id = :user_id AND app_id = :app_id`,
      [userId, appId]
    );
    await conn.commit();
    console.log('App removed from active apps');
  } catch (err) {
    console.error('Error removing active app:', err);
    throw new Error(`Error removing active app: ${err.message}`);
  } finally {
    if (conn) {
      await conn.close();
    }
  }
},

  
  
  
// userModel.js - menambahkan aplikasi aktif
async addActiveApp(userId, appId) {
  let conn;
  try {
    conn = await getConnection();

    // Cek apakah aplikasi sudah ada dalam daftar aktif
    const result = await conn.execute(
      `SELECT * FROM user_active_apps WHERE user_id = :user_id AND app_id = :app_id`,
      [userId, appId],
      { outFormat: require('oracledb').OUT_FORMAT_OBJECT }
    );

    // Jika aplikasi belum ada, tambahkan ke daftar aplikasi aktif
    if (result.rows.length === 0) {
      console.log(`App ${appId} is not active, adding to active apps for user ${userId}`);
      await conn.execute(
        `INSERT INTO user_active_apps (user_id, app_id) VALUES (:user_id, :app_id)`,
        [userId, appId]
      );
      await conn.commit();
      console.log('App added to active apps');
    } else {
      console.log(`App ${appId} is already active for user ${userId}`);
    }
  } catch (err) {
    console.error('Error adding active app:', err);
    throw new Error(`Error adding active app: ${err.message}`);
  } finally {
    if (conn) {
      await conn.close();
    }
  }
},

  
async incrementTokenVersion(userId) {
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `UPDATE users SET token_version = token_version + 1 WHERE id = :id`,
      { id: userId }
    );
    // Tidak perlu commit manual, karena execute biasa auto-commit
  } catch (err) {
    console.error('Error incrementing token version:', err);
    throw new Error(`Error incrementing token version: ${err.message}`);
  } finally {
    if (conn) {
      await conn.close();
    }
  }
},


async getTokenVersion(userId) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT token_version FROM users WHERE id = :id`,
      { id: userId },
      { outFormat: require('oracledb').OUT_FORMAT_OBJECT }
    );

    return result.rows.length > 0 ? result.rows[0].TOKEN_VERSION : null;
  } catch (err) {
    console.error('Error getting token version:', err);
    throw new Error(`Error getting token version: ${err.message}`);
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

  


};

module.exports = UserModel;
