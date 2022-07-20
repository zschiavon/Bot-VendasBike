const { InputHints } = require('botbuilder');
const { ComponentDialog } = require('botbuilder-dialogs');
class CancelAndHelpDialog extends ComponentDialog {
    async onContinueDialog(innerDc) {
        const result = await this.interrupt(innerDc);
        if (result) {
            return result;
        }
        return await super.onContinueDialog(innerDc);
    }

    async interrupt(innerDc) {
        if (innerDc.context.activity.text) {
            const text = innerDc.context.activity.text.toLowerCase();
            switch (text) {
            // case 'ajuda': {}
            // case 'Explorar outro filtro de pesquisa':
            case 'menu': {
                return await innerDc.beginDialog('MainDialog');
            }
            // case 'sair': {}
            case 'cancelar': {
                const cancelMessageText = 'Cancelando....';
                await innerDc.context.sendActivity(cancelMessageText, cancelMessageText, InputHints.IgnoringInput);
                return await innerDc.cancelAllDialogs();
            }
            }
        }
    }
}

module.exports.CancelAndHelpDialog = CancelAndHelpDialog;
