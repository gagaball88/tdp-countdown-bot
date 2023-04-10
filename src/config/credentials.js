import dotenv from 'dotenv';


dotenv.config({ path: './config/credentials.env' })

//exports the keys


export let twitterConfig = {
    appKey : process.env.TWITTER_API_KEY,

    appSecret : process.env.TWITTER_API_SECRET_KEY,

    accessToken : process.env.TWITTER_ACCESS_TOKEN,

    accessSecret : process.env.TWITTER_ACCESS_TOKEN_SECRET,

    //bearerToken : process.env.TWITTER_BEARER_TOKEN
};

export let mastodonConfig = {
    url : process.env.MASTODON_URL,

    accessToken : process.env.MASTODON_ACCESS_TOKEN,

}

export let tumblrConfig = {
    consumer_key: process.env.TUMBLR_CONSUMER_KEY,

    consumer_secret: process.env.TUMBLR_CONSUMER_SECRET,

    token: process.env.TUMBLR_TOKEN,

    token_secret: process.env.TUMBLR_TOKEN_SECRET
}

export let discordConfig = process.env.DISCORD_TOKEN