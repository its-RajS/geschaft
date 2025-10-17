// ! As we need user registratioon for seller and customer

// import crypto from 'crypto';
import { ValidationError } from '@geschaft/handler';

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
    throw new ValidationError('invalid req data');
  }

  if (!emailRegex.test(email)) {
    throw new ValidationError('invalid req data');
  }
};
