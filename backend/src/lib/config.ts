import dotenv from 'dotenv'
dotenv.config()

function getRequired(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error(`Missing required env var: ${name}`)
  return val
}

export const config = {
  port:          Number(process.env.PORT ?? 4000),
  databaseUrl:   getRequired('DATABASE_URL'),
  defaultUserId: getRequired('DEFAULT_USER_ID'),
  frontendUrl:   process.env.FRONTEND_URL ?? 'http://localhost:5173',
  nodeEnv:       process.env.NODE_ENV ?? 'development',
  appUrl:        process.env.APP_URL ?? 'http://localhost:5173',
  resendApiKey:  process.env.RESEND_API_KEY ?? '',
  emailFrom:     process.env.EMAIL_FROM ?? 'noreply@example.com',
}
