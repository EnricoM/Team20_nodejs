/*-----------------------------------------------------------------------------
This template demonstrates how to use Waterfalls to collect input from a user using a sequence of steps.
For a complete walkthrough of creating this type of bot see the article at
https://docs.botframework.com/en-us/node/builder/chat/dialogs/#waterfall
-----------------------------------------------------------------------------*/
"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var path = require('path');

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);
bot.localePath(path.join(__dirname, './locale'));

bot.dialog('/', [
    function (session) {
        builder.Prompts.choice(session, "Hi Hans... You hungry?", ["Hell yeah", "Nahh not really"]);
    },
    function (session, results) {
        session.userData.hungry = results.response;
        builder.Prompts.choice(session, "What would you like to eat today?", ["Pizza", "Spare ribs", "something else"]); 
    },
    function (session, results) {
        session.userData.food = results.response.entity;
        session.send("" + session.userData.food + "? Excellent choice!");
        builder.Prompts.choice(session, "What pizza do you like?", ["Magaritha", "Pepperoni", "Tuna", "something different"]);
    },
    function (session, results) {
        session.userData.flavour = results.response.entity;
        session.send("Got it...I am ordering " + session.userData.food + " " +
                     session.userData.flavour + " for you.");
    }
    // function (session, results) {
    //     builder.Prompts.choice(session, "What pizza do you like?", ["Magaritha", "Pepperoni", "Tuna", "something different"]);
    // }
]);

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}
