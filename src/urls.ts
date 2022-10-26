export default {
  apiPrefix: '/api/v1',
  swagger: {
    path: '/api/docs',
    spec: 'openapi.json',
  },
  auth: {
    path: '/auth',
    login: '/login',
    logout: '/logout',
    forgotPassword: '/forgot-password',
    changePassword: '/change-password',
    register: '/register',
    edit: '/edit',
    verify: '/verify',
    token: '/token',
    me: '/me',
    username: '/user/:username',
    id: '/lookup/:id',
    deleteaccount: '/deleteaccount',
    followers: '/followers/:username',
    following: '/following/:username',
    follow: '/follow/:username',
    unfollow: '/unfollow/:username',
  },
  post: {
    path: '/post',
  },
};
