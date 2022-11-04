export type UserModel = {
  id: number;
  email: string;
  username: string;
  password?: string;
  accessToken?: string;
  isOAuthAccount?: boolean;
  accessTokenExpires?: number;
  refreshToken?: string;
  verified: boolean;
  createdAt: Date;
  lastLoginAt: Date;
  isActive: boolean;
  posts?: PostModel[];
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

export type AuthenticateWithOAuthSchema = {
  encodedUser: string;
};

export type VerifyEmailSchema = {
  id: number;
  token: string;
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
