export type UserModel = {
  id: string;
  email: string;
  username: string;
  password?: string;
  accessToken?: string;
  isOAuthAccount?: boolean;
  authProvider: string;
  accessTokenExpires?: number;
  refreshToken?: string;
  verified: boolean;
  createdAt: Date;
  lastLoginAt: Date;
  biography: string;
  isActive: boolean;
  posts?: PostModel[];
  sessions?: SessionModel[];
  followedBy?: FollowModel[];
  following?: FollowModel[];
  numPosts?: number;
};

export type PostInnerJoinUser = {
  id: string;
  userId: string;
  user?: UserModel;
  title: string;
  content: string;
  language: string;
  privacy: string;
  createdAt: Date;
  expirationDate: Date | null;
  username: string;
};

export type PostModel = {
  userId: string;
  user?: UserModel;
  title: string;
  content: string;
  language: string;
  privacy: string;
  createdAt: Date;
  expirationDate: Date | null;
  accessList: string[];
};

export type SessionModel = {
  userId: string;
  user?: UserModel;
  title: string;
  content: string;
  language: string;
  privacy: string;
  createdAt: Date;
  expirationDate: Date | null;
  sessionTimeout: Date | null;
  currentUserCount?: number;
  currentUserList?: Json;
  accessList: string[];
};

export type FollowModel = {
  followerId: string;
  followingId: string;
  id: string;
};

export type PostInnerJoinUser = {
  userId: string;
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
  captcha: string;
};

export type AuthenticateWithOAuthSchema = {
  encodedUser: string;
};

export type VerifyEmailSchema = {
  id: string;
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
  userId: string;
  title: string;
  content: string;
  language: string;
  privacy: string;
  expirationDate?: Date;
};

export type SessionSchema = {
  id: string;
  user: UserModel;
  userId: string;
  title: string;
  content: string;
  language: string;
  privacy: string;
  createdAt: Date;
  expirationDate?: Date;
  sessionTimeout?: Date;
  currentUserCount: number;
  currentUserList: string;
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

export type SessionSchema = {
  userId: string;
  title: string;
  content: string;
  language: string;
  privacy: string;
  expirationDate?: Date;
  sessionTimeout?: Date;
  currentUserCount?: number;
  currentUserList?: Json;
};

export type CaptchaValidation = {
  success: boolean;
  challenge_ts: number;
  hostname: string;
  'error-codes'?: string[];
};

export type AuthPayload = {
  id: string;
};

export type SortOrder = 'asc' | 'desc';
