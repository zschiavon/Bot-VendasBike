const { InputHints, MessageFactory } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');
const { TextPrompt, ChoicePrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');

const TEXT_PROMPT = 'textPrompt';
const CHOICE_PROMPT = 'choicePrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class RemoveBike extends CancelAndHelpDialog {
    constructor(id) {
        super(id || 'removeBike');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT, this.attemptValidator))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.firstStep.bind(this),
                this.decisionStep.bind(this),
                this.choiceStep.bind(this),
                this.updateStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async firstStep(stepContext) {
        const purcheDetails = stepContext.options;
        const { bike } = stepContext.options;

        if (!stepContext.context.luisResult) {
            const messageText = 'NOTE: LUIS is not configured. To enable all capabilities, add `LuisAppId`, `LuisAPIKey` and `LuisAPIHostName` to the .env file.';
            await stepContext.context.sendActivity(messageText, null, InputHints.IgnoringInput);
            return await stepContext.next();
        }

        let names = bike.map(bike => bike.name);

        stepContext.values.names = names;
        stepContext.values.cart = stepContext.options.bike;

        return await stepContext.prompt(TEXT_PROMPT, MessageFactory.suggestedActions(['Retirar um item do carrinho', 'Adicionar mais bicicletas ao carrinho', 'Desistir da compra']));
    }

    async decisionStep(stepContext) {
        switch (LuisRecognizer.topIntent(stepContext.context.luisResult)) {
        case 'RetirarItem':
            return await stepContext.next();
        case 'Continuar':
            return await stepContext.replaceDialog('MainDialog', { bike: stepContext.values.cart });
        case 'Encerrar':
            return await stepContext.replaceDialog('finishDialog');
        default:
            return await stepContext.replaceDialog('fallbackDialog', { bike: stepContext.values.cart });
        }
    }

    async choiceStep(stepContext) {
        let message = 'Digite o número da opção que deseja retirar do seu carrinho';
        return await stepContext.prompt(CHOICE_PROMPT, {
            prompt: message,
            retryPrompt: 'Desculpe, não entendi. Para retirar do carrinho eu preciso do número de uma das opções baixo:',
            choices: stepContext.values.names
        });
    }

    async updateStep(stepContext) {
        if (stepContext.result.erro) {
            const message = 'Sinto muito, estou com dificuldade de entender. Tente novamente daqui a pouco!';

            await stepContext.context.sendActivity(message);
            return await stepContext.cancelAllDialogs();
        };

        const namePos = stepContext.values.names.indexOf(stepContext.result.value);
        const bikePos = stepContext.values.cart.findIndex(bike => bike.name == stepContext.result.value);

        stepContext.values.names.splice(namePos, 1);
        stepContext.values.cart.splice(bikePos, 1);

        return await stepContext.replaceDialog('purchaseData', { bike: stepContext.values.cart });
    }

    async attemptValidator(promptContext) {
        if (promptContext.attemptCount > 2) {
            promptContext.recognized.succeeded = true;
            promptContext.recognized.value = { erro: true };
        }

        promptContext.recognized.succeeded = true;
        return promptContext.recognized.value;
    }
}

module.exports.RemoveBike = RemoveBike;
