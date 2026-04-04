export const ErrorCode = {
  SUCCESS: { code: 200, message: '成功' },
  USER_NOT_FOUND: { code: 10001, message: '用户不存在' },
  PASSWORD_ERROR: { code: 10002, message: '旧密码错误' },
  ACCOUNT_PASSWORD_ERROR: { code: 10003, message: '账号或密码错误' },
  PASSWORD_SAME: { code: 10004, message: '新密码不能与旧密码相同' },
  TOKEN_INVALID: { code: 10005, message: '登录凭证已过期或无效，请重新登录' },
  TOKEN_MISSING: { code: 10006, message: '请求头部缺失 token，请重新登录' },
  TOKEN_PARSE_ERROR: { code: 10007, message: '解析用户信息失败，请重新登录' },
};
