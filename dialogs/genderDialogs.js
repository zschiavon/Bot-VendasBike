const { InputHints, MessageFactory } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');
const { ConfirmPrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { buildCard } = require('../services/buildCard');
const { searchApi } = require('../services/apiCall');
const { getEntities } = require('../services/recognizer');

const CONFIRM_PROMPT = 'confirmPrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class GenderDialog extends CancelAndHelpDialog {
    constructor(id, luisRecognizer) {
        super(id || 'genderDialog');

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
            const Message = 'Legal! Então me diz para quem é a magrela que você está procurando? 🚲';

            await stepContext.context.sendActivity(Message);
            return await stepContext.prompt(TEXT_PROMPT, MessageFactory.suggestedActions(['Unissex', 'Masculino', 'Feminina', 'Explorar outro filtro de pesquisa']));
        }
        return await stepContext.next();
    }

    async callStep(stepContext) {
        const { bikeVector, last } = stepContext.options;

        let bikes = bikeVector;
        let index = last + 1;

        if (!bikeVector) {
            const genero = getEntities(stepContext.context.luisResult, 'Genero');
            bikes = await searchApi('Genero', genero.entidade);
            index = 0;
        }

        const lastBike = await buildCard(bikes, index, stepContext);
        stepContext.values.bikeVector = bikes;
        stepContext.values.last = lastBike.lastPos;

        return await stepContext.prompt(TEXT_PROMPT, MessageFactory.suggestedActions(
            ['Ver mais informações', 'Ver próxima bike', 'Explorar outro filtro de pesquisa']
        ));
    }

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

    async finalStep(stepContext) {
    }
}

module.exports.GenderDialog = GenderDialog;
