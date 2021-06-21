import {Request, Response} from 'express';
import User from '../../models/user';


const getAllUsers = async (req: Request, res: Response) => {
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

const getUserById = async (req: Request, res: Response) => {
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


export default {
  getAllUsers, getUserById
}