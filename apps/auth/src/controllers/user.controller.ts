import { Request, Response, NextFunction } from 'express';
import { validationRegistrationData } from '../utils/auth.helper';
import prisma from 'packages/libs/prisma';
import { ValidationError } from '@geschaft/handler';

export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //? validate user data helper func.
  validationRegistrationData(req.body, 'user');

  const { name, email } = req.body;

  //? Check existing user with prisma helper function
  const existingUser = prisma.users.findUnique({ where: email });

  if (existingUser)
    return next(
      new ValidationError('invalid req data', {
        field: `email: ${email} `,
        message: 'User already exists with this email',
      })
    );

  //! New user email-otp restriction for DDOS attack
  await checkEmailOtpRestriction(email, next);
};
