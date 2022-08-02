const { ConfirmPrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');

const CONFIRM_PROMPT = 'confirmPrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class GatherAdress extends CancelAndHelpDialog {
    constructor(id) {
        super(id || 'gatherAdress');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.actStep.bind(this),
                this.callStep.bind(this),
                this.confirmStep.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async actStep(stepContext) {
        const messageText = 'Não localizei o seu CEP. Mas não tem problema, é só me dizer a sua cidade junto da sigla do seu estado.';
        await stepContext.context.sendActivity(messageText);
        return await stepContext.prompt(TEXT_PROMPT, '');
    }

    async callStep(stepContext) {
        stepContext.values.city = stepContext.result;

        const messageText = 'Ok entendi qual seu bairro?';
        await stepContext.context.sendActivity(messageText);
        return await stepContext.prompt(TEXT_PROMPT, '');
    }

    async confirmStep(stepContext) {
        stepContext.values.bairro = stepContext.result;

        const messageText = 'Agora me diga qual o seu endereço?';
        await stepContext.context.sendActivity(messageText);
        return await stepContext.prompt(TEXT_PROMPT, '');
    }

    async finalStep(stepContext) {
        const logradouro = stepContext.values.logradouro = stepContext.result;
        const localidade = stepContext.values.city;
        const bairro = stepContext.values.bairro;

        const zipeVector = {
            localidade,
            bairro,
            logradouro
        };

        return await stepContext.endDialog(zipeVector);
    }
}
module.exports.GatherAdress = GatherAdress;
