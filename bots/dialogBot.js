const { ActivityHandler } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');

const CONVERSATION_DATA_PROPERTY = 'conversationData';
const USER_PROFILE_PROPERTY = 'userProfile';

class DialogBot extends ActivityHandler {
    constructor(conversationState, userState, dialog, luisRecognizer) {
        super();

        this.conversationDataAccessor = conversationState.createProperty(CONVERSATION_DATA_PROPERTY);
        this.userProfileAccessor = userState.createProperty(USER_PROFILE_PROPERTY);

        if (!conversationState) throw new Error('[DialogBot]: Parâmetro ausente. O estado de conversação é obrigatório');
        if (!userState) throw new Error('[DialogBot]: Parâmetro ausente. userState é obrigatório');
        if (!dialog) throw new Error('[DialogBot]: Parâmetro ausente. diálogo é necessário');

        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.dialogState = this.conversationState.createProperty('DialogState');
        this.luisRecognizer = luisRecognizer;

        this.onMessage(async (context, next) => {
            const userProfile = await this.userProfileAccessor.get(context, {});
            const conversationData = await this.conversationDataAccessor.get(
                context, { promptUser: false });

            if (!userProfile.name) {
                if (conversationData.promptUser) {
                    userProfile.name = context.activity.text;
                    conversationData.promptUser = false;
                    await next();
                } else {
                    const firstMessage = 'Oi! Eu sou o Bici JR, sou craque em pedaladas e vou funcionar como um guidão para te guiar na sua busca! 🚴';
                    const secondMessage = 'Para isso, vou dar algumas opções para você encontrar sua bike e, se assim desejar, poderá comprar ao final.';
                    await context.sendActivity(firstMessage);
                    await context.sendActivity(secondMessage);
                    conversationData.promptUser = true;
                }
            } else {
                await next();
            }

            console.log('Diálogo em execução com a atividade de mensagem.');
            context.luisResult = await this.luisRecognizer.recognize(context);
            await this.dialog.run(context, this.dialogState);
            await next();
        });
    }

    async run(context) {
        await super.run(context);
        await this.conversationState.saveChanges(context, false);
        await this.userState.saveChanges(context, false);
    };
}

module.exports.DialogBot = DialogBot;
