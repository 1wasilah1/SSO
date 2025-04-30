const getConnection = require('../db/oracle');

const RoleModel = {
  async findAll() {
    const conn = await getConnection();
    const result = await conn.execute(
      `SELECT id, role_name FROM roles`,
      [],
      { outFormat: require('oracledb').OUT_FORMAT_OBJECT }
    );
    await conn.close();
    return result.rows;
  },

  async create(role_name) {
    const conn = await getConnection();
    await conn.execute(
      `INSERT INTO roles (id, role_name) VALUES (roles_seq.NEXTVAL, :role_name)`,
      [role_name]
    );
    await conn.commit();
    await conn.close();
  },

  async update(id, roleName) {
    const conn = await getConnection();
    await conn.execute(
      `UPDATE roles SET role_name = :role_name WHERE id = :id`,
      { role_name: roleName, id }
    );
    await conn.commit();
    await conn.close();
  },

  async delete(id) {
    const conn = await getConnection();
    await conn.execute(
      `DELETE FROM roles WHERE id = :id`,
      { id }
    );
    await conn.commit();
    await conn.close();
  }
};

module.exports = RoleModel;
