import { Algorithm } from 'jsonwebtoken'

interface IJwtModel {
  key: string
  expiration: number | string
  algorithm: Algorithm
  cache_prefix: string
  allow_renew: boolean
  renew_threshold: number
}

interface IEnvironmentModel {
  NODE_ENV: string
  APP_ENV: string
  DB_HOST: string
  DB_USER?: string
  DB_PASS?: string
  DB_PORT: number
  DB_NAME: string
  SERVER_PROTOCOL: string
  SERVER_HOST: string
  SERVER_PORT: number
  LOGGER_HOST: string
  LOGGER_PORT: number
  REDIS_HOST?: string
  REDIS_PORT?: number
  REDIS_PASS?: string
  ADMIN_USER?: string
  ADMIN_PASS?: string
  JWT_SECRET?: string
}

type SomethingNewModel = {
  name: string
  age?: number
  apiKey?: never
  username: string
  password: string
} | {
  name: string
  age?: number
  apiKey: string
  username?: never
  password?: never
}

interface IMS_Configs {
  [key: string]: {
    url?: string
    protocol: string
    host: string
    port: number
    paths: {
      [key: string]: string
    }
  }
}

interface IType {
  [key: string]: string
}

export interface IConfigModel {
  jwt: IJwtModel
  env: IEnvironmentModel
  baseURL: string
  somethingNew: SomethingNewModel
  roleTypes: IType
}