const sendTweet = require("./sendTweet");
const messageBuilder = require("./messageBuilder");
const tools = require("./tools");

exports.send = async function(countdownDay, countdownMonth, countdownYear, message1, message2, messageEnd, pictureSlot) {
    let picture = tools.refreshPic(pictureSlot);
    let imageData = tools.getImageData(picture);

    const diffTime = tools.calcTimeDifference(countdownDay, countdownMonth, countdownYear, pictureSlot);

    let message = messageBuilder.countdownMessage(diffTime, message1, message2, messageEnd);

    await sendTweet.tweet(message, imageData);
    //console.log(message);
}