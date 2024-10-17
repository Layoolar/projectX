import fs from 'fs';
import dotenv from 'dotenv';

const env = dotenv.parse(fs.readFileSync(__dirname + '/../../.env'));
//const env_local = dotenv.parse(
//    fs.readFileSync(__dirname + '/../../.env-local')
//);

const CONFIG = {
    JWT_SECRET: env.JWT_SECRET,
    PORT: env.PORT,
    ENV: env.ENV,
    SESSION: { SECRET: env.SESSION_SECRET },
    BASE_URL: env.BASE_URL,
    CALLBACK_URL: env.CALLBACK_URL,
    FRONTEND_URL: env.FRONTEND_URL,
    FRONTEND_URL_W: env.FRONTEND_URL_W,
    TWITTER: {
        CLIENT_ID: env.TWITTER_CLIENT_ID,
        CLIENT_SECRET: env.TWITTER_CLIENT_SECRET,
        APP_KEY: env.TWITTER_APP_KEY,
        APP_SECRET: env.TWITTER_APP_SECRET,
        ACCESS_TOKEN: env.TWITTER_ACCESS_TOKEN,
        ACCESS_SECRET: env.TWITTER_ACCESS_SECRET,
        BEARER_TOKEN: env.TWITTER_BEARER_TOKEN,
    },
    SUPER_ADMIN: env.SUPER_ADMIN_USERNAME,
    DATABASE: {
        DB_URI: env.DB_URI,
        DB_NAME: env.DB_NAME,
    },
};

export default CONFIG;
