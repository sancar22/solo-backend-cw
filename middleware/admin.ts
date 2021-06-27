import { Request, Response, NextFunction } from 'express';
import AdminModel from '../models/admin';

export default async (req: Request, res: Response, next: NextFunction): Promise<void|Response> => {
  // Get user id attached by jwt middleware in the request and verify if it's an id of an admin
  const userID = res.locals.user.id;
  const isAdmin = await AdminModel.findById(userID);

  // Check if no token
  if (!isAdmin) {
    return res.status(401).json({ msg: 'Not an admin user!' });
  }
  next();
};
