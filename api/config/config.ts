// Legacy config file - redirects to new configuration system
// This file is kept for backward compatibility
import { config as newConfig } from './config-manager';

export const config = {
  port: newConfig.port,
  env: newConfig.nodeEnv,
  db: {
    host: newConfig.database.host,
    port: newConfig.database.port,
    database: newConfig.database.name,
    user: newConfig.database.user,
    password: newConfig.database.password
  },
  jwt: {
    secret: newConfig.jwt.secret,
    refreshSecret: newConfig.jwt.refreshSecret,
    expiresIn: newConfig.jwt.expiresIn
  }
};