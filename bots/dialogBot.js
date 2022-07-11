const { ActivityHandler } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai')

class DialogBot extends ActivityHandler {
    
    constructor(conversationState, userState, dialog) {
        super();
        if (!conversationState) throw new Error('[DialogBot]: Parâmetro ausente. O estado de conversação é obrigatório');
        if (!userState) throw new Error('[DialogBot]: Parâmetro ausente. userState é obrigatório');
        if (!dialog) throw new Error('[DialogBot]: Parâmetro ausente. diálogo é necessário');

        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.dialogState = this.conversationState.createProperty('DialogState');

        const dispatchRecognizer = new LuisRecognizer({
            applicationId: process.env.LuisAppId,
            endpointKey: process.env.LuisAPIKey,
            endpoint: `https://${process.env.LuisAPIHostName}.cognitiveservices.azure.com/`
        }, {
            includeAllIntents: true
        }, true);

        this.onMessage(async (context, next) => {
            console.log('Diálogo em execução com a atividade de mensagem.');

            const luisResult = await dispatchRecognizer.recognize(context)
            const intent = LuisRecognizer.topIntent(luisResult);
            const entities = luisResult.entities;                   
            await this.dialog.run(context, this.dialogState, intent, entities);          
          
            await next();
        });
    }
   
    async run(context) {
        await super.run(context);       
        await this.conversationState.saveChanges(context, false);
        await this.userState.saveChanges(context, false);
    }
}

module.exports.DialogBot = DialogBot;
