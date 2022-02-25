import {config} from "../config/config.js";
import logger from "./logger.js";

import {TwitterApi} from "twitter-api-v2";


const client = new TwitterApi(config);


export default async function sendTweet(message, imagePath) {
    const mediaId = await Promise.all([

        client.v1.uploadMedia(imagePath),

    ]);

    await client.v1.tweet(message, { media_ids: mediaId });
    logger("Tweet sent successfully: " + message);

}
