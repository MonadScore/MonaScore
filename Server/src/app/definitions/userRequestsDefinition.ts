export const userRequestsDefinitions = {
  userRegister: {
    path: '/api/user/register',
    method: 'post',
  },
  userClaim: {
    path: '/api/user/claim',
    method: 'post',
  },
  userData: {
    path: '/api/user',
    method: 'get',
  },
  userMessage: {
    path: '/api/user/message',
    method: 'post',
  },
} as const;
