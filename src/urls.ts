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
    registerOAuth: '/register/oauth',
    authenticateWithOAuth: '/oauth',
    edit: '/edit',
    verify: '/verify',
    token: '/token',
    me: '/me',
    username: '/user/:username',
    deleteaccount: '/deleteaccount',
  },
  post: {
    path: '/post',
  },
};
