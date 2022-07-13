const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { MessageFactory, InputHints, CardFactory } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');
const { ComponentDialog, DialogSet, DialogTurnStatus, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const moment = require('moment-timezone');

const TEXT_PROMPT = 'TEXT_PROMPT'
const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';

class MainDialog extends ComponentDialog {
    constructor(luisRecognizer, typeDialog) {
        super('MainDialog');

        if (!luisRecognizer) throw new Error('[MainDialog]: Missing parameter \'luisRecognizer\' is required');
        this.luisRecognizer = luisRecognizer;

        if (!typeDialog) throw new Error('[MainDialog]: Missing parameter \'typeDialog\' is required');

        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new TextPrompt('TextPrompt'))
            .addDialog(typeDialog)
            .addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
                this.introStep.bind(this),
                this.actStep.bind(this),
                this.finalStep.bind(this)
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

    async introStep(stepContext) {

        if (!this.luisRecognizer) {
            const messageText = 'NOTE: LUIS is not configured. To enable all capabilities, add `LuisAppId`, `LuisAPIKey` and `LuisAPIHostName` to the .env file.';
            await stepContext.context.sendActivity(messageText, null, InputHints.IgnoringInput);
            return await stepContext.next();
        }

        const firstMessage = "Oi! Eu sou o Bici JR, sou craque em pedaladas e vou funcionar como um guidão para te guiar na sua busca! 🚴"
        const secondMessage = "Para isso, vou dar algumas opções para você encontrar sua bike e, se assim desejar, poderá comprar ao final."
        const thirdMessage = "Escolha um dos filtros para pesquisar pela bicicleta: "        
        
        await stepContext.context.sendActivity(firstMessage)
        await stepContext.context.sendActivity(secondMessage)
        await stepContext.context.sendActivity(thirdMessage)

        return await stepContext.prompt(TEXT_PROMPT,MessageFactory.suggestedActions(['Tipo', 'cor', 'Gênero', 'Preço']));

    }


    async actStep(stepContext) {       

        if (!this.luisRecognizer) {          
            return await stepContext.beginDialog('typeDialog');
        }
        
        const luisResult = await this.luisRecognizer.recognize(stepContext)        

        switch (LuisRecognizer.topIntent(luisResult)) {
            case 'FiltroTipo': {                
                console.log("estou no tipo");
                return await stepContext.beginDialog('typeDialog');
            }
            case 'cor': {
              console.log("estou na cor");
            }
            default: {                
                const didntUnderstandMessageText = `Desculpe, eu não entendi isso. Por favor, tente perguntar de uma maneira diferente (a intenção foi ${LuisRecognizer.topIntent(luisResult)})`;
                await stepContext.context.sendActivity(didntUnderstandMessageText, didntUnderstandMessageText, InputHints.IgnoringInput);
            }
        }

        return await stepContext.next();
    }  
    
    async showWarningForUnsupportedCities(context, fromEntities, toEntities) {
        const unsupportedCities = [];
        if (fromEntities.from && !fromEntities.airport) {
            unsupportedCities.push(fromEntities.from);
        }

        if (toEntities.to && !toEntities.airport) {
            unsupportedCities.push(toEntities.to);
        }

        if (unsupportedCities.length) {
            const messageText = `Sorry but the following airports are not supported: ${unsupportedCities.join(', ')}`;
            await context.sendActivity(messageText, messageText, InputHints.IgnoringInput);
        }
    }
    
    async finalStep(stepContext) {
        if (stepContext.result) {
            const result = stepContext.result;
            
            const timeProperty = new TimexProperty(result.travelDate);
            const travelDateMsg = timeProperty.toNaturalLanguage(new Date(Date.now()));
            const msg = `I have you booked to ${result.destination} from ${result.origin} on ${travelDateMsg}.`;
            await stepContext.context.sendActivity(msg, msg, InputHints.IgnoringInput);
        }

       
        return await stepContext.replaceDialog(this.initialDialogId, { restartMsg: 'What else can I do for you?' });
    }
}

module.exports.MainDialog = MainDialog;
