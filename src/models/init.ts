import { PrismaClient } from '@prisma/client';

// PrismaClient is not available when testing
const prisma = new PrismaClient();

export const User = prisma.user;
export const Post = prisma.post;

export default prisma;
