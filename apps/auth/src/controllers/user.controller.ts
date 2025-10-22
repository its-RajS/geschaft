import { Request, Response, NextFunction } from 'express';
import {
  checkEmailOtpRestriction,
  sendOtp,
  trackOtpRestriction,
  validationRegistrationData,
  verifyOtp,
} from '../utils/auth.helper';
import prisma from '@geschaft/libs/prisma';
import { AuthenticationError, ValidationError } from '@geschaft/handler';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //? validate user data helper func.
    validationRegistrationData(req.body, 'user');

    const { name, email } = req.body;

    //? Check existing user with prisma helper function
    const existingUser = await prisma.user.findFirst({ where: { email } });

    if (existingUser)
      return next(new ValidationError('User already exists with this email'));

    //! New user email-otp restriction for adv. security
    await checkEmailOtpRestriction(email, next);
    await trackOtpRestriction(email, next);

    //? send the otp mail
    await sendOtp(name, email, 'user-activation-template');
  } catch (error) {
    return next(error);
  }
};

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, otp } = req.body;

    if (!name || !email || !password || !otp) {
      return next(new ValidationError('All the fields are required!'));
    }

    //? Check existing user with prisma helper function
    const existingUser = await prisma.user.findFirst({ where: { email } });

    if (existingUser)
      return next(new ValidationError('User already exists with this email'));

    await verifyOtp(email, otp, next);
    const hashPassword = await bcrypt.hash(password, 10);

    //? Create a new User in the database
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword,
      },
    });

    res.status(201).json({
      success: 'true',
      message: 'User registered successfully!',
      newUser: {
        name,
        email,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ValidationError('Email and password both are required!'));
    }

    //* get user from db
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) return next(new AuthenticationError(`User doesn't exists!`));
    if (!user.password)
      return next(new AuthenticationError(`Password is required`));

    //* verify the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return next(new AuthenticationError(`Invalid email or password`));

    //? Generate access and refresh token
    //* access token
    const accessToken = jwt.sign(
      {
        id: user.id,
        role: 'user',
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: '15m',
      }
    );
    //* refresh token
    const refreshToken = jwt.sign(
      {
        id: user.id,
        role: 'user',
      },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: '7d',
      }
    );
  } catch (error) {
    return next(error);
  }
};
