var restify = require('restify');
var builder = require('botbuilder');
var flights = require('./flights_search');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

var DialogLabels = {
    Hotels: 'Hotels',
    Flights: 'Flights',
    Support: 'Support'
};

//=========================================================
// Bots Dialogs
//=========================================================

/*
bot.dialog('/', [
    function (session) {
        session.send('Hello %s! Your ID is %s. You sent "%s" at %s. The address is %s %s',
			session.message.user.name,
			session.message.user.id,
			session.message.text,
			session.message.timestamp,
			session.message.address.conversation.id,
			session.message.address.isGroup ? "True" : "False");
    }
]);
*/
// Ask the user for their name and greet them by name.
bot.dialog('/', [
    /*
    // Step 1
    function (session) {
        builder.Prompts.text(session, 'Where would you like to go?');
    },
    function (session, results) {
        session.dialogData.destination = results.response;
        builder.Prompts.text(session, 'Where would you departure from?');
    },
    // Step 2
    function (session, results) {
        session.dialogData.origin = results.response;
        //builder.Prompts.time(session, 'Hello ' + session.dialogData.username + ', please provide a reservation date and time (e.g.: June 6th at 5pm)');
        builder.Prompts.time(session, 'please provide the departure date. (e.g.: MM/DD/YYYY');
    },

    function (session, results) {
        session.dialogData.reservationDate = builder.EntityRecognizer.resolveTime([results.response]);
        builder.Prompts.text(session, "How many people are in your party?");
    },
    function (session, results) {
        session.dialogData.partySize = results.response;
        builder.Prompts.text(session, "Who's name will this reservation be under?");
    },

    function (session, results) {
        //session.dialogData.reservationName = results.response;
        //session.dialogData.reservationDate = builder.EntityRecognizer.resolveTime([results.response]);
        // Process request and display reservation details
        session.send(`Reservation confirmed. <br/>Reservation details: <br/>Departure Date : ${session.dialogData.reservationDate} <br/>Destination: ${session.dialogData.destination} <br/>Reservation name: ${session.dialogData.reservationName}`);
        session.endDialog();
    }
    */
]);

// handle the proactive initiated dialog
bot.dialog('info_collection', [
    // Step 1
    function (session) {
        builder.Prompts.text(session, 'Where would you like to go?');
    },
    // Step 2
    function (session, results) {
        session.dialogData.destination = results.response;
        builder.Prompts.text(session, 'Where would you departure from?');
    },
    // Step 3
    function (session, results) {
        session.dialogData.origin = results.response;
        //builder.Prompts.time(session, 'Hello ' + session.dialogData.username + ', please provide a reservation date and time (e.g.: June 6th at 5pm)');
        builder.Prompts.time(session, 'please provide the departure date. (e.g.: MM/DD/YYYY');
    },
    // Step 4
    function (session, results) {
        //session.dialogData.reservationName = results.response;
        session.dialogData.reservationDate = builder.EntityRecognizer.resolveTime([results.response]);
        flights
            .searchFlights(session.dialogData.origin, session.dialogData.destination, session.dialogData.reservationDate)
            .then(function (recommendation) {
                console.log("in bot:", recommendation);
                
                session.send('I found one. It departure at %s and arrive %s at %s. The total duration would be %d minutes. The cost is only $%d.',
                    recommendation.departureTime, recommendation.destination, recommendation.arrivalTime, recommendation.duration, recommendation.price);
                builder.Prompts.text(session, 'Is this OK?');
            });
        //session.send(`Reservation confirmed. <br/>Reservation details: <br/>Departure Date : ${session.dialogData.reservationDate} <br/>Destination: ${session.dialogData.destination} <br/>Reservation name: ${session.dialogData.reservationName}`);
        session.endDialog();
    },

/*
    function (session) {
        // prompt for search option
        builder.Prompts.choice(
            session,
            'Are you looking for a flight or a hotel?',
            [DialogLabels.Flights, DialogLabels.Hotels],
            {
                maxRetries: 3,
                retryPrompt: 'Not a valid option'
            });
    },

    function (session, args, next) {
        if (session.message.text === "done") {
            session.send("Great, back to the original conversation");
            session.endDialog();
        } else {
            session.send('Hello, I\'m the survey dialog. I\'m interrupting your conversation to ask you a question. Type "done" to resume');
        }
    }
*/
]);

//=========================================================
// Activity Events
//=========================================================

bot.on('conversationUpdate', function (message) {
    // when user joins conversation, send instructions
    if (message.membersAdded) {
        message.membersAdded.forEach(function (identity) {
            if (identity.id === message.address.bot.id) {
                var reply = new builder.Message()
                    .address(message.address)
                    .text("Welcome to the flight booking system.");
                bot.send(reply);
                bot.beginDialog(message.address, "info_collection");
            }
        });
    }

    // Check for group conversations
    if (message.address.conversation.isGroup) {
        // Send a hello message when bot is added
        if (message.membersAdded) {
            message.membersAdded.forEach(function (identity) {
                if (identity.id === message.address.bot.id) {
                    var reply = new builder.Message()
                            .address(message.address)
                            .text("Hello everyone! I will record your conversation");
                    bot.send(reply);
                }
            });
        }

        // Send a goodbye message when bot is removed
        if (message.membersRemoved) {
            message.membersRemoved.forEach(function (identity) {
                if (identity.id === message.address.bot.id) {
                    var reply = new builder.Message()
                        .address(message.address)
                        .text("Goodbye");
                    bot.send(reply);
                }
            });
        }
    }
});