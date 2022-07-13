const { ActivityHandler } = require('botbuilder');

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
       

        this.onMessage(async (context, next) => {
            console.log('Diálogo em execução com a atividade de mensagem.');           

            await this.dialog.run(context, this.dialogState);
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
