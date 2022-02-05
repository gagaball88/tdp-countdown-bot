# tdp-countdown-bot
twitter bot that counts down to a specified date with custom text/images

to run the bot, download this repository, add pictures to the "pictures" folder, get a list of all pictures with 

ls | sed 's/.*/"&",/'

and add the output to the one of the collection*.js files in /src/databases.

add your twitter keys to the /src/config/config.env.test file and follow further instructions inside that file.

go to the root folder (with the package.json file) and run npm install

then run npm start
