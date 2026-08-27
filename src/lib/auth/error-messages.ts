/**
 * Better Auth sempre responde em inglês — isso é esperado, é como a lib
 * funciona. A tradução pt-BR mora em src/i18n/messages/pt-BR.json
 * (namespace "auth.errors"). Essa função só mapeia o texto em inglês que a
 * lib retorna pra chave de tradução correspondente.
 */
const AUTH_ERROR_KEYS: Record<string, string> = {
  'Invalid email or password': 'invalidEmailOrPassword',
  'Email not verified': 'emailNotVerified',
  'User not found': 'userNotFound',
  'User already exists.': 'userAlreadyExists',
  'User already exists. Use another email.': 'userAlreadyExists',
  'Password too short': 'passwordTooShort',
  'Password too long': 'passwordTooLong',
  'Invalid email': 'invalidEmail',
  'Invalid password': 'invalidPassword',
  'Invalid token': 'invalidToken',
  'Token expired': 'tokenExpired',
  'Session expired. Re-authenticate to perform this action.': 'sessionExpired',
}

export function authErrorKey(message: string | undefined, fallbackKey: string): string {
  if (!message) return fallbackKey
  return AUTH_ERROR_KEYS[message] ?? fallbackKey
}
