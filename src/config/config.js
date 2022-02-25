import dotenv from 'dotenv';

dotenv.config({ path: './config/config.env' })

//exports the keys
export let config = {
    appKey : process.env.API_KEY,

    appSecret : process.env.API_SECRET_KEY,

    accessToken : process.env.ACCESS_TOKEN,

    accessSecret : process.env.ACCESS_TOKEN_SECRET,

    //bearerToken : process.env.BEARER_TOKEN
}