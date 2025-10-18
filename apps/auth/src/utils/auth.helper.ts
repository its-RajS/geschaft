// ! As we need user registratioon for seller and customer

import crypto from 'crypto';
import { ValidationError } from 'packages/handler/index';
import { NextFunction } from 'express';
import redis from 'packages/libs/redis';
import { sendEmail } from './sendMail';

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
) => {
  //* wrong otp lock
  if (await redis.get(`otp_lock:${email}`)) {
    return next(
      new ValidationError(
        'Account locked due to multiple failed attempts! Try again after 10 mins'
      )
    );
  }
  //* getting otp mail after every mins -> lock after 'n' number or attempts
  if (await redis.get(`otp_spamLock:${email}`)) {
    return next(
      new ValidationError('Too many OTP request! Try again after 1 hour')
    );
  }
  //* untill the cooldown is there no otp can be sent
  if (await redis.get(`otp_coolDown:${email}`)) {
    return next(
      new ValidationError('Please wait 1 min before requesting a new otp')
    );
  }
};

export const trackOtpRestriction = async (
  email: string,
  next: NextFunction
) => {
  const otpRequestKey = `otp_requestCount:${email}`; //? redis key name
  const otpRequest = parseInt((await redis.get(otpRequestKey)) || '0'); //? redis key's value count

  //? Might someone is Spaming
  if (otpRequest >= 5) {
    await redis.set(`otp_spamLock:${email}`, 'locked', 'EX', 3600);
    return next(
      new ValidationError('Please wait 1 min before requesting a new otp')
    );
  }

  await redis.set(otpRequestKey, otpRequest + 1, 'EX', 3600); //? tracking request for 1 hour
};

export const sendOtp = async (
  name: string,
  email: string,
  template: string
) => {
  const otp = crypto.randomInt(1000, 9999).toString(); //* create a random number for otp

  await sendEmail(email, 'Verification OTP', template, { name, otp });

  //? create a redis cache logic
  await redis.set(`otp:${email}`, otp, 'EX', 300); //? 5 min timer
  await redis.set(`otp_coolDown:${email}`, 'true', 'EX', 60); //? 1 min timer (adv. security)
};
