export type UserModel = {
  id: number;
  email: string;
  username: string;
  password?: string;
  accessToken?: string;
  accessTokenExpires?: number;
  refreshToken?: string;
  createdAt: Date;
  lastLoginAt: Date;
  biography: string;
  isActive: boolean;
  posts?: PostModel[];
  followedBy?: FollowModel[];
  following?: FollowModel[];
  numPosts?: number;
};

export type PostModel = {
  userId: number;
  user?: UserModel;
  title: string;
  content: string;
  language: string;
  privacy: string;
  createdAt: Date;
  expirationDate: Date | null;
};

export type FollowModel = {
  followerId: number;
  followingId: number;
  id: string;
};

export type PostInnerJoinUser = {
  userId: number;
  user?: UserModel;
  title: string;
  content: string;
  language: string;
  privacy: string;
  createdAt: Date;
  expirationDate: Date | null;
  username: string;
};

export type LoginSchema = {
  usernameOrEmail: string;
  password: string;
};

export type RegisterSchema = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  captcha: string;
};

export type ForgotPasswordSchema = {
  email: string;
};

export type ChangePasswordSchema = {
  token: string;
  password: string;
  confirmPassword: string;
};

export type RefreshTokenSchema = {
  refreshToken?: string;
};

export type PostSchema = {
  userId: number;
  title: string;
  content: string;
  language: string;
  privacy: string;
  expirationDate?: Date;
};

export type GetSimilarPostsSchema = {
  title: string;
  language: string;
};

export type EditUserSchema = {
  email?: string;
  username?: string;
  biography: string;
};

export type CaptchaValidation = {
  success: boolean;
  challenge_ts: number;
  hostname: string;
  'error-codes'?: string[];
};

export type AuthPayload = {
  id: number;
};

export type SortOrder = 'asc' | 'desc';
