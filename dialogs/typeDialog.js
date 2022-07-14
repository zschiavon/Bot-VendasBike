const { InputHints, MessageFactory } = require('botbuilder');
const { ConfirmPrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');

const CONFIRM_PROMPT = 'confirmPrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class TypeDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || 'typeDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.typeMenuStep.bind(this),
                this.secondStep.bind(this),
                this.thirdStep.bind(this),
                this.confirmStep.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async typeMenuStep(stepContext) {
        const firstMessage = 'Boa escolha! Vem comigo para selecionar a sua magrela. 🚴';
        await stepContext.context.sendActivity(firstMessage);

        return await stepContext.prompt(TEXT_PROMPT, MessageFactory.suggestedActions(['Infantil', 'Casual', 'Estrada', 'Mountain Bike', 'Elétrica', 'Explorar outro filtro']));
    }

    async secondStep(stepContext){

    }

    async thirdStep(stepContext){

    }

    async confirmStep(stepContext){

    }

    async finalStep(stepContext){

    }

}

module.exports.TypeDialog = TypeDialog;