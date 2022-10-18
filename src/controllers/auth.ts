import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import Redis from 'ioredis';
import jwt, { Secret } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Post, User } from '../models/init';
import config from '../utils/config';
import { genAccessToken } from '../utils/genAccessToken';
import { genRefreshToken } from '../utils/genRefreshToken';
import { generatePasswordHash, validatePassword } from '../utils/password';
import { sendEmail } from '../utils/sendEmail';
import {
  AuthPayload,
  ChangePasswordSchema,
  EditUserSchema,
  ForgotPasswordSchema,
  LoginSchema,
  RefreshTokenSchema,
  RegisterSchema,
  UserModel,
} from './../@types/custom/index.d';
import {
  ACCESS_TOKEN_LIFESPAN,
  COLOR_SCHEME_KEY,
  FORGOT_PASSWORD_PREFIX,
  REFRESH_TOKEN_KEY,
  REFRESH_TOKEN_LIFESPAN,
} from './../constants/index';

const redis = new Redis(config.REDIS_PORT, config.REDIS_HOST);

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
/*register oauth function controller*/
const registerOAuth = async (req: Request, res: Response) => {
  try {
    const { email, username, password, confirmPassword } =
      req.validatedBody as RegisterSchema;

    // Find user based on email OR username from request body
    const userFound = await User.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    // If the OAuth user is trying to log in instead of signing up

    if (userFound && (await validatePassword(password, userFound.password))) {
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

        delete updatedUser.password;

        res.cookie(REFRESH_TOKEN_KEY, refreshToken, {
          httpOnly: true,
          secure: config.NODE_ENV === 'production',
          maxAge: REFRESH_TOKEN_LIFESPAN, // 90 days
        });

        res.json({ user: updatedUser });
        return;
      } catch (error) {
        console.error('login() error: ', error);
        res.status(500).json({
          error: 'There was an error logging you in, please try again later',
        });
        return;
      }
    } else {
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
          isOAuthAccount: true,
        },
        include: {
          posts: true,
        },
      });

      const accessToken = genAccessToken(user.id);
      const refreshToken = genRefreshToken(user.id);

      user.accessToken = accessToken;
      user.accessTokenExpires = Date.now() + ACCESS_TOKEN_LIFESPAN;
      user.refreshToken = refreshToken;
      user.numPosts = user?.posts?.length;

      delete user.password;

      res.cookie(REFRESH_TOKEN_KEY, refreshToken, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        maxAge: REFRESH_TOKEN_LIFESPAN, // 90 days
      });

      const html = `
        <h4>Registration Completed!</h4>
        <p>Hello ${user.username}, thank you for becoming a member of <a href="https://codecatch.net">CodeCatch.net</a>. You can get started on CodeCatch by <a href="${config.PROTOCOL}://${config.CLIENT_URL}/upload">uploading a post</a> or <a href="${config.PROTOCOL}://${config.CLIENT_URL}/search">searching all posts</a>.</p>
        <p>Please contact <a href="mailto: ${config.CODECATCH_EMAIL}">${config.CODECATCH_EMAIL}</a> if you have any questions or concerns.</p>
        `;

      await sendEmail(user.email, 'CodeCatch: Registration Completed!', html);

      res.status(201).json({ user });
    }
  } catch (error) {
    console.error('registerOAuth() error: ', error);
    res.status(500).json({
      error:
        'There was an error registering your account, please try again later',
    });
  }
};
const login = async (req: Request, res: Response) => {
  try {
    const { usernameOrEmail, password } = req.validatedBody as LoginSchema;

    // Regex to test if "usernameOrEmail" is an email or username
    const isEmail = EMAIL_REGEX.test(usernameOrEmail);
    const key = isEmail ? 'email' : 'username';

    const user = await User.findUnique({
      where: { [key]: usernameOrEmail },
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

const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password, confirmPassword } =
      req.validatedBody as RegisterSchema;

    /**
     * The structure of response from the verify API is
     * {
     *  "success": true | false,
     *  "challenge_ts": timestamp,  // timestamp of the challenge load (ISO format yyyy-MM-dd'T'HH:mm:ssZZ)
     *  "hostname": string,         // the hostname of the site where the reCAPTCHA was solved
     *  "error-codes": [...]        // optional
      }
     */
    // const { data } = await axios.post(
    //   `https://www.google.com/recaptcha/api/siteverify?secret=${config.RECAPTCHA_SECRET}&response=${captcha}`,
    //   null,
    //   {
    //     headers: {
    //       'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
    //     },
    //   }
    // );
    // if (!data.success) {
    //   res.status(422).json({
    //     captcha: 'Unproccesable request, Invalid captcha code',
    //   });
    //   return;
    // }

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

    const accessToken = genAccessToken(user.id);
    const refreshToken = genRefreshToken(user.id);

    user.accessToken = accessToken;
    user.accessTokenExpires = Date.now() + ACCESS_TOKEN_LIFESPAN;
    user.refreshToken = refreshToken;
    user.numPosts = user?.posts?.length;

    delete user.password;
    delete user.posts;

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

    await sendEmail(user.email, 'Coderator: Registration Completed!', html);

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

const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.validatedBody as ForgotPasswordSchema;

    const user = await User.findUnique({ where: { email } });
    if (!user) {
      res
        .status(400)
        .json({ email: 'There is no account associated with this email' });
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
        'There was an error resetting your password, please try again later',
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
    res.clearCookie(COLOR_SCHEME_KEY);
    res.status(204).send();
  } catch (error) {
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
  } catch (err) {
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
    res.status(500).json({
      error: 'There was an error loading your account, please try again later',
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

const deleteaccount = async (req: Request, res: Response) => {
  try {
    await Post.deleteMany({
      where: {
        userId: req.user.id,
      },
    });

    const userexists = await User.findUnique({
      where: {
        id: req.user.id,
      },
    });

    if (!userexists) {
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
    console.log(error);
    res.status(500).json({
      error: 'There was an error deleting your account, please try again later',
    });
  }
};

export default {
  login,
  register,
  registerOAuth,
  forgotPassword,
  changePassword,
  logout,
  refreshToken,
  me,
  editUser,
  deleteaccount,
};
