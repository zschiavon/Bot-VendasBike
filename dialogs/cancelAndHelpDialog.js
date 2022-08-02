const { InputHints } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');
const { ComponentDialog } = require('botbuilder-dialogs');

class CancelAndHelpDialog extends ComponentDialog {
    constructor(id, luisRecognizer) {
        super(id || 'cancelAndHelpDialog');
        this.luisRecognizer = luisRecognizer;
    }

    async onContinueDialog(innerDc) {
        const result = await this.interrupt(innerDc);
        if (result) return result;
        return await super.onContinueDialog(innerDc);
    }

    async interrupt(innerDc) {
        if (innerDc.context.activity.text) {
            switch (LuisRecognizer.topIntent(innerDc.context.luisResult)) {
            case 'ajuda':
            case 'Menu': return await innerDc.replaceDialog('MainDialog');
            }
        }
    }
}

module.exports.CancelAndHelpDialog = CancelAndHelpDialog;
