const { MessageFactory } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');
const { ConfirmPrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');

const CONFIRM_PROMPT = 'confirmPrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class ApiErrorDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || 'apiErrorDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.firstStep.bind(this),
                this.secondStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async firstStep(stepContext) {
        const purcheDetails = stepContext.options;
        const { from, bike } = stepContext.options;

        const errorMessage = 'No momento estamos passando por algumas atualizações, por isso não consegui concluir a sua busca';
        const awaitMessage = 'O que você gostaria de fazer?';

        await stepContext.context.sendActivity(errorMessage);
        await stepContext.context.sendActivity(awaitMessage);

        return await stepContext.prompt(TEXT_PROMPT, MessageFactory.suggestedActions(['Tentar novamente', 'Voltar ao menu', 'Encerrar atendimento']));
    }

    async secondStep(stepContext) {
        const { from, bike } = stepContext.options;

        switch (LuisRecognizer.topIntent(stepContext.context.luisResult)) {
        case 'Menu':
            return await stepContext.replaceDialog('MainDialog', { bike: stepContext.options.bike });
        case 'TentarNovamente':
            return await stepContext.replaceDialog(stepContext.options.from, { bike: stepContext.options.bike });
        case 'Encerrar': {
            const Message = 'Tente novamente mais tarde que provavelmente conseguirei concluir sua busca. Até lá!';
            await stepContext.context.sendActivity(Message);
            return await stepContext.cancelAllDialogs();
        }
        default: {
            const msg = 'Não foi possível reconhecer sua resposta';
            await stepContext.context.sendActivity(msg);
            return await stepContext.replaceDialog(this.initialDialogId, { bike: stepContext.options.bike });
        }
        }
    }
}
module.exports.ApiErrorDialog = ApiErrorDialog;
