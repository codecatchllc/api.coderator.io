import { Router } from 'express';
import controller from '../controllers/session';
import { authenticateWithToken } from '../middlewares/auth';
import { sessionSchema } from '../schemas/session';
import { requireSchema } from './../middlewares/validate';

const router = Router();

// Authentication
router.use(authenticateWithToken);

/** @swagger
 *
 * /session:
 *   session:
 *     tags: [Session]
 *     summary: Create a new Session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/sessionSchema'
 *     responses:
 *       201:
 *         description: The created Session object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Session'
 *       400:
 *         description: Bad request, invalid request body
 *       500:
 *         description: Bad request, server-side error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/session', requireSchema(sessionSchema), controller.createSession);

/** @swagger
 *
 * /session:
 *   session:
 *     tags: [Session]
 *     summary: Update a Session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/sessionSchema'
 *     responses:
 *       201:
 *         description: The created Session object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Session'
 *       400:
 *         description: Bad request, invalid request body
 *       500:
 *         description: Bad request, server-side error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
 router.post('/session', requireSchema(sessionSchema), controller.updateSession);

 /** @swagger
 *
 * /session:
 *   session:
 *     tags: [Session]
 *     summary: Join a Session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/sessionSchema'
 *     responses:
 *       201:
 *         description: The created Session object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Session'
 *       400:
 *         description: Bad request, invalid request body
 *       500:
 *         description: Bad request, server-side error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/session', requireSchema(sessionSchema), controller.joinSession);

/** @swagger
 *
 * /session:
 *   session:
 *     tags: [Session]
 *     summary: Leave a Session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/sessionSchema'
 *     responses:
 *       201:
 *         description: The created Session object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Session'
 *       400:
 *         description: Bad request, invalid request body
 *       500:
 *         description: Bad request, server-side error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
 router.post('/session', requireSchema(sessionSchema), controller.leaveSession);

export default router;
