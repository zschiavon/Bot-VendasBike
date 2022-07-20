const { InputHints, MessageFactory } = require('botbuilder');
const { ConfirmPrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { LuisRecognizer } = require('botbuilder-ai');
const { getEntities } = require('../services/recognizer')
const { searchApi } = require('../services/apiCall')
const { buildCard } = require('../services/buildCard')

const CONFIRM_PROMPT = 'confirmPrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';
class ColorDialog extends CancelAndHelpDialog {
    constructor(id, luisRecognizer) {

        super(id || 'colorDialog');
        if (!luisRecognizer) throw new Error('[ColorDialog]: Missing parameter \'luisRecognizer\' is required');
        this.luisRecognizer = luisRecognizer;        

        this.addDialog(new TextPrompt(TEXT_PROMPT))            
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.colorStep.bind(this),
                this.actStep.bind(this),
                this.callStep.bind(this),
                this.confirmStep.bind(this),
                this.decisionStep.bind(this),
                this.finalStep.bind(this),
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async colorStep(stepContext) { 
        const {bikeVector, last} = stepContext.options
        
        if(!bikeVector){
            const messageText = "Qual a que cor você quer para a sua bicicleta?";
            await stepContext.context.sendActivity(messageText);
            return await stepContext.prompt(TEXT_PROMPT, '');
        }        
        
        return await stepContext.next();       

    }
        
    async actStep(stepContext) {        
        const {bikeVector, last} = stepContext.options
        
        if(!bikeVector){                    
            const color = getEntities(stepContext.context.luisResult, 'Cor')            
            
            if(color.entidade != undefined){            
                return await stepContext.next(color);           
            }  
            
            return await stepContext.prompt(TEXT_PROMPT,MessageFactory.suggestedActions([
                '\n\nBranca', '\n\nPreta', '\n\nAzul', '\n\nRosa', '\n\nVerde', '\n\nVermelha', '\n\nOutras cores', '\n\nExplorar outro filtro de pesquisa']));
                
            }
            return await stepContext.next();
        }

    async callStep(stepContext) {            
            const {bikeVector, last} = stepContext.options
            
            let bikes = bikeVector
            let index = last + 1          
            
            if(!bikeVector){ 
                bikes = await searchApi('cor', stepContext.result.entidade)        
                index = 0 
            }  

            const firstMessage = 'Tenho certeza que você vai gostar das bikes que eu encontrei!'
            await stepContext.context.sendActivity(firstMessage)
            const lastBike = await buildCard(bikes, index, stepContext)

            stepContext.values.bikeVector = bikes
            stepContext.values.last = lastBike.lastPos
            stepContext.values.finalBike = bikes[lastBike.lastPos]

            return await stepContext.prompt(TEXT_PROMPT,MessageFactory.suggestedActions([
                '\n\nVer mais informações', '\n\nVer próxima bike', '\n\nExplorar outro filtro de pesquisa']));
            
        }
        
    async confirmStep(stepContext) {
            const {bikeVector, last} = stepContext.options            
            
            switch (LuisRecognizer.topIntent(stepContext.context.luisResult)) {
                case 'ProximaBike': {                
                    return await stepContext.replaceDialog(this.initialDialogId, { bikeVector: stepContext.values.bikeVector , last: stepContext.values.last })                    
                }
                case 'MaisInfo': {                    
                   const info =`Descrição: ${stepContext.values.bikeVector[stepContext.values.last].description}`               
                   const wish = 'Gostaria de comprar esta bicicleta agora?'
                   await stepContext.context.sendActivity(info)
                   await stepContext.context.sendActivity(wish)
                   return await stepContext.prompt(TEXT_PROMPT, '');
                  
                }
                default: {                
                    const didntUnderstandMessageText = `Desculpe, eu não entendi isso. Por favor, tente perguntar de uma maneira diferente (a intenção foi ${LuisRecognizer.topIntent(luisResult)})`;
                    await stepContext.context.sendActivity(didntUnderstandMessageText, didntUnderstandMessageText, InputHints.IgnoringInput);
                }
            }
    
        }

    async decisionStep(stepContext) {

        if(LuisRecognizer.topIntent(stepContext.context.luisResult) != 'Utilities_Confirm'){
            const message = 'O que você deseja fazer então?'
            await stepContext.context.sendActivity(message)
            return await stepContext.prompt(TEXT_PROMPT,MessageFactory.suggestedActions([
                '\n\nVer próxima bike', '\n\nExplorar outro filtro de pesquisa', '\n\nEncerrar']));
        }

        const bikeName = `${stepContext.values.finalBike.name} foi adicionada ao carrinho de compras`
        const message = 'O que você deseja fazer agora?'
            await stepContext.context.sendActivity(bikeName)
            await stepContext.context.sendActivity(message)
            return await stepContext.prompt(TEXT_PROMPT,MessageFactory.suggestedActions([
                '\n\nFinalizar pedido', '\n\nContinuar comprando.']));  
            }

    async finalStep(stepContext) {
        let message = 'EM DESENVOLVIMENTO'
        switch (LuisRecognizer.topIntent(stepContext.context.luisResult)) {
            case 'ProximaBike': {                
                return await stepContext.replaceDialog(this.initialDialogId, { bikeVector: stepContext.values.bikeVector , last: stepContext.values.last })                    
            }
            case 'FinalizarPedido': {                        
                await stepContext.context.sendActivity(message)
                break                    
            }
                      
            case 'Continuar': { 
                await stepContext.context.sendActivity(message)
                break              
            }
            default: {  
                await stepContext.context.sendActivity(message);
            }
                      
        
        }

    }

        
}

    


module.exports.ColorDialog = ColorDialog;