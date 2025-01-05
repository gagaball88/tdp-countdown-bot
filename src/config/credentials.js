import dotenv from 'dotenv';


dotenv.config({ path: './config/credentials.env' })


export let twitterConfig = {
    appKey: process.env.TWITTER_API_KEY,

    appSecret: process.env.TWITTER_API_SECRET_KEY,

    accessToken: process.env.TWITTER_ACCESS_TOKEN,

    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,

}

export let mastodonConfig = {
    url: process.env.MASTODON_URL,

    accessToken: process.env.MASTODON_ACCESS_TOKEN

}

export let tumblrConfig = {
    consumer_key: process.env.TUMBLR_CONSUMER_KEY,

    consumer_secret: process.env.TUMBLR_CONSUMER_SECRET,

    token: process.env.TUMBLR_TOKEN,

    token_secret: process.env.TUMBLR_TOKEN_SECRET


}

export let discordConfig = process.env.DISCORD_TOKEN

export let blueskyConfig = {
    identifier: process.env.BLUESKY_IDENTIFIER,

    password: process.env.BLUESKY_PASSWORD
}

export let threadsConfig = {
    username: process.env.THREADS_IDENTIFIER,

    password: process.env.THREADS_PASSWORD
}

export let pgConfig = {
    host: process.env.PG_HOST_IP,

    port: process.env.PG_HOST_PORT,

    user: process.env.PG_USERNAME,

    password: process.env.PG_PASSWORD,

    database: process.env.PG_DATABASE,
}