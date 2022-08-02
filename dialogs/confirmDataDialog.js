const { TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { buildCardData } = require('../services/buildCardData');
const { LuisRecognizer } = require('botbuilder-ai');
const { cpfValidatorFN } = require('../services/cpfValidator');

const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class ConfirmData extends CancelAndHelpDialog {
    constructor(id) {
        super(id || 'confirmData');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.firstStep.bind(this),
                this.secondStep.bind(this),
                this.thirdStep.bind(this),
                this.fourthStep.bind(this),
                this.fifthStep.bind(this)
            ]));
        this.initialDialogId = WATERFALL_DIALOG;
    }

    async firstStep(stepContext) {
        const { dados } = stepContext.options;
        stepContext.values.dados = dados;

        const messageCase = 'Para finalizarmos a compra confirme seus dados';
        const messageCase1 = 'Dados informados:';
        const messageCase2 = 'Todos os dados estão corretos?';

        await stepContext.context.sendActivity(messageCase);
        await stepContext.context.sendActivity(messageCase1);
        await buildCardData(dados, stepContext);
        await stepContext.context.sendActivity(messageCase2);

        return await stepContext.prompt(TEXT_PROMPT, '');
    }

    async secondStep(stepContext) {
        switch (LuisRecognizer.topIntent(stepContext.context.luisResult)) {
        case 'Utilities_Confirm': {
            const finalMessage = `Parabéns! Você acabou de finalizar a sua compra. Este é o número do seu pedido: ${ Math.floor(Math.random() * 60000) }.`;
            await stepContext.context.sendActivity(finalMessage);
            return await stepContext.replaceDialog('finishDialog');
        }
        case 'Encerrar': {
            const message = 'Qual informação que deseja alterar?';
            await stepContext.context.sendActivity(message);
            return await stepContext.prompt(TEXT_PROMPT, '');
        }
        }
    }

    async thirdStep(stepContext) {
        const result = stepContext.result.toLowerCase();
        const found = result.match(/cpf|telefone|número|numero|complemento|endereço|cidade|bairro|nome|cep/g);

        if (found != null) {
            return await stepContext.next({ found: found });
        }

        const message = 'Não entendi qual dado deseja alterar. Para facilitar, você pode dizer o número da opção de 1 a 9.';
        await stepContext.context.sendActivity(message);
        return await stepContext.prompt(TEXT_PROMPT, '');
    }

    async fourthStep(stepContext) {
        if (stepContext.result.found) {
            const message = `Me informe novamente ${ stepContext.result.found[0].toUpperCase() }`;
            await stepContext.context.sendActivity(message);
            stepContext.values.choice = stepContext.result.found[0].toUpperCase();
            return await stepContext.prompt(TEXT_PROMPT, '');
        }

        if (stepContext.result <= 9) {
            const nomeDados = ['CEP', 'CIDADE', 'BAIRRO', 'ENDEREÇO', 'NÚMERO', 'COMPLEMENTO', 'NOME', 'CPF', 'TELEFONE'];
            const message = `Me informe novamente ${ nomeDados[+stepContext.result - 1] }`;
            await stepContext.context.sendActivity(message);
            stepContext.values.choice = stepContext.result;
            return await stepContext.prompt(TEXT_PROMPT, '');
        }

        const message = 'Sinto muito, estou com dificuldade de entender. Tente novamente daqui a pouco!';
        await stepContext.context.sendActivity(message);
        return await stepContext.cancelAllDialogs();
    }

    async fifthStep(stepContext) {
        let result = stepContext.result;
        const message = 'Ops o pneu furou... dado inválido';
        switch (stepContext.values.choice.toLowerCase()) {
        case 'cep':
        case '1':
            result = await result.replace(/[a-zA-Z]+/g, '').trim();
            result = await result.replace(/\W+/g, '').trim();

            if (result.length == 8) {
                stepContext.values.dados.cep = result;
                break;
            }
            await stepContext.context.sendActivity(message);
            break;
        case 'cidade':
        case '2':
            stepContext.values.dados.localidade = result;
            break;
        case 'bairro':
        case '3':
            stepContext.values.dados.bairro = result;
            break;
        case 'endereço':
        case '4':
            stepContext.values.dados.logradouro = result;
            break;
        case 'número':
        case 'numero':
        case '5':
            stepContext.values.dados.numeroCasa = result;
            break;
        case 'complemento':
        case '6':
            stepContext.values.dados.complemento = result;
            break;
        case 'nome':
        case '7':
            stepContext.values.dados.nome = result;
            break;
        case 'cpf':
        case '8': {
            result = await result.replace(/[a-zA-Z]+/g, '').trim();
            result = await result.replace(/\W+/g, '').trim();
            const validCpf = cpfValidatorFN(result);

            if (validCpf === true) {
                stepContext.values.dados.cpf = result;
                break;
            }
            await stepContext.context.sendActivity(message);
            break;
        }
        case 'telefone':
        case '9':
            result = await result.replace(/[a-zA-Z]+/g, '').trim();
            result = await result.replace(/\W+/g, '').trim();

            if (result.length >= 8 && result.length <= 11) {
                stepContext.values.dados.telefone = result;
                break;
            }
            await stepContext.context.sendActivity(message);
            break;
        }
        return await stepContext.replaceDialog(this.initialDialogId, { dados: stepContext.values.dados });
    }
}
module.exports.ConfirmData = ConfirmData;
