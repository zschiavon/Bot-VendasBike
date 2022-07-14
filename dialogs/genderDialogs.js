const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { InputHints, MessageFactory } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');
const { ConfirmPrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const axios = require('axios')


const CONFIRM_PROMPT = 'confirmPrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class GenderDialog extends CancelAndHelpDialog {
    constructor(id,luisRecognizer) {
        super(id || 'genderDialog');
        
        this.luisRecognizer = luisRecognizer
        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.firstStep.bind(this),
                this.secondStep.bind(this),
                this.travelDateStep.bind(this),
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

        const Message = 'Legal! Então me diz para quem é a magrela que você está procurando? 🚲'       

        await stepContext.context.sendActivity(Message)
        return await stepContext.prompt(TEXT_PROMPT,MessageFactory.suggestedActions(['Unissex', 'Masculino', 'Feminina', 'Explorar outro filtro de pesquisa']) );
    }


    async secondStep(stepContext) {
        const messageText = 'Tenho certeza que você vai gostar das bikes que eu encontrei!';
        await stepContext.context.sendActivity(messageText)
        return await stepContext.next();
    }

     //     console.log(luisResult);
    //     const procura = "Preto"
    //     const messageText = 'Fluxo de filtro por genero';
    //     await stepContext.context.sendActivity(messageText)

    //     const response = await axios.get('https://pb-bikes-api.herokuapp.com/bike/list')
    //     const filtrado = response.data.filter((a, index) => {

    //         if (a.color == procura) {
    //             return a.type

    //         }
    //     })
    //    // console.log(filtrado);

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

module.exports.GenderDialog = GenderDialog;
