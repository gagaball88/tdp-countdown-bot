const Twit = require("twitter");

const config = require("../config/config.js");

const T = new Twit(config);

exports.tweet = function (message, imageData) {
    return T.post("media/upload", {media: imageData}, function (error, media, response) {
        if (error) {
            console.log(error)
        } else {
            const status = {
                status: message,
                media_ids: media.media_id_string
            }

            T.post("statuses/update", status, function (error, tweet, response) {
                if (error) {
                    console.log(error)
                } else {
                    console.log("Successfully sent tweet: " + message)
                }
            })
        }
    })
}