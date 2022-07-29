const { InputHints, MessageFactory } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');
const { ConfirmPrompt, TextPrompt, ChoicePrompt, ChoiceFactory, WaterfallDialog, NumberPrompt } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { buildCardData } = require('../services/buildCardData');

const axios = require('axios');
const CONFIRM_PROMPT = 'confirmPrompt';
const TEXT_PROMPT = 'textPrompt';
const CHOICE_PROMPT = 'choicePrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class PurchaseData extends CancelAndHelpDialog {
    constructor(id) {
        super(id || 'purchaseData');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            //.addDialog(new TextPrompt(CPF_PROMPT, this.cpfValidator))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.actStep.bind(this),
                this.callStep.bind(this),
                this.confirmStep.bind(this),
                this.decisionStep.bind(this),
                this.numberHouseStep.bind(this),
                this.complementStep.bind(this),
                this.nameStep.bind(this),
                this.cpfStep.bind(this),
                this.phoneStep.bind(this),
                this.dataStep.bind(this)                
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async actStep(stepContext) {
        const purcheDetails = stepContext.options;
        const { bikeVector, last, nameBike, bike } = stepContext.options;
        const data = new Date();       
        let soma = 0;

        if (!stepContext.context.luisResult) {
            const messageText = 'NOTE: LUIS is not configured. To enable all capabilities, add `LuisAppId`, `LuisAPIKey` and `LuisAPIHostName` to the .env file.';
            await stepContext.context.sendActivity(messageText, null, InputHints.IgnoringInput);
            return await stepContext.next();
        }

        const Message = `Este é seu carrinho de compras. Os valores são validos para ${data.getDate()}/${data.getMonth() + 1}/${data.getFullYear()} `;
        await stepContext.context.sendActivity(Message);

        for (let i = 0; i < bike.length; i++) {
            const mensagem = bike[i].name
            soma += bike[i].price                        
            await stepContext.context.sendActivity(mensagem);
        }

        const valuepurchase = `Valor total: R$${soma.toFixed(2)}`
        const confirm = 'Posso confirmar e prossegui com a compra?'       
        await stepContext.context.sendActivity(valuepurchase);
        await stepContext.context.sendActivity(confirm);

        return await stepContext.prompt(TEXT_PROMPT, '');
    }

    async callStep(stepContext) {
        switch (LuisRecognizer.topIntent(stepContext.context.luisResult)) {
            case 'Utilities_Confirm': {
                const god = 'Boa escolha! Falta pouco para você finalizar a compra de sua bicicleta.';
                const paymentMethod = 'Escolha o método de pagamento';
                await stepContext.context.sendActivity(god);
                await stepContext.context.sendActivity(paymentMethod);

                return await stepContext.prompt(TEXT_PROMPT, MessageFactory.suggestedActions(
                    ['Boleto', 'Cartão de crédito', 'Pix']
                ));
            }
            
            default: {
                await stepContext.context.sendActivity(message);
            }
        }

    }

    async confirmStep(stepContext) {
        const messageZipCode = 'Vamos agora ao endereço de entrega. Por favor digite o CEP';
        await stepContext.context.sendActivity(messageZipCode);
        return await stepContext.prompt(TEXT_PROMPT, '');

    }

    async decisionStep(stepContext) {

        try {
            const response = await axios.get(`https://viacep.com.br/ws/${stepContext.result}/json/`)
            stepContext.values.zipeVector = response.data;
            console.log(stepContext.values.zipeVector);
            return await stepContext.next();

        } catch (error) {
            console.log(`não`);
            return await stepContext.beginDialog('gatherAdress');
        }


    }
    async numberHouseStep(stepContext) {
        stepContext.values.zipeVectorGather = stepContext.result;
        const zipeCode = "Anotado aqui! Qual é o número da sua residência?"
        await stepContext.context.sendActivity(zipeCode);
        return await stepContext.prompt(TEXT_PROMPT, '');
    }

    async complementStep(stepContext) {
        stepContext.values.numberHouse = stepContext.result
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
        stepContext.values.cpf = stepContext.result;

        const messageCase = 'E o seu telefone?';
        await stepContext.context.sendActivity(messageCase);
        return await stepContext.prompt(TEXT_PROMPT, '');
    }
    
    async dataStep(stepContext) {
        stepContext.values.tefefone = stepContext.result;

        let zipeVector = '';
        
        if (stepContext.values.zipeVectorGather) {
            zipeVector = stepContext.values.zipeVectorGather
        } else {
            zipeVector = stepContext.values.zipeVector
        }
        
        const numberHouse = stepContext.values.numberHouse;
        const complemento = stepContext.values.complemento;
        const name = stepContext.values.name;
        const cpf = stepContext.values.cpf;
        const telefone = stepContext.values.tefefone;
        const informacoes = {
            numberHouse,
            complemento,
            name,
            cpf,
            telefone
        };

        const dadosCliente = { ...zipeVector, ...informacoes };        
        
        return await stepContext.beginDialog('confirmData', { dados: dadosCliente, })        
    }

    

    async cpfValidator(promptContext) {
    
    }
 

}

module.exports.PurchaseData = PurchaseData;
