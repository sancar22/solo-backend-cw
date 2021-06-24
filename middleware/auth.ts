import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const jwtSecret = String(process.env.jwtSecret);

interface MyToken {
  name: string;
  user: {
    id: string;
  };
}

export default (req: Request, res: Response, next: NextFunction): void | Response => {
  // Get token from header (protected route)
  const authHeader = req.header('Authorization');

  // Check if no token
  if (!authHeader) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const token = authHeader.split(' ')[1];
<<<<<<< HEAD
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.locals.user = decoded.user;
=======
    const decoded = jwt.verify(token, jwtSecret);
    res.locals.user = (decoded as MyToken).user;
>>>>>>> bf880b00288dc95ed845fb743ac82e1902c8e273
    next();
  } catch (err) {
    if (err.name) {
      console.log(err);
      return res.status(401).send({ msg: 'Token expired!', statusCode: 401 });
    }
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
