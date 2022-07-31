const { MessageFactory } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');
const { ConfirmPrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');

const CONFIRM_PROMPT = 'confirmPrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class ApiErrorDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || 'apiErrorDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.firstStep.bind(this),
                this.secondStep.bind(this),
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async firstStep(stepContext) {
        const Message = 'No momento estamos passando por algumas atualizações, por isso não consegui concluir a sua busca.\n O que você gostaria de fazer?';
        await stepContext.context.sendActivity(Message);
        return await stepContext.prompt(TEXT_PROMPT, MessageFactory.suggestedActions(['Tentar novamente', 'Voltar ao menu', 'Encerrar atendimento']));
    }

    async secondStep(stepContext) {
        switch (LuisRecognizer.topIntent(stepContext.context.luisResult)) {
            case 'menu': return await stepContext.beginDialog('MainDialog')
            case 'Encerrar':
                const Message = 'Tente novamente mais tarde que provavelmente conseguirei concluir sua busca. Até lá!';
                await stepContext.context.sendActivity(Message);
                return await stepContext.cancelAllDialogs();
            default:
        }
    }

}
module.exports.ApiErrorDialog = ApiErrorDialog;
