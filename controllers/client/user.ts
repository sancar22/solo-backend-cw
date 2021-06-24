import { Request, Response } from 'express';
import UserModel from '../../models/user';

const getInfo = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const userID = res.locals.user.id;
    const user = await UserModel.findById(userID)
      .select({ name: 1, email: 1 })
      .lean();
    if (user) {
      delete user._id;
      res.status(200).send(user);
    } else {
      res.status(404).send('user not found');
    }
  } catch (e) {
    res.status(500).send('Internal Server Error!');
  }
};

export default {
  getInfo,
};
