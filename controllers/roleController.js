const RoleModel = require('../models/roleModel');

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await RoleModel.findAll();
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createRole = async (req, res) => {
  try {
    await RoleModel.create(req.body.role_name);
    res.status(201).json({ message: 'Role created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const id = req.params.id;
    const { role_name } = req.body;
    await RoleModel.update(id, role_name);
    res.json({ message: 'Role updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const id = req.params.id;
    await RoleModel.delete(id);
    res.json({ message: 'Role deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
