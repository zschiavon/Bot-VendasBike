const { DialogBot } = require('./dialogBot');

class DialogAndWelcomeBot extends DialogBot {
    constructor(conversationState, userState, dialog, luisRecognizer) {
        super(conversationState, userState, dialog, luisRecognizer);

        this.onMembersAdded(async (context, next) => {
            await next();
        });
    }
}

module.exports.DialogAndWelcomeBot = DialogAndWelcomeBot;
