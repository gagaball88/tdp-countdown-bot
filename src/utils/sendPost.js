import { tumblrConfig, twitterConfig, mastodonConfig, discordConfig } from "../config/credentials.js";
import logger from "./logger.js";
import { login } from 'masto';
import fs from 'fs'
import tumblr from 'tumblr.js';
import {TwitterApi} from "twitter-api-v2";
//import { Client, Intents } from "discord.js";

const delay = ms => new Promise(res => setTimeout(res, ms));

import discordImport, { GatewayIntentBits } from 'discord.js';
import path from "path";
const { Client, Intents, AttachmentBuilder } = discordImport;


const twitterClient = new TwitterApi(twitterConfig);

const mastodonClient = await login(mastodonConfig);

const tumblrClient = tumblr.createClient(tumblrConfig);

const discordClient=new Client({ intents: [GatewayIntentBits.Guilds] });

discordClient.login(discordConfig);



//mastodonClient = await mastodonLogin(credentials.mastodonConfig);


export async function sendTweet(message, imagePath) {
    const mediaId = await Promise.all([

        twitterClient.v1.uploadMedia(imagePath),

    ]);

    await twitterClient.v1.tweet(message, { media_ids: mediaId });
    logger("Tweet sent successfully: " + message + " " + imagePath);

}

export async function sendMastodon(message, imagePath) {

    const attachment = await mastodonClient.v2.mediaAttachments.create({
        file: new Blob([fs.readFileSync(imagePath)]),
        description: 'randomly chosen from the TDP Countdown bot image library',
      });

      const attachment2 = 0;

    const status = await mastodonClient.v1.statuses.create({
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


export async function sendDiscord(message, imagePath) {

  const lastIndex = imagePath.lastIndexOf('/');

  //const path = String(imagePath).substring(0, lastIndex);

  const image = String(imagePath).substring(lastIndex + 1);

  const attachment = new AttachmentBuilder(path, { name: image })

  discordClient.guilds.cache.forEach(async (guild)=>{
    const channel = guild.channels.cache.find(channel => channel.name === 'tdp-countdown-bot')

    await channel.send({
      content: message,
      files: [{
        attachment: imagePath,
        name: image,
        description: 'TDP Pic'
      }]
    })
    })

  logger("Discord message sent successfully: " + message + " " + imagePath);
}