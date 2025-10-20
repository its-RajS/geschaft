import { Request, Response, NextFunction } from 'express';
import {
  checkEmailOtpRestriction,
  sendOtp,
  trackOtpRestriction,
  validationRegistrationData,
  verifyOtp,
} from '../utils/auth.helper';
import prisma from '@geschaft/libs/prisma';
import { ValidationError } from '@geschaft/handler';
import bcrypt from 'bcryptjs';

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
