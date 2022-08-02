const { TextPrompt, WaterfallDialog, ChoicePrompt, ChoiceFactory } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');

const TEXT_PROMPT = 'textPrompt';
const CHOICE_PROMPT = 'choicePrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class FinishDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || 'finishDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.avaliationStep.bind(this),
                this.finalStep.bind(this),
                this.feedbackStep.bind(this)
            ]));
        this.initialDialogId = WATERFALL_DIALOG;
    }

    async avaliationStep(stepContext) {
        const firstMessage = 'Antes de encerrar, eu gostaria de saber se foi tudo bem na nossa conversa ou se em algum momento o meu pneu furou...';
        await stepContext.context.sendActivity(firstMessage);

        return await stepContext.prompt(CHOICE_PROMPT, {
            prompt: 'Como avalia meu atendimento?',
            choices: ChoiceFactory.toChoices([
                `Não gostei ${ String.fromCodePoint(0x1F621) }`,
                `Poderia melhorar ${ String.fromCodePoint(0x2639) }`,
                `Nem amei, nem odiei ${ String.fromCodePoint(0x1F610) }`,
                `Gostei ${ String.fromCodePoint(0x1F603) }`,
                `Amei Muito ${ String.fromCodePoint(0x2764) }`
            ])
        });
    }

    async finalStep(stepContext) {
        const avaliation = [stepContext.result.index];
        const result = avaliation.some(a => a < 3);

        if (result) {
            return await stepContext.prompt(TEXT_PROMPT, `Que pena! ${ String.fromCodePoint(0x1F61E) } 
            Lamento não ter atingido suas expectativas! Como meu atendimento poderia ser melhor?`);
        } else {
            const thankMessage = `Muito obrigado pela avaliação! ${ String.fromCodePoint(0x1F44D) }\n Adorei falar com você!`;
            const byeMessage = 'Qualquer dúvida para comprar sua bike, estou sempre por aqui';
            await stepContext.context.sendActivity(thankMessage);
            await stepContext.context.sendActivity(byeMessage);
            return await stepContext.cancelAllDialogs();
        }
    }

    async feedbackStep(stepContext) {
        const feedback = stepContext.result; // Enviar o feedback para algum lugar
        const byeMessage = 'Obrigado pelo feedback, isso vai ajudar a me tornar um assistente virtual melhor. Até a próxima!';
        await stepContext.context.sendActivity(byeMessage);
        return await stepContext.cancelAllDialogs();
    }
}
module.exports.FinishDialog = FinishDialog;
