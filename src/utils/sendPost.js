import { tumblrConfig, twitterConfig, mastodonConfig, discordConfig, blueskyConfig, threadsConfig } from "../config/credentials.js";
import { createRestAPIClient } from 'masto';
import fs from 'fs';
import logger from './logger.js';
import tumblr from 'tumblr.js';
import { TwitterApi } from "twitter-api-v2";
import { AtpAgent } from '@atproto/api'
import discordImport, { GatewayIntentBits } from 'discord.js';
import path from "path";
const { Client, AttachmentBuilder } = discordImport;


const twitterClient = new TwitterApi(twitterConfig);

const blueskyClient = new AtpAgent({
  service: 'https://bsky.social'
});
try { await blueskyClient.login(blueskyConfig) }
catch (e) { logger(e) }

const mastodonClient = createRestAPIClient(mastodonConfig);

const tumblrClient = tumblr.createClient(tumblrConfig);

const discordClient = new Client({ intents: [GatewayIntentBits.Guilds] });
discordClient.login(discordConfig);

export async function sendTweet(message, imagePath) {
  const mediaId = await Promise.all([

    twitterClient.v1.uploadMedia(imagePath),

  ]);

  await twitterClient.v2.tweet({ text: message, media: { media_ids: mediaId } });
  logger("Tweet sent");

}

export async function sendBluesky(message, imagePath) {

  const byteArray = fs.readFileSync(imagePath);

  let format = imagePath.substr(imagePath.length - 3);
  let picUpload
  if (format === "png") {
    picUpload = await blueskyClient.uploadBlob(byteArray, { encoding: "image/png" });
  }
  else if (format === "jpg" || format === "peg") {
    picUpload = await blueskyClient.uploadBlob(byteArray, { encoding: "image/jpg" });
  }
  await blueskyClient.post({
    text: message,
    embed: {
      images: [
        {
          image: picUpload.data.blob,
          alt: "",
        },
      ],
      $type: "app.bsky.embed.images",
    },
  });

  logger("Bluesky post sent");
}

export async function sendMastodon(message, imagePath) {

  const attachment1 = await mastodonClient.v2.media.create({
    file: new Blob([fs.readFileSync(imagePath)]),
    description: "randomly chosen from the TDP Countdown bot image library",
  });

  const status = await mastodonClient.v1.statuses.create({
    status: message,
    visibility: "public",
    mediaIds: [attachment1.id],
  });

  logger("Mastodon post sent");

}

export async function sendTumblr(message, imagePath) {

  let file = fs.createReadStream(imagePath)
  let tags = "the dragon prince, TDP Countdown"

  let blogName = "countdowntdp"

  await tumblrClient.createPost(blogName, {
    content: [
      {
        "type": "text",
        "text": message
      },
      {
        type: 'image',
        media: file,
        alt_text: 'random screenshot from The Dragon Prince'
      }
    ],
    tags: [tags]
  });

  logger("Tumblr post sent");

}


export async function sendDiscord(message, imagePath) {

  const lastIndex = imagePath.lastIndexOf('/');

  const image = String(imagePath).substring(lastIndex + 1);

  const attachment = new AttachmentBuilder(path, { name: image })

  discordClient.guilds.cache.forEach(async (guild) => {
    const channel = guild.channels.cache.find(channel => channel.name === 'tdp-countdown-bot')

    let serverName = guild.name;
    logger("...sending on Server: " + serverName)

    try {
      await channel.send({
        content: message,
        files: [{
          attachment: imagePath,
          name: image,
          description: 'TDP Pic'
        }]
      })
    }

    catch (e) {
      logger(e);
    }

  })

  logger("Discord messages sent");

}