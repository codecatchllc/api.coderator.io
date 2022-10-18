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
    edit: '/edit',
    verify: '/verify',
    token: '/token',
    me: '/me',
    deleteaccount: '/deleteaccount',
  },
  post: {
    path: '/post',
  },
};
