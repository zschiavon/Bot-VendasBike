const { ConfirmPrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { LuisRecognizer } = require('botbuilder-ai');
const { MessageFactory, InputHints, CardFactory } = require('botbuilder');
const { getEntities } = require('../services/recognizer');
const { searchApi } = require('../services/apiCall');
const { buildCard } = require('../services/buildCard');

const CONFIRM_PROMPT = 'confirmPrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class PriceDialog extends CancelAndHelpDialog {
    constructor(id, luisRecognizer) {
        super(id, 'priceDialog');
        if (!luisRecognizer) throw new Error('[MainDialog]: Missing parameter \'luisRecognizer\' is required');
        this.luisRecognizer = luisRecognizer;

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.firstStep.bind(this),
                this.secondStep.bind(this),
                this.thirdStep.bind(this),
                this.confirmStep.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async firstStep(stepContext) {
        if (!this.luisRecognizer) {
            const messageText = 'NOTE: LUIS is not configured. To enable all capabilities, add `LuisAppId`, `LuisAPIKey` and `LuisAPIHostName` to the .env file.';
            await stepContext.context.sendActivity(messageText, null, InputHints.IgnoringInput);
            return await stepContext.next();
        }

        const firstMessage = 'Quanto você pretende investir na sua bicicleta? 🚴 Escolha entre as faixas de preço abaixo:';
        await stepContext.context.sendActivity(firstMessage);

        return await stepContext.prompt(TEXT_PROMPT, MessageFactory.suggestedActions(['Até R$ 500,00', 'De R$ 500,00 até R$ 1500,00', 'De R$ 1500,00 até R$ 3000,00', 'Mais de R$ 3000,00', 'Explorar outro filtro']));
    }

    async secondStep(stepContext) {
        const luisResult = await this.luisRecognizer.recognize(stepContext);
        console.log(luisResult);
        const preco = getEntities(luisResult, 'money');
        console.log(preco);
        const search = await searchApi('Preco', preco.money.entidade);
        // Arrumar uma forma do index variar pelo array de imagens e não apenas a última posição
        const index = (search.length - 1);
        await buildCard(search, index, stepContext);
        return await stepContext.prompt(TEXT_PROMPT, MessageFactory.suggestedActions(['Mais Informações sobre a bicicleta', 'Ver próxima opção de bicicleta', 'Explorar outro filtro de pesquisa']));
    };

    async thirdStep(stepContext) {
    }

    async confirmStep(stepContext) {
    }

    async finalStep(stepContext) {
    }
}

module.exports.PriceDialog = PriceDialog;
