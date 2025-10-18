import { Request, Response, NextFunction } from 'express';
import {
  checkEmailOtpRestriction,
  sendOtp,
  trackOtpRestriction,
  validationRegistrationData,
} from '../utils/auth.helper';
import prisma from 'packages/libs/prisma';
import { ValidationError } from '@geschaft/handler';

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
    const existingUser = prisma.users.findUnique({ where: email });

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
