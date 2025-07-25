var express = require('express');
var router = express.Router();
const https = require('https'); // 👈 加上這一行
require('dotenv').config()
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post("/webhook", function (req, res) {
  res.send("HTTP POST request sent to the webhook URL!");
  // If the user sends a message to your bot, send a reply message
  if (req.body.events[0].type === "message") {
    // You must stringify reply token and message data to send to the API server
    const dataString = JSON.stringify({
      replyToken: req.body.events[0].replyToken,
      messages: [
        {
          "type": "flex",
          "altText": "這是一則 Flex Message", // 在聊天列表和推播通知中顯示的替代文字
          "contents": {
            "type": "bubble",
            "body": {
              "type": "box",
              "layout": "vertical",
              "spacing": "md",
              "contents": [
                {
                  "type": "text",
                  "text": "Hello, user",
                  "weight": "bold",
                  "size": "xl"
                },
                {
                  "type": "text",
                  "text": "May I help you?",
                  "wrap": true
                }
              ]
            },
            "footer": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "button",
                  "style": "primary",
                  "color": "#1DB446",
                  "action": {
                    "type": "postback", // Postback action 會將資料傳回你的 webhook
                    "label": "點我顯示載入動畫",
                    "data": "action=show_loading",
                    "displayText": "我點了按鈕",
                    "loadingSeconds": 5 // 👈 正確的位置在這裡！在 Action 物件裡面
                  }
                }
              ]
            }
          }
        }
      ]
    });

    // Request header. See Messaging API reference for specification
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.CHANNEL_ACCESS_TOKEN,
    };

    // Options to pass into the request, as defined in the http.request method in the Node.js documentation
    const webhookOptions = {
      hostname: "api.line.me",
      path: "/v2/bot/message/reply",
      method: "POST",
      headers: headers,
      body: dataString,
    };

    // When an HTTP POST request of message type is sent to the /webhook endpoint,
    // we send an HTTP POST request to https://api.line.me/v2/bot/message/reply
    // that is defined in the webhookOptions variable.

    // Define our request
    const request = https.request(webhookOptions, (res) => {
      res.on("data", (d) => {
        process.stdout.write(d);
      });
    });

    // Handle error
    // request.on() is a function that is called back if an error occurs
    // while sending a request to the API server.
    request.on("error", (err) => {
      console.error(err);
    });

    // Finally send the request and the data we defined
    request.write(dataString);
    request.end();
  }
});



module.exports = router;
