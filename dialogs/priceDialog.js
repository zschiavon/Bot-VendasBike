const { InputHints, MessageFactory } = require('botbuilder');
const { ConfirmPrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { LuisRecognizer } = require('botbuilder-ai');
const { getEntities } = require('../services/recognizer');
const { searchApi } = require('../services/apiCall');
const { buildCard } = require('../services/buildCard');

const CONFIRM_PROMPT = 'confirmPrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class PriceDialog extends CancelAndHelpDialog {
    constructor(id, luisRecognizer) {
        super(id || 'priceDialog');
        if (!luisRecognizer) throw new Error('[MainDialog]: Missing parameter \'luisRecognizer\' is required');
        this.luisRecognizer = luisRecognizer;

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
        const { bikeVector, last } = stepContext.options;

        if (!this.luisRecognizer) {
            const messageText = 'NOTE: LUIS is not configured. To enable all capabilities, add `LuisAppId`, `LuisAPIKey` and `LuisAPIHostName` to the .env file.';
            await stepContext.context.sendActivity(messageText, null, InputHints.IgnoringInput);
            return await stepContext.next();
        }
        if (!bikeVector) {
            const firstMessage = 'Quanto você pretende investir na sua bicicleta? 🚴\nEscolha entre as faixas de preço abaixo:';
            await stepContext.context.sendActivity(firstMessage);

            return await stepContext.prompt(TEXT_PROMPT, MessageFactory.suggestedActions(
                ['Até R$ 500,00', 'De R$ 500,00 até R$ 1500,00', 'De R$ 1500,00 até R$ 3000,00', 'Mais de R$ 3000,00', 'Explorar outro filtro']
            ));
        }
        return await stepContext.next();
    }

    async callStep(stepContext) {
        const { bikeVector, last } = stepContext.options;

        if (LuisRecognizer.topIntent(stepContext.context.luisResult) == 'OutroFiltro') {
            return await stepContext.beginDialog('MainDialog');
        }

        let bikes = bikeVector;
        let index = last + 1;

        if (!bikeVector) {
            // const maximo = getEntities(stepContext.context.luisResult, 'maxValue');
            const price = getEntities(stepContext.context.luisResult, 'builtin.number');

            // console.log(maximo, price);
            // if (maximo != undefined) {
            //     bikes = await searchApi('preco', price.entidade, maximo.entidade);
            // } else {
            bikes = await searchApi('preco', price.entidade);
            // }
            console.log(bikes);
            index = 0;
        }

        const firstMessage = 'Tenho certeza que você vai gostar das bikes que eu encontrei!';
        await stepContext.context.sendActivity(firstMessage);

        const lastBike = await buildCard(bikes, index, stepContext);
        stepContext.values.bikeVector = bikes;
        stepContext.values.last = lastBike.lastPos;
        stepContext.values.finalBike = bikes[lastBike.lastPos];

        return await stepContext.prompt(TEXT_PROMPT, MessageFactory.suggestedActions(
            ['Ver mais informações', 'Ver próxima bike', 'Explorar outro filtro de pesquisa']
        ));
    };

    async confirmStep(stepContext) {
        const { bikeVector, last } = stepContext.options;

        if (!this.luisRecognizer) {
            return await stepContext.beginDialog('typeDialog');
        }

        switch (LuisRecognizer.topIntent(stepContext.context.luisResult)) {
        case 'MaisInfo': {
            const info = `Descrição: ${ stepContext.values.bikeVector[stepContext.values.last].description }`;
            const wish = 'Gostaria de comprar esta bicicleta agora?';

            await stepContext.context.sendActivity(info);
            await stepContext.context.sendActivity(wish);
            return await stepContext.prompt(TEXT_PROMPT, '');
        }
        case 'ProximaBike': {
            return await stepContext.replaceDialog(this.initialDialogId, { bikeVector: stepContext.values.bikeVector, last: stepContext.values.last });
        }
        case 'OutroFiltro': {
            return await stepContext.beginDialog('MainDialog');
        }
        default: {
            const didntUnderstandMessageText = `Desculpe, eu não entendi isso. Por favor, tente perguntar de uma maneira diferente (a intenção foi ${ LuisRecognizer.topIntent(luisResult) })`;
            await stepContext.context.sendActivity(didntUnderstandMessageText, didntUnderstandMessageText, InputHints.IgnoringInput);
        }
        }

        return await stepContext.next();
    }

    async decisionStep(stepContext) {
        if (LuisRecognizer.topIntent(stepContext.context.luisResult) != 'Utilities_Confirm') {
            const message = 'O que você deseja fazer então?';
            await stepContext.context.sendActivity(message);
            return await stepContext.prompt(TEXT_PROMPT, MessageFactory.suggestedActions(
                ['Ver próxima bike', 'Explorar outro filtro de pesquisa', 'Encerrar']
            ));
        }

        const bikeName = `${ stepContext.values.finalBike.name } foi adicionada ao carrinho de compras`;
        const message = 'O que você deseja fazer agora?';

        await stepContext.context.sendActivity(bikeName);
        await stepContext.context.sendActivity(message);
        return await stepContext.prompt(TEXT_PROMPT, MessageFactory.suggestedActions(
            ['Finalizar pedido', 'Continuar comprando.']
        ));
    }

    async finalStep(stepContext) {
        let message = 'EM DESENVOLVIMENTO';
        switch (LuisRecognizer.topIntent(stepContext.context.luisResult)) {
        case 'ProximaBike': {
            return await stepContext.replaceDialog(this.initialDialogId, { bikeVector: stepContext.values.bikeVector, last: stepContext.values.last })
        }
        case 'FinalizarPedido': {
            return await stepContext.beginDialog('purchaseData', { bikeVector: stepContext.values.bikeVector, last: stepContext.values.last, nameBike: stepContext.values.finalBike.name });
        }

        case 'Continuar': {
            await stepContext.context.sendActivity(message);
            break;
        }
        default: {
            await stepContext.context.sendActivity(message);
        }
        }
    }
}

module.exports.PriceDialog = PriceDialog;
