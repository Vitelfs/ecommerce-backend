import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
    PORT: Joi.number().default(3000),
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),

    POSTGRES_USER: Joi.string().required(),
    POSTGRES_PASSWORD: Joi.string().required(),
    POSTGRES_DB: Joi.string().required(),

    DB_HOST: Joi.string().default('localhost'),
    DB_PORT: Joi.number().required(),
    DB_USER: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_NAME: Joi.string().required(),

    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRES_IN: Joi.string().default('1d'),

    REDIS_HOST: Joi.string().default('localhost'),
    REDIS_PORT: Joi.number().default(6379),
    REDIS_DB: Joi.number().default(0),
    REDIS_PASSWORD: Joi.string().optional().allow(''),

    PGADMIN_DEFAULT_EMAIL: Joi.string().email().required(),
    PGADMIN_DEFAULT_PASSWORD: Joi.string().required(),

    FRONTEND_URL: Joi.string().uri().required(),
});