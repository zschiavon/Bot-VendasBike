const { MessageFactory, InputHints } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');
const { ComponentDialog, DialogSet, DialogTurnStatus, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');

const TEXT_PROMPT = 'TEXT_PROMPT';
const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';
class MainDialog extends ComponentDialog {
    constructor( typeDialog, colorDialog, genderDialog, priceDialog, purchaseData, finishDialog, fallbackDialog, cancelAndHelpDialog) {
        super('MainDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new TextPrompt('TextPrompt'))
            .addDialog(typeDialog)
            .addDialog(colorDialog)
            .addDialog(genderDialog)
            .addDialog(priceDialog)
            .addDialog(purchaseData)
            .addDialog(finishDialog)
            .addDialog(fallbackDialog)
            .addDialog(cancelAndHelpDialog)
            .addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
                this.firstStep.bind(this),
                this.actStep.bind(this)
            ]));

        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }

    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async firstStep(stepContext) {
        if (!stepContext.context.luisResult) {
            const messageText = 'NOTE: LUIS is not configured. To enable all capabilities, add `LuisAppId`, `LuisAPIKey` and `LuisAPIHostName` to the .env file.';
            await stepContext.context.sendActivity(messageText, null, InputHints.IgnoringInput);
            return await stepContext.next();
        }

        const thirdMessage = 'Escolha um dos filtros para pesquisar pela bicicleta:';
        await stepContext.context.sendActivity(thirdMessage);
        return await stepContext.prompt(TEXT_PROMPT, MessageFactory.suggestedActions(
            ['Tipo', 'Cor', 'Genero', 'Preço']
        ));
    }

    async actStep(stepContext) {
        if (!stepContext.context.luisResult) {
            return await stepContext.beginDialog('typeDialog');
        }

        switch (LuisRecognizer.topIntent(stepContext.context.luisResult)) {
        case 'FiltroTipo': return await stepContext.beginDialog('typeDialog');
        case 'FiltroCor': return await stepContext.beginDialog('colorDialog');
        case 'FiltroGenero': return await stepContext.beginDialog('genderDialog');
        case 'FiltroPreco': return await stepContext.beginDialog('priceDialog');
        default: return await stepContext.beginDialog('fallbackDialog');
        }
    }
}

module.exports.MainDialog = MainDialog;
