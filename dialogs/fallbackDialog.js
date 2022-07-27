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
                this.thirdStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async firstStep(stepContext) {
        const Message = 'Ihhh, parece que o pneu furou... Estou com dificuldades para entender! Você poderia repetir com outras palavras? FUNCIONOUUUU';
        await stepContext.context.sendActivity(Message);
        return await stepContext.prompt(TEXT_PROMPT, '');
    }

    // TODO: Direcionar para step correto do fluxo. ONPROMPT
    async secondStep(stepContext) {
        switch (LuisRecognizer.topIntent(stepContext.context.luisResult)) {
        case 'FiltroCor': return await stepContext.continueDialog('colorDialog');
        case 'FiltroTipo': return await stepContext.beginDialog('typeDialog');
        case 'FiltroPreco': return await stepContext.beginDialog('priceDialog');
        case 'FiltroGenero': return await stepContext.beginDialog('genderDialog');
        default: return await stepContext.next();
        }
    }

    async thirdStep(stepContext) {

    }
}
module.exports.FallbackDialog = FallbackDialog;
