const { InputHints, MessageFactory } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');
const { ConfirmPrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const axios = require('axios');
const { buildCardData } = require('../services/buildCardData');
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
                this.complementStep.bind(this),
                this.nameStep.bind(this),
                this.cpfStep.bind(this),                
                this.phoneStep.bind(this),                
                this.dataStep.bind(this)               
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async actStep(stepContext) {
        const data = new Date();
        const { bikeVector, last, nameBike } = stepContext.options;

        if (!stepContext.context.luisResult) {
            const messageText = 'NOTE: LUIS is not configured. To enable all capabilities, add `LuisAppId`, `LuisAPIKey` and `LuisAPIHostName` to the .env file.';
            await stepContext.context.sendActivity(messageText, null, InputHints.IgnoringInput);
            return await stepContext.next();
        }

        const Message = `Este é seu carrinho de compras. Os valores são validos para ${data.getDate()}/${data.getMonth() + 1}/${data.getFullYear()} `;
        const valuepurchase = `Valor total: ${last}`
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

        try {

            const response = await axios.get(`https://viacep.com.br/ws/${stepContext.result}/json/`)
            const zipeCode = "Anotado aqui! Qual é o número da sua residência?"
            await stepContext.context.sendActivity(zipeCode);
            stepContext.values.zipeVector = response.data;
            return await stepContext.prompt(TEXT_PROMPT, '');

        } catch (error) {
            console.log(`não`);
            return await stepContext.prompt(TEXT_PROMPT, '');
        }

               
    }

    async complementStep(stepContext) {
        stepContext.values.numberHouse = stepContext.result
        console.log(stepContext.values.numberHouse);

        const messageCase = "Se for o caso informe o complemento"
        await stepContext.context.sendActivity(messageCase);

        return await stepContext.prompt(TEXT_PROMPT, '');

    }

    async nameStep(stepContext) {
        stepContext.values.complemento = stepContext.result

        const messageCase = "Agora faltam poucas pedaladas para chegarmos ao final. Por favor, digite o seu nome completo."
        await stepContext.context.sendActivity(messageCase);
        return await stepContext.prompt(TEXT_PROMPT, '');
    }

    async cpfStep(stepContext) {

        stepContext.values.name = stepContext.result

        const messageCase = "Qual o CPF?"
        await stepContext.context.sendActivity(messageCase);
        return await stepContext.prompt(TEXT_PROMPT, '');

    }

    async phoneStep(stepContext) {
        stepContext.values.cpf = stepContext.result

        const messageCase = "E o seu telefone?"
        await stepContext.context.sendActivity(messageCase);
        return await stepContext.prompt(TEXT_PROMPT, '');
    }

    async dataStep(stepContext) {
        stepContext.values.tefefone = stepContext.result

        const zipeVector = stepContext.values.zipeVector
        const numberHouse = stepContext.values.numberHouse
        const complemento = stepContext.values.complemento
        const name = stepContext.values.name
        const cpf = stepContext.values.cpf
        const telefone = stepContext.values.tefefone
        const informacoes = {
            numberHouse,
            complemento,
            name,
            cpf,
            telefone
        }
       
        const messageCase = "Para finalizarmos a compra confirme seus dados"
        const messageCase1 = "dados informados"
        const messageCase2 = "Todos os dados estão corretos?"
        await stepContext.context.sendActivity(messageCase);
        await stepContext.context.sendActivity(messageCase1);
        const lastBike = await buildCardData(zipeVector, informacoes, stepContext);
        await stepContext.context.sendActivity(messageCase2);
        return await stepContext.prompt(TEXT_PROMPT, '');
        
    }

    async finalStep(stepContext) {
        console.log(LuisRecognizer.topIntent(stepContext.context.luisResult));
        switch (LuisRecognizer.topIntent(stepContext.context.luisResult)) {
            case 'Utilities_Confirm': {
                const finalMessage = `Parabéns! Você acabou de finalizar a sua compra. Este é o número do seu pedido: ${Math.floor(Math.random() * 65536)}.`                
                await stepContext.context.sendActivity(finalMessage);               

                return await stepContext.beginDialog('finishDialog');
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

}

module.exports.PurchaseData = PurchaseData;
