import express, { Router } from 'express';
import { userRegistration, verifyUser } from '../controllers/user.controller';

const userRoute: Router = express.Router();

userRoute.post('/user-registration', userRegistration);
userRoute.post('/verify-user', verifyUser);

export default userRoute;
