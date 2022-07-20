const { ActivityHandler } = require('botbuilder');
class DialogBot extends ActivityHandler {

    constructor(conversationState, userState, dialog, luisRecognizer) {
        super();

        this.conversationDataAccessor = conversationState.createProperty(CONVERSATION_DATA_PROPERTY);
        this.userProfileAccessor = userState.createProperty(USER_PROFILE_PROPERTY);

        if (!conversationState) throw new Error('[DialogBot]: Parâmetro ausente. O estado de conversação é obrigatório');
        if (!userState) throw new Error('[DialogBot]: Parâmetro ausente. userState é obrigatório');
        if (!dialog) throw new Error('[DialogBot]: Parâmetro ausente. diálogo é necessário');

        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.dialogState = this.conversationState.createProperty('DialogState');

        this.onMessage(async (context, next) => {
            const userProfile = await this.userProfileAccessor.get(context, {});
            const conversationData = await this.conversationDataAccessor.get(
                context, { promptUser: false });

            if (!userProfile.name){

            }
        })
    }

}