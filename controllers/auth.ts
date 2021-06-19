import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import Stripe from 'stripe';
import UserModel from '../models/user';
import {User} from '../models/user';
import AdminModel from '../models/admin';
import validateEmail from '../utils/index';

import {Request, Response} from 'express';

const { secretAPITestStripe } = process.env;
const secret = `${secretAPITestStripe}`;

const { jwtSecret } = process.env;
const jwtsecret = `${jwtSecret}`;

interface MyToken {
  name: string;
  user: {
    id: string;
  };
  // whatever else is in the JWT.
}

interface MyIForgotToken {
  name: string;
  user: {
    id: string;
    code: number;
  };
  // whatever else is in the JWT.
}

const stripe = new Stripe(secret, {
  apiVersion: '2020-08-27',
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.emailProvider,
    pass: process.env.emailPW,
  },
});

const loginFunction = async (email: string, password: string, res: Response, admin: boolean) => {
  const user = !admin
    ? await UserModel.findOne({ email })
    : await AdminModel.findOne({ email });
  if (!user) return res.status(401).send('Invalid username or password!');
  const hashedUserPW = user.password;
  const isMatch = await bcrypt.compare(password, hashedUserPW);
  if (!isMatch) return res.status(401).send('Invalid username or password!');
  const isUser = (input: any): input is User => 'verified' in input;
  if (isUser(user) && !user.verified)
    return res.status(401).send('You need to verify your account!');

  const userPayload = {
    user: {
      id: user._id,
    },
  };

  jwt.sign(
    userPayload,
    jwtsecret,
    { expiresIn: 3600 },
    (err, token) => {
      if (err) throw err;
      res.status(200).json({ token });
    }
  );
};


export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    await loginFunction(email, password, res, false);
  } catch (e) {
    res.status(500).send('Internal Server Error!');
  }
};

export const loginAdmin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    await loginFunction(email, password, res, true);
  } catch (e) {
    res.status(500).send('Internal Server Error!');
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, passwordRepeat } = req.body;
    // Backend validation just in case
    if (name.length === 0) {
      return res.status(400).send('You should insert a name!');
    }
    if (!validateEmail(email)) {
      return res.status(400).send('Email is not valid!');
    }
    const user = await UserModel.findOne({ email });
    if (user) {
      return res.status(409).send('User already exists!');
    }
    if (password.length < 6) {
      return res
        .status(400)
        .send('Password should be at least 6 characters long!');
    }
    if (password !== passwordRepeat) {
      return res.status(400).send("Passwords don't match!");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const customer = await stripe.customers.create({ name: email });
    const newUser = await UserModel.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      stripeID: customer.id,
    });

    const payload = {
      user: {
        id: newUser._id,
      },
    };

    jwt.sign(
      payload,
      jwtsecret,
      { expiresIn: '9999 years' },
      async (err, token) => {
        if (err) throw err;
        res.status(201).send('User created successfully!');
        const output = `
        <h2>Please click on the following link to verify your account!</h2>
        <p>${process.env.serverURL}/auth/confirmation/${token}</p>
        `;
        await transporter.sendMail({
          to: email,
          subject: 'Account Verfication - Devcademy',
          html: output,
        });
      }
    );
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const decodedJWT = jwt.verify(req.params.token, jwtsecret);
    const userID = (decodedJWT as MyToken).user.id;
    const user = await UserModel.findById(userID);
    const isUser = (input: any): input is User => 'verified' in input;
    if (isUser(user) && !user.verified) {
      await UserModel.updateOne(
        { _id: userID },
        {
          $set: { verified: true },
        }
      );
      return res.status(200).send('Verified successfully!');
    }
    return res.status(200).send('User is already verified!');
  } catch (e) {
    res.status(500).send('Internal Server Error!');
  }
};

export const forgotPW = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(200).send('Email was sent (if it exists) with a code!');

    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const payload = {
      user: {
        id: user._id,
        code: randomNumber,
      },
    };
    jwt.sign(
      payload,
      jwtsecret,
      { expiresIn: 60 },
      async (err, token) => {
        if (err) throw err;
        await UserModel.updateOne(
          { _id: user._id },
          {
            $set: { forgotPWToken: token },
          }
        );
        res.send('Email was sent (if it exists) with a code!');
        const output = `
        <h2>Your code to reset your password is the following: ${randomNumber}</h2>
        <p><b>NOTE: </b> The code will expire in 1 (one) minute.</p>
        `;
        await transporter.sendMail({
          to: email,
          subject: 'Change password code - Devcademy',
          html: output,
        });
      }
    );
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

export const verifyPWCodeChange = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).send('Invalid code!');
    const decodedJWTCode = jwt.verify(
      user.forgotPWToken,
      jwtsecret
    );
    if ((decodedJWTCode as MyIForgotToken).user.code !== code)
      return res.status(401).send('Invalid code!');

    const payload = {
      user: {
        id: user._id,
      },
    };
    // 2 minutes to change pw
    jwt.sign(
      payload,
      jwtsecret,
      { expiresIn: 120 },
      async (err, token) => {
        if (err) throw err;
        res.status(200).send({ token });
      }
    );
  } catch (e) {
    if (e.name) {
      console.log(e);
      return res.status(401).send('Token expired!');
    }
    res.status(500).send('Internal Server Error!');
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { password, passwordRepeat } = req.body;
    if (password.length < 6) {
      return res
        .status(400)
        .send('Password should be at least 6 characters long!');
    }
    if (password !== passwordRepeat) {
      return res.status(400).send("Passwords don't match!");
    }
    const userID = res.locals.user.id;
    const salt = await bcrypt.genSalt(10);
    const newPassword = await bcrypt.hash(password, salt);
    await UserModel.updateOne(
      { _id: userID },
      {
        $set: { password: newPassword },
      }
    );
    return res.status(200).send('Password changed succesfully!');
  } catch (e) {
    res.status(500).send({ msg: 'Internal server error!', statusCode: 500 });
  }
};

export const changePasswordInApp = async (req: Request, res: Response) => {
  try {
    const userID = res.locals.user.id;
    const user = await UserModel.findById(userID);
    const { oldPassword, password, passwordRepeat } = req.body;
    if (user) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(401).send('Current password is not correct!');
      }
      if (password.length < 6) {
        return res
          .status(400)
          .send('Password should be at least 6 characters long!');
      }
      if (password !== passwordRepeat) {
        return res.status(400).send("Passwords don't match!");
      }
      const isMatchOldAndNew = await bcrypt.compare(password, user.password);
      if (isMatchOldAndNew) {
        return res
          .status(401)
          .send('New password cannot be the same as current one!');
      }
      const salt = await bcrypt.genSalt(10);
      const newPassword = await bcrypt.hash(password, salt);
      await UserModel.updateOne(
        { _id: userID },
        {
          $set: { password: newPassword },
        }
      );
      return res.status(204).send('Password changed succesfully!');
    }
    return res.status(404).send('User not found!');
  } catch (e) {
    console.log(e);
    res.status(500).send({ msg: 'Internal server error!', statusCode: 500 });
  }
};

