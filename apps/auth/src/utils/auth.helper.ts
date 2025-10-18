// ! As we need user registratioon for seller and customer

import crypto from 'crypto';
import { ValidationError } from '@geschaft/handler';
import { NextFunction } from 'express';
import redis from 'packages/libs/redis';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validationRegistrationData = (
  data: any,
  userType: 'user' | 'seller'
) => {
  const { name, email, password, phone_number, country } = data;

  if (
    !name ||
    !email ||
    !password ||
    (userType === 'seller' && (!phone_number || !country))
  ) {
    throw new ValidationError(`invalid req data`, {
      field: `${!name ? name : ''} ${!email ? email : ''} ${
        !password ? password : ''
      } ${!phone_number ? phone_number : ''} ${!country ? country : ''}  `,
      message: `Invalid format`,
    });
  }

  if (!emailRegex.test(email)) {
    throw new ValidationError('invalid req data', {
      field: 'email',
      message: 'Invalid email format',
    });
  }
};

export const checkEmailOtpRestriction = async (
  email: string,
  next: NextFunction
) => {};

export const sendOtp = async (name: string, email: string) => {
  const otp = crypto.randomInt(1000, 9999).toString(); //* create a random number for otp

  await sendMail();

  //? create a redis cache logic
  await redis.set(`otp:${email}`, otp, 'EX', 300);
  await redis.set(`otp_cooldown:${email}`, 'true', 'EX', 60);
};
