const { MessageFactory } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');
const { ConfirmPrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');

const CONFIRM_PROMPT = 'confirmPrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class FallbackDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || 'fallbackDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.firstStep.bind(this),
                this.secondStep.bind(this),
                this.thirdStep.bind(this),
                this.fourthStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async firstStep(stepContext) {
        const Message = 'Ihhh, parece que o pneu furou... Estou com dificuldades para entender! Você poderia repetir com outras palavras?';
        await stepContext.context.sendActivity(Message);
        return await stepContext.prompt(TEXT_PROMPT, '');
    }

    async secondStep(stepContext) {
        switch (LuisRecognizer.topIntent(stepContext.context.luisResult)) {
        case 'FiltroCor': return await stepContext.replaceDialog('colorDialog', { bikeVector: stepContext.values.bikeVector, last: stepContext.values.last });
        case 'FiltroTipo': return await stepContext.replaceDialog('typeDialog', { bikeVector: stepContext.values.bikeVector, last: stepContext.values.last });
        case 'FiltroPreco': return await stepContext.replaceDialog('priceDialog', { bikeVector: stepContext.values.bikeVector, last: stepContext.values.last });
        case 'FiltroGenero': return await stepContext.replaceDialog('genderDialog', { bikeVector: stepContext.values.bikeVector, last: stepContext.values.last });
        default: return await stepContext.next();
        }
    }

    async thirdStep(stepContext) {
        const Message = 'Sigo sem entender. Você pode ir para o menu inicial para facilitar, ou então encerrar nossa conversa.';
        await stepContext.context.sendActivity(Message);
        return await stepContext.prompt(TEXT_PROMPT, MessageFactory.suggestedActions(['Menu', 'Encerrar']));
    }

    async fourthStep(stepContext) {
        if (LuisRecognizer.topIntent(stepContext.context.luisResult) != 'Menu') {
            const Message = 'Sinto muito, ainda estou aprendendo e no momento não consigo entender o que você deseja. Mas podemos tentar conversar novamente mais tarde!';
            await stepContext.context.sendActivity(Message);
            return await stepContext.cancelAllDialogs();
        }
    }
}
module.exports.FallbackDialog = FallbackDialog;
