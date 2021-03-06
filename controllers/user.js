const User = require('../models/user');

exports.getInfo = async (req, res) => {
  try {
    const userID = req.user.id;
    const user = await User.findById(userID)
      .select({ name: 1, email: 1 })
      .lean();
    delete user._id;
    res.status(200).send(user);
  } catch (e) {
    res.status(500).send('Internal Server Error!');
  }
};

// This will give information in a way that can be read by the tables in the admin page
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    if (!users) return res.send('No users are available!');
    const filteredKeys = [
      {
        field: 'email',
        headerName: 'Email',
        type: 'string',
        required: true,
      },
      { field: 'name', headerName: 'Name', type: 'string', required: true },
      { field: 'options', headerName: 'Options' },
    ];
    const tableOptions = { show: true, edit: false, delete: false };
    const entityName = 'client';
    const categoryName = 'Client';

    res.status(200).send({
      keysLabel: filteredKeys,
      allInfo: users,
      tableOptions,
      entityName,
      categoryName,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.send('User does not exist!');
    const filteredKeys = [
      {
        field: 'email',
        headerName: 'Email',
        type: 'string',
        required: true,
      },
      { field: 'name', headerName: 'Name', type: 'string', required: true },
      { field: 'options', headerName: 'Options' },
    ];
    const tableOptions = { show: true, edit: false, delete: false };
    const entityName = 'client';
    const categoryName = 'Client';

    res.status(200).send({
      keysLabel: filteredKeys,
      allInfo: user,
      tableOptions,
      entityName,
      categoryName,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};
