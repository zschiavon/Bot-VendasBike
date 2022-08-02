const { InputHints, MessageFactory } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');
const { ConfirmPrompt, TextPrompt, ChoicePrompt, ChoiceFactory, WaterfallDialog, NumberPrompt } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { cpfValidatorFN } = require('../services/cpfValidator');

const axios = require('axios');
const CONFIRM_PROMPT = 'confirmPrompt';
const TEXT_PROMPT = 'textPrompt';
const CHOICE_PROMPT = 'choicePrompt';
const WATERFALL_DIALOG = 'waterfallDialog';
const CPF_PROMPT = 'cpfPrompt';
const PHONE_PROMPT = 'phonePromp';

class PurchaseData extends CancelAndHelpDialog {
    constructor(id) {
        super(id || 'purchaseData');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new TextPrompt(CPF_PROMPT, this.cpfValidator))
            .addDialog(new TextPrompt(PHONE_PROMPT, this.phoneValidator))
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

        if (bike.length == 0) {
            const emptyCartMessage = 'Ops, o seu carrinho está vazio! Um segundo, irei te redirecionar ao menu...';
            await stepContext.context.sendActivity(emptyCartMessage, null, InputHints.IgnoringInput);
            return await stepContext.replaceDialog('MainDialog');
        }
        if (!stepContext.context.luisResult) {
            const messageText = 'NOTE: LUIS is not configured. To enable all capabilities, add `LuisAppId`, `LuisAPIKey` and `LuisAPIHostName` to the .env file.';
            await stepContext.context.sendActivity(messageText, null, InputHints.IgnoringInput);
            return await stepContext.next();
        }

        const Message = `Este é seu carrinho de compras. Os valores são validos para ${ data.getDate() }/${ data.getMonth() + 1 }/${ data.getFullYear() } `;
        await stepContext.context.sendActivity(Message);

        for (let i = 0; i < bike.length; i++) {
            const mensagem = `${ [i + 1] } - ${ bike[i].name }`;
            soma += bike[i].price;
            await stepContext.context.sendActivity(mensagem);
        }

        const valuepurchase = `Valor total: R$${ soma.toFixed(2) }`;
        const confirm = 'Posso confirmar e prosseguir com a compra?';
        await stepContext.context.sendActivity(valuepurchase);
        await stepContext.context.sendActivity(confirm);

        return await stepContext.prompt(TEXT_PROMPT, '');
    }

    async callStep(stepContext) {
        const purcheDetails = stepContext.options;
        const { bikeVector, last, nameBike, bike } = stepContext.options;

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
            return await stepContext.replaceDialog('removeBike', { bike: stepContext.options.bike });
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
            const response = await axios.get(`https://viacep.com.br/ws/${ stepContext.result }/json/`);
            stepContext.values.zipeVector = response.data;
            return await stepContext.next();
        } catch (error) {
            return await stepContext.beginDialog('gatherAdress');
        }
    }

    async numberHouseStep(stepContext) {
        stepContext.values.zipeVectorGather = stepContext.result;
        const zipeCode = 'Anotado aqui! Qual é o número da sua residência?';
        await stepContext.context.sendActivity(zipeCode);
        return await stepContext.prompt(TEXT_PROMPT, '');
    }

    async complementStep(stepContext) {
        stepContext.values.numberHouse = stepContext.result;
        const messageCase = 'Se for o caso informe o complemento';

        await stepContext.context.sendActivity(messageCase);
        return await stepContext.prompt(TEXT_PROMPT, '');
    }

    async nameStep(stepContext) {
        stepContext.values.complemento = stepContext.result;
        const messageCase = 'Agora faltam poucas pedaladas para chegarmos ao final. Por favor, digite o seu nome completo.';

        await stepContext.context.sendActivity(messageCase);
        return await stepContext.prompt(TEXT_PROMPT, '');
    }

    async cpfStep(stepContext) {
        stepContext.values.name = stepContext.result;

        let message = 'Qual o seu CPF?';
        return await stepContext.prompt(CPF_PROMPT, {
            prompt: message,
            retryPrompt: 'Por favor, digite um número de CPF válido.'
        });
    }

    async phoneStep(stepContext) {
        stepContext.values.cpf = stepContext.result;

        let message = 'E o seu telefone?';
        return await stepContext.prompt(PHONE_PROMPT, {
            prompt: message,
            retryPrompt: 'Por favor, digite um número de telefone válido.'
        });
    }

    async dataStep(stepContext) {
        stepContext.values.tefefone = stepContext.result;

        let zipeVector = '';

        if (stepContext.values.zipeVectorGather) {
            zipeVector = stepContext.values.zipeVectorGather;
        } else {
            zipeVector = stepContext.values.zipeVector;
        }

        const numeroCasa = stepContext.values.numberHouse;
        const complemento = stepContext.values.complemento;
        const nome = stepContext.values.name;
        const cpf = stepContext.values.cpf;
        const telefone = stepContext.values.tefefone;
        const informacoes = {
            numeroCasa,
            complemento,
            nome,
            cpf,
            telefone
        };

        const dadosCliente = { ...zipeVector, ...informacoes };

        return await stepContext.replaceDialog('confirmData', { dados: dadosCliente });
    }

    async cpfValidator(promptContext) {
        const { context } = promptContext;
        promptContext.recognized.value = promptContext.recognized.value.replace(/[a-zA-Z]+/g, '').trim();
        promptContext.recognized.value = promptContext.recognized.value.replace(/\W+/g, '').trim();

        const cpf = await cpfValidatorFN(promptContext.recognized.value, false);
        const confirm = [true];

        if (confirm.includes(cpf)) {
            promptContext.recognized.succeeded = true;
            return true;
        }
        return false;
    }

    async phoneValidator(promptContext) {
        const { context } = promptContext;

        const phoneNum = await validPhone(promptContext.recognized.value, false);
        const confirm = [true];

        if (confirm.includes(phoneNum)) {
            promptContext.recognized.succeeded = true;
            return true;
        }
        return false;

        function validPhone(context) {
            const regex = /^1\d\d(\d\d)?$|^0800 ?\d{3} ?\d{4}$|^(\(0?([1-9a-zA-Z][0-9a-zA-Z])?[1-9]\d\) ?|0?([1-9a-zA-Z][0-9a-zA-Z])?[1-9]\d[ .-]?)?(9|9[ .-])?[2-9]\d{3}[ .-]?\d{4}$/;

            return regex.test(context);
        }
    }
}

module.exports.PurchaseData = PurchaseData;
