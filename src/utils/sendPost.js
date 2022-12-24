import { tumblrConfig, twitterConfig, mastodonConfig } from "../config/credentials.js";
import logger from "./logger.js";
import { login } from 'masto';
import fs from 'fs'
import tumblr from 'tumblr.js';
import {TwitterApi} from "twitter-api-v2";


const twitterClient = new TwitterApi(twitterConfig);

const mastodonClient = await login(mastodonConfig);

const tumblrClient = tumblr.createClient(tumblrConfig);

//mastodonClient = await mastodonLogin(credentials.mastodonConfig);


export async function sendTweet(message, imagePath) {
    const mediaId = await Promise.all([

        twitterClient.v1.uploadMedia(imagePath),

    ]);

    await twitterClient.v1.tweet(message, { media_ids: mediaId });
    logger("Tweet sent successfully: " + message + " " + imagePath);

}

export async function sendMastodon(message, imagePath) {

    const attachment = await mastodonClient.mediaAttachments.create({
        file: fs.createReadStream(imagePath),
        description: 'randomly chosen from the TDP Countdown bot image library',
      });

    const status = await mastodonClient.statuses.create({
        status: message,
        visibility: 'public',
        mediaIds: [attachment.id],
      });

    logger("Mastodon post sent successfully: " + message + " " + imagePath);

}

export async function sendTumblr(message, imagePath) {


  let file = fs.createReadStream(imagePath)
  let tags = "the dragon prince, TDP Countdown"

  const status = tumblrClient.createPhotoPost("countdowntdp",{ data: file, caption: message, tags: tags }, function (err, data) {
    if (err) {
      console.error('client.createPhotoPost:', err)
    }
  })

  logger("Tumblr post sent successfully: " + message + " " + imagePath);

}
