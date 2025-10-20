// ! As we need user registratioon for seller and customer

import crypto from 'crypto';
import { NextFunction } from 'express';
import { ValidationError } from '@geschaft/handler';
import redis from '@geschaft/libs/redis';
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
        'Account locked due to multiple failed attempts! Try again after 2 mins'
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

export const verifyOtp = async (
  email: string,
  otp: string,
  next: NextFunction
) => {
  const storedOtp = await redis.get(`otp:${email}`);
  if (!storedOtp) {
    throw new ValidationError('Invalid or expired OTP');
  }

  const failedAttemptsKey = `otp_attempts:${email}`;
  const failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || '0');

  //? acc. lock logic on bases of otp
  if (storedOtp !== otp) {
    if (failedAttempts >= 3) {
      await redis.set(`otp_lock:${email}`, 'locked', 'EX', 120); //* 2 min lock
      await redis.del(`otp:${email}`, failedAttemptsKey);
      throw new ValidationError(
        'Too many failed attempts. Your account is locked for 2 mins.'
      );
    }
    await redis.set(failedAttemptsKey, failedAttempts + 1, 'EX', 300); //* expire after 5min
    throw new ValidationError(
      `Incorrect OTP. ${3 - failedAttempts} attempts left.`
    );
  }

  await redis.del(`otp:${email}`, failedAttemptsKey);
};
