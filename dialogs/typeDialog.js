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

class TypeDialog extends CancelAndHelpDialog {
    constructor(id, luisRecognizer) {
        super(id || 'typeDialog');

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
        const { bikeVector, last } = stepContext.options;

        if (!bikeVector) {
            const messageText = 'Boa escolha! Vem comigo para selecionar a sua magrela. 🚴\nQual opção está procurando?';

            await stepContext.context.sendActivity(messageText);
            return await stepContext.prompt(TEXT_PROMPT, MessageFactory.suggestedActions([
                'Infantil', 'Casual', 'Estrada', 'Mountain Bike', 'Elétrica', 'Explorar outro filtro'
            ]));
        }
        return await stepContext.next();
    }

    async callStep(stepContext) {
        const { bikeVector, last } = stepContext.options;

        let bikes = bikeVector;
        let index = last + 1;

        if (!bikeVector) {
            const type = getEntities(stepContext.context.luisResult, 'Tipo');
            bikes = await searchApi('tipo', type.entidade);
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
    }

    async confirmStep(stepContext) {
        const { bikeVector, last } = stepContext.options;

        switch (LuisRecognizer.topIntent(stepContext.context.luisResult)) {
        case 'ProximaBike': {
            return await stepContext.replaceDialog(this.initialDialogId, { bikeVector: stepContext.values.bikeVector, last: stepContext.values.last });
        }
        case 'MaisInfo': {
            const info = `Descrição: ${ stepContext.values.bikeVector[stepContext.values.last].description }`;
            const wish = 'Gostaria de comprar esta bicicleta agora?';

            await stepContext.context.sendActivity(info);
            await stepContext.context.sendActivity(wish);
            return await stepContext.prompt(TEXT_PROMPT, '');
        }

        case 'OutroFiltro': {
            return await stepContext.beginDialog('MainDialog');
        }
/*         default: {
            const msg = 'Ihhh, parece que o pneu furou... Estou com dificuldades para entender! Você poderia repetir com outras palavras?';
            return await stepContext.context.sendActivity(msg);
            // return await stepContext.beginDialog('fallbackDialog');
            // const didntUnderstandMessageText = `Desculpe, eu não entendi isso. Por favor, tente perguntar de uma maneira diferente (a intenção foi ${ LuisRecognizer.topIntent(luisResult) })`;
            // await stepContext.context.sendActivity(didntUnderstandMessageText, didntUnderstandMessageText, InputHints.IgnoringInput);
        } */
        }

        // return await stepContext.next();
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
        switch (LuisRecognizer.topIntent(stepContext.context.luisResult)) {
        case 'ProximaBike': return await stepContext.replaceDialog(this.initialDialogId, { bikeVector: stepContext.values.bikeVector, last: stepContext.values.last });
        case 'Encerrar': return await stepContext.beginDialog('finishDialog');
        case 'Continuar':
        case 'OutroFiltro': return await stepContext.beginDialog('MainDialog');
        case 'FinalizarPedido': return await stepContext.beginDialog('purchaseData', { bikeVector: stepContext.values.bikeVector, last: stepContext.values.bikeVector[stepContext.values.last].price, nameBike: stepContext.values.finalBike.name });
        // default: return await stepContext.beginDialog('fallbackDialog');
        }
    }
}

module.exports.TypeDialog = TypeDialog;
