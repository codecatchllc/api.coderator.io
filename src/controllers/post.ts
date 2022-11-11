import { Request, Response } from 'express';
import {
  GetSimilarPostsSchema,
  PostInnerJoinUser,
  PostSchema,
  SortOrder
} from '../@types/custom';
import {
  ALL,
  LANGUAGE_OPTIONS,
  MAX_PSQL_INT,
  OLDEST,
  POSTS_PER_PAGE
} from '../constants';
import prisma, { Post } from '../models/init';
import { DEFAULT_LANGUAGE, DEFAULT_TITLE, NEWEST } from './../constants/index';

const getPost = async (req: Request, res: Response) => {
  try {
    const post = await Post.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            createdAt: true,
            lastLoginAt: true,
            isActive: true,
          },
        },
      },
    });
    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ error: 'Resource not found' });
    }
  } catch (error) {
    res.status(500).json({
      error: 'There was an error retrieving this post, please try again later',
    });
  }
};

const getPaginatedPosts = async (req: Request, res: Response) => {
  try {
    let orderBy: SortOrder = 'desc';
    if (req.query.age === NEWEST) {
      orderBy = 'desc';
    } else if (req.query.age === OLDEST) {
      orderBy = 'asc';
    }

    let language = ALL;
    if (
      req.query.language &&
      LANGUAGE_OPTIONS.includes(req.query.language as string)
    ) {
      language = req.query.language as string;
    }

    let page = 0;
    const parsedPage = Math.min(
      Math.abs(parseInt(req.query.page as string)),
      MAX_PSQL_INT
    );
    if (
      req.query.page &&
      typeof parsedPage === 'number' &&
      !isNaN(parsedPage)
    ) {
      // Subtract 1 since page is 0-indexed
      page = parsedPage - 1;
    }

    const queryConditions: object[] = [{ userId: parseInt(req.user.id) }];
    if (language !== ALL) {
      queryConditions.push({ language });
    }

    const totalPosts = await Post.count({
      where: { AND: queryConditions },
    });

    const posts = await Post.findMany({
      skip: page * POSTS_PER_PAGE,
      take: POSTS_PER_PAGE,
      where: {
        AND: queryConditions,
      },
      orderBy: [
        {
          createdAt: orderBy,
        },
      ],
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            createdAt: true,
            lastLoginAt: true,
            isActive: true,
          },
        },
      },
    });

    res.json({
      pages: Math.ceil(totalPosts / POSTS_PER_PAGE),
      total: totalPosts,
      posts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: 'There was an error retrieving your posts, please try again later',
    });
  }
};

const updatePost = async (req: Request, res: Response) => {
  try {
    const { title, content, language, privacy } =
      req.validatedBody as PostSchema;

    if (title && title.length < 3) {
      res
        .status(400)
        .json({ title: 'Title must contain at least 3 characters' });
      return;
    }

    if (language && !LANGUAGE_OPTIONS.includes(language)) {
      res.status(400).json({ language: 'That language is not supported' });
      return;
    }

    const updatedPost = {
      title: title || DEFAULT_TITLE,
      content,
      language: language || DEFAULT_LANGUAGE,
      privacy,
      userId: req.user.id,
    };

    const { count } = await Post.updateMany({
      where: { id: parseInt(req.params.id), userId: req.user.id },
      data: updatedPost,
    });

    if (count === 0) {
      res
        .status(403)
        .json({ error: 'You are not authorized to update this post' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      error: 'There was an error updating your post, please try again later',
    });
  }
};

const deletePost = async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id);

    const post = await Post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      res
        .status(404)
        .json({ error: `Post with id "${postId}" not found, nothing deleted` });
      return;
    }

    // User does not own post
    if (req.user.id !== post?.userId) {
      res
        .status(403)
        .json({ error: 'You are not authorized to delete this post' });
      return;
    }

    const deletedPost = await Post.delete({
      where: { id: postId },
    });
    if (!deletedPost) {
      res
        .status(404)
        .json({ error: `Post with id "${postId}" not found, nothing deleted` });
      return;
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      error: 'There was an error deleting your post, please try again later',
    });
  }
};

const getSimilarPosts = async (req: Request, res: Response) => {
  try {
    const { language } = req.validatedBody as GetSimilarPostsSchema;

    const maxResults = 6;

    // const posts: PostModel[] = await prisma.$queryRaw`
    //   SELECT * from public."Post"
    //   WHERE LOWER( public."Post".title ) LIKE ${`%${title.toLowerCase()}%`}
    //   AND "language" = ${language}
    //   LIMIT ${maxResults}
    // `;
    // const posts: PostModel[] = await prisma.$queryRaw`
    //   SELECT * FROM public."Post"
    //   INNER JOIN public."User"
    //   ON public."Post"."userId" = public."User".id
    //   WHERE "language" = ${language}
    //   LIMIT ${maxResults}
    // `;

    // TODO: consider titles in the search
    // Find the first 6 posts that have the same language as post being viewed.
    // Select a post if and only if:
    //  1. The language matches the language of the post being viewed
    //  2. The post is marked as "public"
    //  3. The id of the post does not equal the id of the post being viewed
    const postRows: PostInnerJoinUser[] = await prisma.$queryRaw`
      SELECT
        p.id, p."userId", p.title, p.content, p.language, p."createdAt", p.privacy,
        u.username
      FROM
        public."Post" as p
        INNER JOIN public."User" as u
          ON p."userId" = u.id
      WHERE p.id != ${parseInt(req.params.id)}
        AND p.privacy = 'public'
        AND p.language = ${language}
      ORDER BY random()
      LIMIT ${maxResults}
    `;

    const posts = postRows.map(post => {
      const { username, ...rest } = post;
      return {
        ...rest,
        user: {
          username,
        },
      };
    });

    res.json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error:
        'There was an error retrieving similar posts, please try again later',
    });
  }
};

const createPost = async (req: Request, res: Response) => {
  try {
    const { title, content, language, privacy } =
      req.validatedBody as PostSchema;

    if (title && title.length < 3) {
      res
        .status(400)
        .json({ title: 'Title must contain at least 3 characters' });
      return;
    }

    if (language && !LANGUAGE_OPTIONS.includes(language)) {
      res.status(400).json({ language: 'That language is not supported' });
      return;
    }

    const newPost = {
      title: title || DEFAULT_TITLE,
      content,
      language: language || DEFAULT_LANGUAGE,
      privacy,
      userId: req.user.id,
    };

    const post = await Post.create({ data: newPost as PostSchema });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({
      error: 'There was an error uploading your post, please try again later',
    });
  }
};

const getRecentSessions = async (_: Request, res: Response) => {
  try {

    const posts = await Post.findMany({
      take: 6,
      orderBy: [
        {
          createdAt: 'desc',
        },
      ],
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            createdAt: true,
            lastLoginAt: true,
            isActive: true,
          },
        },
      },
    });
    res.json({posts});
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: 'There was an error retrieving recent posts, please try again later',
    });
  }
};

export default {
  getPost,
  getPaginatedPosts,
  updatePost,
  deletePost,
  getSimilarPosts,
  createPost,
  getRecentSessions,
};
