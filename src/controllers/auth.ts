import { Prisma } from '@prisma/client';
import axios from 'axios';
import { Request, Response } from 'express';
import Redis from 'ioredis';
import jwt, { Secret } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import {
  EMAIL_VERIFICATION_PREFIX,
  FORGOT_PASSWORD_PREFIX,
} from '../constants/redis';
import { User } from '../models/init';
import config from '../utils/config';
import { genAccessToken } from '../utils/genAccessToken';
import genPostStatistics from '../utils/genPostStatistics';
import { genRefreshToken } from '../utils/genRefreshToken';
import { generatePasswordHash, validatePassword } from '../utils/password';
import { sendEmail } from '../utils/sendEmail';
import {
  AuthPayload,
  ChangePasswordSchema,
  EditUserSchema,
  ForgotPasswordSchema,
  LoginSchema,
  AuthenticateWithOAuthSchema,
  VerifyEmailSchema,
  RefreshTokenSchema,
  RegisterSchema,
  UserModel,
} from './../@types/custom/index.d';
import {
  ACCESS_TOKEN_LIFESPAN,
  EMAIL_REGEX,
  PRIVATE,
  REFRESH_TOKEN_KEY,
  REFRESH_TOKEN_LIFESPAN,
} from './../constants/index';

const redis = new Redis(config.REDIS_PORT, config.REDIS_HOST);

const login = async (req: Request, res: Response) => {
  try {
    const { usernameOrEmail, password } = req.validatedBody as LoginSchema;

    // Regex to test if "usernameOrEmail" is an email or username
    const isEmail = EMAIL_REGEX.test(usernameOrEmail);
    const key = isEmail ? 'email' : 'username';
    const whereClause = isEmail
        ? { email: usernameOrEmail ? usernameOrEmail.toLowerCase() : '' }
        : { username: usernameOrEmail };

    const user = await User.findUnique({
      where: whereClause,
    });
    if (!user) {
      res.status(400).json({
        usernameOrEmail: `The ${key} you entered doesn't belong to an account`,
      });
      return;
    }

    const passwordValid = await validatePassword(password, user.password);
    if (!passwordValid) {
      res.status(400).json({ password: 'That password was incorrect' });
      return;
    }

    user.lastLoginAt = new Date(Date.now());

    const updatedUser: UserModel = await User.update({
      where: { id: user.id },
      data: { lastLoginAt: user.lastLoginAt },
      include: { posts: true },
    });

    const accessToken = genAccessToken(user.id);
    const refreshToken = genRefreshToken(user.id);

    updatedUser.accessToken = accessToken;
    updatedUser.accessTokenExpires = Date.now() + ACCESS_TOKEN_LIFESPAN;
    updatedUser.refreshToken = refreshToken;
    updatedUser.numPosts = updatedUser?.posts?.length;

    delete updatedUser.password;
    delete updatedUser.posts;

    res.cookie(REFRESH_TOKEN_KEY, refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      maxAge: REFRESH_TOKEN_LIFESPAN, // 90 days
    });

    res.json({ user: updatedUser });
  } catch (error) {
    res.status(500).json({
      error: 'There was an error logging you in, please try again later',
    });
  }
};

const authenticateWithOAuth = async (req: Request, res: Response) => {
  try {
    const { encodedUser } = req.validatedBody as AuthenticateWithOAuthSchema;

    const decodedUser = jwt.verify(
        encodedUser,
        config.ACCESS_TOKEN_SECRET as Secret
    ) as { email: string; username: string };

    const { email: unsanitizedEmail, username } = decodedUser;

    console.log(decodedUser);

    const email = unsanitizedEmail ? unsanitizedEmail.toLowerCase() : '';

    // Find user based on email OR username from request body
    const userFound = (await User.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    })) as UserModel;

    // If the OAuth user is trying to log in instead of signing up
    if (userFound) {
      try {
        userFound.lastLoginAt = new Date(Date.now());

        const updatedUser: UserModel = await User.update({
          where: { id: userFound.id },
          data: { lastLoginAt: userFound.lastLoginAt },
          include: { posts: true },
        });

        const accessToken = genAccessToken(userFound.id);
        const refreshToken = genRefreshToken(userFound.id);

        updatedUser.accessToken = accessToken;
        updatedUser.accessTokenExpires = Date.now() + ACCESS_TOKEN_LIFESPAN;
        updatedUser.refreshToken = refreshToken;
        updatedUser.numPosts = updatedUser?.posts?.length;

        delete updatedUser.posts;
        delete updatedUser.password;

        res.json({ user: updatedUser });
        return;
      } catch (error) {
        console.error('login() error: ', error);
        res.status(500).json({
          error: 'There was a server-side issue while logging you in',
        });
        return;
      }
    } else {
      const user: UserModel = await User.create({
        data: {
          email,
          username,
          password: '',
          verified: true,
          isOAuthAccount: true,
        },
        include: { posts: true },
      });

      const accessToken = genAccessToken(user.id);
      const refreshToken = genRefreshToken(user.id);

      user.accessToken = accessToken;
      user.accessTokenExpires = Date.now() + ACCESS_TOKEN_LIFESPAN;
      user.refreshToken = refreshToken;
      user.numPosts = user?.posts?.length;

      delete user.posts;
      delete user.password;

      const html = `
      <h4>Registration Completed!</h4>
      <p>Hello ${user.username}, thank you for becoming a member of <a href="https://codecatch.net">CodeCatch.net</a>. You can get started on CodeCatch by <a href="${config.PROTOCOL}://${config.CLIENT_URL}/upload">uploading a post</a> or <a href="${config.PROTOCOL}://${config.CLIENT_URL}/search">searching all posts</a>.</p>
      <p>Please contact <a href="mailto: ${config.CODECATCH_EMAIL}">${config.CODECATCH_EMAIL}</a> if you have any questions or concerns.</p>
      `;

      await sendEmail(user.email, 'CodeCatch: Registration Completed!', html);

      res.status(201).json({ user });
    }
  } catch (error) {
    console.error('authenticateWithOAuth() error: ', error);
    res.status(500).json({
      error: 'There was a server-side issue while registering your account',
    });
  }
};

const register = async (req: Request, res: Response) => {
  try {
    const {
      email: unsanitizedEmail,
      username,
      password,
      confirmPassword,
      captcha,
    } = req.validatedBody as RegisterSchema;

    const email = unsanitizedEmail ? unsanitizedEmail.toLowerCase() : '';

    const { data } = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify?secret=${config.RECAPTCHA_SECRET}&response=${captcha}`,
        null,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
          },
        }
    );
    if (!data.success) {
      res.status(400).json({
        errors: {
          captcha: 'The provided captcha code is invalid',
        },
      });
      return;
    }

    // Find user based on email OR username from request body
    const userFound = await User.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (userFound?.email === email) {
      res.status(400).json({ email: 'That email is taken' });
      return;
    }

    if (userFound?.username === username) {
      res.status(400).json({ username: 'That username is taken' });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ confirmPassword: 'Passwords do not match' });
      return;
    }

    const hash = await generatePasswordHash(password);

    const user: UserModel = await User.create({
      data: {
        email,
        username,
        password: hash,
      },
      include: {
        posts: true,
      },
    });

    const token = uuidv4();

    // Expire email verification token after 24 hours (60 * 60 * 24)
    await redis.set(
        EMAIL_VERIFICATION_PREFIX + user.id,
        token,
        'EX',
        60 * 60 * 24
    );

    const html = `
    <p>Please click the following link to verify your email:</p>
    <a href="http://${process.env.CLIENT_URL}/verify/${user.id}/${token}">http://${process.env.CLIENT_URL}/verify/${user.id}/${token}</a>
    <p>If you do not follow the link within 24 hours of receiving this email, your account will be permanently deleted.</p>
    `;

    await sendEmail(user.email, 'CodeCatch: Verify Your Email', html);

    res.status(201).json({ user });
  } catch (error) {
    if (error.code === 'EENVELOPE') {
      res.status(400).json({ email: 'That email is invalid' });
      return;
    }
    res.status(500).json({
      error:
        'There was an error registering your account, please try again later',
    });
  }
};

const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { id, token } = req.validatedBody as VerifyEmailSchema;

    const user = await User.findUnique({
      where: { id },
    });
    if (!user) {
      res.status(404).json({ error: 'User could not be found' });
      return;
    }

    if (!token) {
      res
          .status(400)
          .json({ error: 'Email verification token does not exist' });
      return;
    }

    // Check that the Redis token exists
    const redisToken = await redis.get(EMAIL_VERIFICATION_PREFIX + user.id);
    if (!redisToken) {
      res
          .status(404)
          .json({ error: 'Email verification token expired or does not exist' });
      return;
    }

    // If the URL token and the Redis token do not match
    if (redisToken !== token) {
      res
          .status(400)
          .json({ error: 'Invalid email verification token provided' });
      return;
    }

    // Update the user's verified status to true
    const updatedUser: UserModel = await User.update({
      where: { id: user.id },
      data: { verified: true },
      include: { posts: true },
    });

    // Remove the email verification token from Redis
    await redis.del(EMAIL_VERIFICATION_PREFIX + token);

    const accessToken = genAccessToken(user.id);
    const refreshToken = genRefreshToken(user.id);

    updatedUser.accessToken = accessToken;
    updatedUser.accessTokenExpires = Date.now() + ACCESS_TOKEN_LIFESPAN;
    updatedUser.refreshToken = refreshToken;
    updatedUser.numPosts = updatedUser?.posts?.length;

    delete updatedUser.posts;
    delete updatedUser.password;

    res.cookie(REFRESH_TOKEN_KEY, refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      maxAge: REFRESH_TOKEN_LIFESPAN, // 90 days
    });

    const html = `
    <h4>Registration Completed!</h4>
    <p>Hello ${user.username}, thank you for becoming a member of <a href="https://coderator.io">Coderator.io</a>. You can get started on CodeCatch by <a href="${config.PROTOCOL}://${config.CLIENT_URL}/upload">uploading a post</a>.</p>
    <p>Please contact <a href="mailto: ${config.CODECATCH_EMAIL}">${config.CODECATCH_EMAIL}</a> if you have any questions or concerns.</p>
    `;

    await sendEmail(
        updatedUser.email,
        'CodeCatch: Registration Completed!',
        html
    );

    res.status(201).json({ user: updatedUser });
  } catch (error) {
    console.error('verifyEmail() error: ', error);
    res.status(500).json({
      error: 'There was a server-side issue while verifying your email',
    });
  }
};

const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email: unsanitizedEmail } =
        req.validatedBody as ForgotPasswordSchema;

    const email = unsanitizedEmail ? unsanitizedEmail.toLowerCase() : '';

    const user = await User.findUnique({ where: { email } });
    if (!user || user.isOAuthAccount) {
      res
        .status(400)
        .json({
          errors: {
            email: 'There is no account associated with this email'
          }
        });
      return;
    }

    const token = uuidv4();

    // Expire reset password token after 2 hours (60 * 60 * 2)
    await redis.set(FORGOT_PASSWORD_PREFIX + token, user.id, 'EX', 60 * 60 * 2);

    const html = `
    <h4>Reset Password</h4>
    <p>There as been a request to reset your coderator.io password. Please contact <a href="mailto: ${config.CODECATCH_EMAIL}">${config.CODECATCH_EMAIL}</a> if you did not initiate this request.</p>
    <p>You will have to submit a new request if you do not reset your password within the next two hours.</p>
    <p>Click the following link to reset your password:</p>
    <a href=""${config.PROTOCOL}://${config.CLIENT_URL}/change-password/${token}">"${config.PROTOCOL}://${config.CLIENT_URL}/change-password/${token}</a>
    `;

    await sendEmail(email, 'Coderator: Reset Password', html);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      error:
        'There was a server-side issue while resetting your password',
    });
  }
};

const changePassword = async (req: Request, res: Response) => {
  try {
    const { token, password, confirmPassword } =
      req.validatedBody as ChangePasswordSchema;

    if (!token) {
      res.status(400).json({ error: 'Reset token does not exist' });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ confirmPassword: 'Passwords do not match' });
      return;
    }

    const key = FORGOT_PASSWORD_PREFIX + token;

    // Check if key is still in Redis
    const userId = await redis.get(key);
    if (!userId) {
      res.status(400).json({ error: 'Reset token expired' });
      return;
    }

    // Find user using userId pulled from Redis
    const user = await User.findUnique({ where: { id: parseInt(userId) } });
    if (!user) {
      res.status(400).json({ error: 'User no longer exists' });
      return;
    }

    // Update the user's password
    await User.update({
      where: { id: user.id },
      data: { password: await generatePasswordHash(password.toString()) },
    });

    // Remove the reset token from Redis
    await redis.del(key);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      error:
        'There was an error resetting your password, please try again later',
    });
  }
};

const logout = async (_: Request, res: Response) => {
  try {
    res.clearCookie(REFRESH_TOKEN_KEY);
    res.status(204).send();
  } catch (error) {
    console.error('logout() error: ', error);
    res.status(500).json({
      error: 'There was an error logging you out, please try again later',
    });
  }
};

const refreshToken = (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body as RefreshTokenSchema;

    if (!refreshToken) {
      res.status(401).json({ error: 'Token does not exist' });
      return;
    }

    const decoded = jwt.verify(
      refreshToken,
      config.REFRESH_TOKEN_SECRET as Secret
    ) as AuthPayload;

    const accessToken = genAccessToken(decoded.id);

    res.json({
      accessToken,
      accessTokenExpires: Date.now() + ACCESS_TOKEN_LIFESPAN,
      refreshToken,
    });
  } catch (error) {
    console.error('refreshToken() error: ', error);
    res.status(401).json({ error: 'Invalid token provided' });
  }
};

const me = async (req: Request, res: Response) => {
  try {
    const user = (await User.findUnique({
      where: { id: req.user.id },
      include: { posts: true },
    })) as UserModel;

    if (!user) {
      res.status(404).json({
        error: 'Authenticated user could not be found',
      });
      return;
    }

    user.numPosts = user?.posts?.length;

    delete user.password;
    delete user.posts;
    res.json({ user });
  } catch (error) {
    console.error('me() error: ', error);
    res.status(500).json({
      error: 'There was an error loading your account, please try again later',
    });
  }
};

const getUserByUsername = async (req: Request, res: Response) => {
  try {
    const username = req.params.username || '';

    const user = (await User.findUnique({
      where: { username },
      include: { posts: true },
    })) as UserModel;

    if (!user) {
      res.status(404).json({
        error: 'User could not be found',
      });
      return;
    }

    user.numPosts = user.posts?.length;

    delete user.password;

    const postStatistics = genPostStatistics(user.posts || []);

    const posts = user.posts
        ?.filter(post =>
            req.user.id !== user.id ? post.privacy !== PRIVATE : post.privacy
        )
        .map(post => {
          return {
            user: {
              username: user.username,
            },
            ...post,
          };
        });

    res.json({ user: { ...user, posts }, postStatistics });
  } catch (error) {
    console.error('getUserByUsername() error: ', error);
    res.status(500).json({
      error: `There was a server-side issue while fetching the user with the username provided`,
    });
  }
};

const editUser = async (req: Request, res: Response) => {
  try {
    const user: UserModel = await User.update({
      where: {
        id: req.user.id,
      },
      data: req.validatedBody as EditUserSchema,
      include: { posts: true },
    });
    delete user.password;
    res.json({ user });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const { target = [] }: { target?: string[] } = error.meta || {};
      if (target.length > 0) {
        res.status(400).json({
          error: `There was an issue with the ${target[0]} you provided`,
        });
      } else {
        res.status(500).json({
          error:
            'There was an error editing your account, please try again later',
        });
      }
      return;
    }
    res.status(500).json({
      error: 'There was an error editing your account, please try again later',
    });
  }
};

const deleteAccount = async (req: Request, res: Response) => {
  try {
    const user = await User.findUnique({
      where: {
        id: req.user.id,
      },
    });

    if (!user) {
      res.status(404).json({
        error: 'User could not be found',
      });
      return;
    }

    await User.delete({
      where: {
        id: req.user.id,
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error('deleteAccount() error: ', error);
    res.status(500).json({
      error: 'There was a server-side issue while deleting your account',
    });
  }
};

export default {
  login,
  authenticateWithOAuth,
  register,
  verifyEmail,
  forgotPassword,
  changePassword,
  logout,
  refreshToken,
  me,
  getUserByUsername,
  editUser,
  deleteAccount,
};
