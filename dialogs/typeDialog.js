const { ConfirmPrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { LuisRecognizer } = require('botbuilder-ai');
const { MessageFactory, InputHints, CardFactory } = require('botbuilder');
const { getEntities } = require('../services/recognizer');
const { searchApi } = require('../services/apiCall');
const { buildCard } = require('../services/buildCard');
const { InputHints, MessageFactory } = require('botbuilder');
const { ConfirmPrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');

const CONFIRM_PROMPT = 'confirmPrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class TypeDialog extends CancelAndHelpDialog {
    constructor(id, luisRecognizer) {
        super(id, 'typeDialog');
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

        const firstMessage = 'Boa escolha! Vem comigo para selecionar a sua magrela. 🚴';
        await stepContext.context.sendActivity(firstMessage);

        const secondMessage = 'Qual opção está procurando?';
        await stepContext.context.sendActivity(secondMessage);

        return await stepContext.prompt(TEXT_PROMPT, MessageFactory.suggestedActions(['Infantil', 'Casual', 'Estrada', 'Mountain Bike', 'Elétrica', 'Explorar outro filtro']));
    }

    async secondStep(stepContext) {
        const luisResult = await this.luisRecognizer.recognize(stepContext);
        const tipo = getEntities(luisResult, 'Tipo');
        const search = await searchApi('Tipo', tipo.entidade);
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

module.exports.TypeDialog = TypeDialog;