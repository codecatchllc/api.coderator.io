import { Router } from 'express';
import controller from '../controllers/auth';
import { authenticateWithToken } from '../middlewares/auth';
import { requireSchema } from '../middlewares/validate';
import {
  changePasswordSchema,
  editUserSchema,
  forgotPasswordSchema,
  loginSchema,
  registerOAuthSchema,
  registerSchema,
} from '../schemas/auth';
import urls from '../urls';

const router = Router();

/** @swagger
 *
 * tags:
 *   name: Authentication
 *   description: User authentication API
 *
 * /auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Authenticate a user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/loginSchema'
 *     responses:
 *       200:
 *         description: Successful login, with user details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request, incorrect login credentials
 *       500:
 *         description: Bad request, server-side error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(urls.auth.login, requireSchema(loginSchema), controller.login);

/** @swagger
 *
 * /auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/registerSchema'
 *     responses:
 *       201:
 *         description: Successful registration, with user details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request, registration failed
 *       500:
 *         description: Bad request, server-side error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  urls.auth.register,
  requireSchema(registerSchema),
  controller.register
);

/** @swagger
 *
 * /auth/forgot-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Send user reset password link
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/forgotPasswordSchema'
 *     responses:
 *       204:
 *         description: Successful reset password link sent
 *       400:
 *         description: Bad request, invalid email
 *       500:
 *         description: Bad request, server-side error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  urls.auth.forgotPassword,
  requireSchema(forgotPasswordSchema),
  controller.forgotPassword
);

/** @swagger
 *
 * /auth/password:
 *   post:
 *     tags: [Authentication]
 *     summary: Reset a user's password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/changePasswordSchema'
 *     responses:
 *       204:
 *         description: Successful password reset
 *       400:
 *         description: Bad request, invalid request body
 *       500:
 *         description: Bad request, server-side error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  urls.auth.changePassword,
  requireSchema(changePasswordSchema),
  controller.changePassword
);

/** @swagger
 *
 * /auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Log out of the application
 *     responses:
 *       204:
 *         description: Successful logout, token invalidated
 *       500:
 *         description: Bad request, server-side error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(urls.auth.logout, controller.logout);

/** @swagger
 *
 * /auth/token:
 *   post:
 *     tags: [Authentication]
 *     summary: Refresh a user's access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/refreshTokenSchema'
 *     responses:
 *       200:
 *         description: A new access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshToken'
 *       401:
 *         description: Bad request, invalid refresh token provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(urls.auth.token, controller.refreshToken);

// Authentication
router.use(authenticateWithToken);

/** @swagger
 *
 * /auth/me:
 *   get:
 *     tags: [Authentication]
 *     summary: Retrieve the currently authenticated user
 *     responses:
 *       200:
 *         description: The authenticated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Bad request, user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Bad request, server-side error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.post(
  urls.auth.registerOAuth,
  requireSchema(registerOAuthSchema),
  controller.registerOAuth
);
/** @swagger
 *
 * /auth/register/oauth:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/registerOAuthSchema'
 *     responses:
 *       204:
 *         description: Successful reset password link sent
 *       400:
 *         description: Bad request, registration failed
 *       500:
 *         description: Bad request, server-side error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.get(urls.auth.me, controller.me);

/** @swagger
 *
 * /auth/deleteaccount:
 *   delete:
 *     tags: [Authentication]
 *     summary: Delete Account and All Associated Data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Successfully deleted account and all associated data
 *       404:
 *         description: User could not be found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Bad request, server-side error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(urls.auth.deleteaccount, controller.deleteaccount);

/** @swagger
 *
 * /auth/edit:
 *   patch:
 *     tags: [Authentication]
 *     summary: Update a user's account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/editUserSchema'
 *     responses:
 *       200:
 *         description: The updated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request, invalid request body
 *       500:
 *         description: Bad request, server-side error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch(
  urls.auth.edit,
  requireSchema(editUserSchema),
  controller.editUser
);

export default router;
