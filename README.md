# tdp-countdown-bot
Bot that counts down to/up from a specified date with custom text/images

## Usage
Steps to set up this bot:

1. Download the latest [release](https://github.com/gagaball88/tdp-countdown-bot/releases/tag/Releases/latest) and extract it to a folder of your choice.
2. Replace the contents of `src/config/config.json` with your own countdowns.
3. Add your Platform API Keys for Twitter, Mastodon, Tumblr and Discord to `src/config/credentials.env.test` and rename the file to `credentials.env`.
4. Add pictures to the slot subfolders in `src/pictures/` (as specified in `src/config/config.json` previously).
5. For the bot to work, you need to install the latest version of Node.js for your OS from [here](https://nodejs.org/en/download/current).
6. Once Node.js is installed, open the CLI of your choice/OS and navigate to the root path of the copy of this repository you downloaded earlier (the folder containing the file `package.json`)
7. Type `npm install` to install all the dependencies the bot needs to work.
8. To run the bot, type `npm run start`.

Congrats! The bot should now be up and running!
