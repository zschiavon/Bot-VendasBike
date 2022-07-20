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
        if (!luisRecognizer) throw new Error('[TypeDialog]: Missing parameter \'luisRecognizer\' is required');
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
        /* if (!this.luisRecognizer) {
            const messageText = 'NOTE: LUIS is not configured. To enable all capabilities, add `LuisAppId`, `LuisAPIKey` and `LuisAPIHostName` to the .env file.';
            await stepContext.context.sendActivity(messageText, null, InputHints.IgnoringInput);
            return await stepContext.next();
        } */

        if (!bikeVector) {
            const messageText = 'Boa escolha! Vem comigo para selecionar a sua magrela. 🚴';
            const messageText2 = 'Qual opção está procurando?';

            await stepContext.context.sendActivity(messageText);
            await stepContext.context.sendActivity(messageText2);
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

        return await stepContext.prompt(TEXT_PROMPT, MessageFactory.suggestedActions(
            ['Ver mais informações', 'Ver próxima bike', 'Explorar outro filtro de pesquisa']
        ));
    }

    async confirmStep(stepContext) {
        const { bikeVector, last } = stepContext.options;
        console.log(stepContext.values.last, stepContext.values.bikeVector);
        console.log(LuisRecognizer.topIntent(stepContext.context.luisResult));

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
    }

    async finalStep(stepContext) {
    }
}

module.exports.TypeDialog = TypeDialog;
