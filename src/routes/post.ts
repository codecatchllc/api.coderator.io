import { Router } from 'express';
import controller from '../controllers/post';
import { authenticateWithToken } from '../middlewares/auth';
import { getSimilarPostsSchema, postSchema } from '../schemas/post';
import { requireSchema } from './../middlewares/validate';

const router = Router();

// Authentication
router.use(authenticateWithToken);

/** @swagger
 *
 * tags:
 *   name: Post
 *   description: API for managing Post objects
 *
 * /posts/{page}:
 *   get:
 *     tags: [Post]
 *     summary: Get all Post objects for authenticated user
 *     parameters:
 *       - in: path
 *         name: page
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of Post objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       500:
 *         description: Bad request, server-side error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/posts', controller.getPaginatedPosts);

/** @swagger
 *
 * /post/{id}:
 *   get:
 *     tags: [Post]
 *     summary: Get a Post by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A single post associated with the given id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Bad request, post not found
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
router.get('/post/:id', controller.getPost);

/** @swagger
 *
 * /post/{id}:
 *   patch:
 *     tags: [Post]
 *     summary: Update Post with the specified id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/postSchema'
 *     responses:
 *       204:
 *         description: Successfully updated post
 *       400:
 *         description: Bad request, invalid request body
 *       403:
 *         description: Bad request, not authorized to update post
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
router.patch('/post/:id', requireSchema(postSchema), controller.updatePost);

/** @swagger
 *
 * /post/{id}:
 *   delete:
 *     tags: [Post]
 *     summary: Delete Post with the specified id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Successfully deleted post
 *       403:
 *         description: Bad request, not authorized to delete post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Bad request, post not found
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
router.delete('/post/:id', controller.deletePost);

/** @swagger
 *
 * /post/{id}/similar:
 *   post:
 *     tags: [Post]
 *     summary: Get 6 similar posts based on title and language
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/getSimilarPostsSchema'
 *     responses:
 *       200:
 *         description: List of 6 similar Post objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
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
  '/post/:id/similar',
  requireSchema(getSimilarPostsSchema),
  controller.getSimilarPosts
);

/** @swagger
 *
 * /post:
 *   post:
 *     tags: [Post]
 *     summary: Create a new Post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/postSchema'
 *     responses:
 *       201:
 *         description: The created Post object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Bad request, invalid request body
 *       500:
 *         description: Bad request, server-side error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/post', requireSchema(postSchema), controller.createPost);

export default router;
