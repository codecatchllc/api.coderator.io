import { Router } from 'express';
import controller from '../controllers/auth';
import { authenticateWithToken } from '../middlewares/auth';
import { requireSchema } from '../middlewares/validate';
import {
    authenticateWithOAuthSchema,
    changePasswordSchema,
    editUserSchema,
    forgotPasswordSchema,
    loginSchema,
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
 * tags:
 *   name: Authentication
 *   description: User authentication API
 *
 * /auth/verify/:id/:token:
 *   post:
 *     tags: [Authentication]
 *     summary: Authenticate a user account
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The id of the user being verified.
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: A uuid token used in Redis to verify a user's identity.
 *     responses:
 *       200:
 *         description: Successful verification, authenticated user object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request, invalid token parameter
 *       404:
 *         description: Bad request, user or token parameter not found
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
router.get(`${urls.auth.verify}/:id/:token`, controller.verifyEmail);

/** @swagger
 *
 * /auth/oauth:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/authenticateWithOAuthSchema'
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
router.post(
    urls.auth.authenticateWithOAuth,
    requireSchema(authenticateWithOAuthSchema),
    controller.authenticateWithOAuth
);

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
router.post(urls.auth.logout, authenticateWithToken, controller.logout);

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

/** @swagger
 *
 * /auth/me:
 *   get:
 *     tags: [Authentication]
 *     summary: Retrieve the currently authenticated user
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The username of the user to be queried
 *     responses:
 *       200:
 *         description: The user associated with parameter :username
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
router.get(urls.auth.username, controller.getUserByUsername);

router.get(urls.auth.followers, controller.getFollowers);

router.get(urls.auth.following, controller.getFollowing);

router.get(urls.auth.id, controller.getUserById);

router.get(urls.auth.specificSession, controller.getSession);

router.get(urls.auth.createSession, controller.createSession);

router.post(urls.auth.saveSession, controller.saveSession);

// Authentication
router.use(authenticateWithToken);

/** @swagger
 *
 * /auth/follow:
 *   get:
 *     tags: [Authentication]
 *     summary: Follow a user
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The username of the user to be followed
 *     responses:
 *       200:
 *         description: Success, user followed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/followUserResponseSchema'
 *       404:
 *         description: Bad request, user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Bad request, you cannot follow yourself or you are already following this user
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
router.get(urls.auth.follow, controller.followUser);

/** @swagger
 *
 * /auth/unfollow:
 *   get:
 *     tags: [Authentication]
 *     summary: Unfollow a user
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The username of the user to be unfollowed
 *     responses:
 *       200:
 *         description: Success, user unfollowed
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
 *       400:
 *         description: Bad request, you cannot unfollow yourself or you are already not following this user
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
router.get(urls.auth.unfollow, controller.unfollowUser);

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
router.get(urls.auth.me, authenticateWithToken, controller.me);

router.get(
    urls.auth.username,
    authenticateWithToken,
    controller.getUserByUsername
);

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
router.delete(
    urls.auth.deleteaccount,
    authenticateWithToken,
    controller.deleteaccount
);

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
    authenticateWithToken,
    requireSchema(editUserSchema),
    controller.editUser
);


export default router;
