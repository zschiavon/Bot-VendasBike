const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { InputHints, MessageFactory } = require('botbuilder');
const { ConfirmPrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');


const CONFIRM_PROMPT = 'confirmPrompt';

const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class TypeDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || 'typeDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))

            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.destinationStep.bind(this),
                this.originStep.bind(this),
                this.travelDateStep.bind(this),
                this.confirmStep.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async destinationStep(stepContext) {

        const messageText = 'Fluxo de filtro por tipo';
        await stepContext.context.sendActivity(messageText)
        return await stepContext.prompt(TEXT_PROMPT, '');
    }


    async originStep(stepContext) {

        const messageText = 'From what city will you be travelling?';
        await stepContext.context.sendActivity(messageText)
        return await stepContext.next();
    }

    async travelDateStep(stepContext) {
        const bookingDetails = stepContext.options;

        bookingDetails.origin = stepContext.result;
        if (!bookingDetails.travelDate || this.isAmbiguous(bookingDetails.travelDate)) {
            return await stepContext.beginDialog(DATE_RESOLVER_DIALOG, { date: bookingDetails.travelDate });
        }
        return await stepContext.next(bookingDetails.travelDate);
    }

    async confirmStep(stepContext) {
        const bookingDetails = stepContext.options;

        bookingDetails.travelDate = stepContext.result;
        const messageText = `Please confirm, I have you traveling to: ${bookingDetails.destination} from: ${bookingDetails.origin} on: ${bookingDetails.travelDate}. Is this correct?`;
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);

        return await stepContext.prompt(CONFIRM_PROMPT, { prompt: msg });
    }

    async finalStep(stepContext) {
        if (stepContext.result === true) {
            const bookingDetails = stepContext.options;
            return await stepContext.endDialog(bookingDetails);
        }
        return await stepContext.endDialog();
    }

    isAmbiguous(timex) {
        const timexPropery = new TimexProperty(timex);
        return !timexPropery.types.has('definite');
    }
}

module.exports.TypeDialog = TypeDialog;
