const { InputHints, MessageFactory } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');
const { ConfirmPrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const axios = require('axios');
const { buildCard } = require('../services/buildCard');
const { searchApi } = require('../services/apiCall');
const { getEntities } = require('../services/recognizer');

const CONFIRM_PROMPT = 'confirmPrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class PurchaseData extends CancelAndHelpDialog {
    constructor(id, luisRecognizer) {
        super(id || 'purchaseData');

        this.luisRecognizer = luisRecognizer;
        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.actStep.bind(this),
                this.callStep.bind(this),
                this.confirmStep.bind(this),
                this.decisionStep.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async actStep(stepContext) {
        const data = new Date();
        const { bikeVector, last, nameBike } = stepContext.options;

        if (!this.luisRecognizer) {
            const messageText = 'NOTE: LUIS is not configured. To enable all capabilities, add `LuisAppId`, `LuisAPIKey` and `LuisAPIHostName` to the .env file.';
            await stepContext.context.sendActivity(messageText, null, InputHints.IgnoringInput);
            return await stepContext.next();
        }

        const Message = `Este é seu carrinho de compras. Os valores são validos para ${data.getDate()}/${data.getMonth() + 1}/${data.getFullYear()} `;
        const valuepurchase = `Valor total: Aqui vai soma de preços`
        const confirm = 'Posso confirmar e prossegui com a compra?'
        await stepContext.context.sendActivity(Message);
        await stepContext.context.sendActivity(nameBike);
        await stepContext.context.sendActivity(valuepurchase);
        await stepContext.context.sendActivity(confirm);

        return await stepContext.prompt(TEXT_PROMPT, '');
    }

    async callStep(stepContext) {

        switch (LuisRecognizer.topIntent(stepContext.context.luisResult)) {
            case 'Utilities_Confirm': {
                const god = 'Boa escolha! Falta pouco para você finalizar a compra de sua bicicleta.'
                const paymentMethod = 'Escolha o método de pagamento'
                await stepContext.context.sendActivity(god);
                await stepContext.context.sendActivity(paymentMethod);

                return await stepContext.prompt(TEXT_PROMPT, MessageFactory.suggestedActions([
                    'Boleto', 'Cartão de crédito', 'Pix']));
            }
            case 'utili': {
                return await stepContext.replaceDialog(this.initialDialogId)
            }
            case 'Continuar': {
                await stepContext.context.sendActivity(message)
                break
            }
            default: {
                await stepContext.context.sendActivity(message);
            }
        }

    }

    async confirmStep(stepContext) {

        const messageZipCode = 'Vamos agora ao endereço de entrega. Por favor digite o cep'        
        await stepContext.context.sendActivity(messageZipCode);
        return await stepContext.prompt(TEXT_PROMPT, '');

    }

    async decisionStep(stepContext) {

        const zipeCode =  await axios.get(`https://viacep.com.br/ws/${stepContext.result}/json/`);

        console.log(zipeCode.data);
        await stepContext.context.sendActivity(zipeCode.data.cep);
        return await stepContext.prompt(TEXT_PROMPT, '');


    }

    async finalStep(stepContext) {


    }
}

module.exports.PurchaseData = PurchaseData;
