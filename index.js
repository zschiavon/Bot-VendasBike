const { LuisRecognizer } = require('botbuilder-ai');

const path = require('path');

const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });

const restify = require('restify');

const {
    CloudAdapter,
    ConfigurationServiceClientCredentialFactory,
    ConversationState,
    createBotFrameworkAuthenticationFromConfiguration,
    InputHints,
    MemoryStorage,
    UserState
} = require('botbuilder');

const { DialogAndWelcomeBot } = require('./bots/dialogAndWelcomeBot');
const { MainDialog } = require('./dialogs/mainDialog');
const { TypeDialog } = require('./dialogs/typeDialog');
const { ColorDialog } = require('./dialogs/colorDialog');
const { GenderDialog } = require('./dialogs/genderDialog');
const { PriceDialog } = require('./dialogs/priceDialog');
const { FinishDialog } = require('./dialogs/finishDialog');
const { FallbackDialog } = require('./dialogs/fallbackDialog');
const { CancelAndHelpDialog } = require('./dialogs/cancelAndHelpDialog');
const { PurchaseData } = require('./dialogs/purchaseData');
const { GatherAdress } = require('./dialogs/gatherAdress')

const TYPE_DIALOG = 'typeDialog';
const COLOR_DIALOG = 'colorDialog';
const GENDER_DIALOG = 'genderDialog';
const PRICE_DIALOG = 'priceDialog';
const HELP_DIALOG = 'cancelAndHelpDialog';
const FINISH_DIALOG = 'finishDialog';
const PURCHASEDATA_DIALOG = 'purchaseData';
const FALLBACK_DIALOG = 'fallbackDialog';
const GATHERADRESS_DIALOG = 'gatherAdress'

const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
    MicrosoftAppId: process.env.MicrosoftAppId,
    MicrosoftAppPassword: process.env.MicrosoftAppPassword,
    MicrosoftAppType: process.env.MicrosoftAppType,
    MicrosoftAppTenantId: process.env.MicrosoftAppTenantId
});

const dispatchRecognizer = new LuisRecognizer({
    applicationId: process.env.LuisAppId,
    endpointKey: process.env.LuisAPIKey,
    endpoint: `https://${process.env.LuisAPIHostName}.cognitiveservices.azure.com/`
}, {
    includeAllIntents: true
}, true);

const botFrameworkAuthentication = createBotFrameworkAuthenticationFromConfiguration(null, credentialsFactory);

const adapter = new CloudAdapter(botFrameworkAuthentication);

const onTurnErrorHandler = async (context, error) => {
    console.error(`\n [onTurnError] unhandled error: ${error}`);
    await context.sendTraceActivity(
        'OnTurnError Trace',
        `${error}`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );

    let onTurnErrorMessage = 'O bot encontrou um erro ou bug.';
    await context.sendActivity(onTurnErrorMessage, onTurnErrorMessage, InputHints.ExpectingInput);
    onTurnErrorMessage = 'Para continuar a executar este bot, corrija o código-fonte do bot.';
    await context.sendActivity(onTurnErrorMessage, onTurnErrorMessage, InputHints.ExpectingInput);
    await conversationState.delete(context);
};

adapter.onTurnError = onTurnErrorHandler;

const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

const finishDialog = new FinishDialog(FINISH_DIALOG);
const fallbackDialog = new FallbackDialog(FALLBACK_DIALOG);
const typeDialog = new TypeDialog(TYPE_DIALOG);
const colorDialog = new ColorDialog(COLOR_DIALOG);
const priceDialog = new PriceDialog(PRICE_DIALOG);
const purchaseData = new PurchaseData(PURCHASEDATA_DIALOG);
<<<<<<< HEAD
const cancelAndHelpDialog = new CancelAndHelpDialog(HELP_DIALOG, dispatchRecognizer);
const genderDialog = new GenderDialog(GENDER_DIALOG);
const dialog = new MainDialog(dispatchRecognizer, typeDialog, colorDialog, genderDialog, priceDialog, purchaseData, fallbackDialog, cancelAndHelpDialog, finishDialog);
=======
const gatherAdress = new GatherAdress(GATHERADRESS_DIALOG)
const cancelAndHelpDialog = new CancelAndHelpDialog(HELP_DIALOG, dispatchRecognizer);
const genderDialog = new GenderDialog(GENDER_DIALOG);
const dialog = new MainDialog(typeDialog, colorDialog, genderDialog, priceDialog, purchaseData, fallbackDialog, cancelAndHelpDialog, finishDialog, gatherAdress);
>>>>>>> develop
const bot = new DialogAndWelcomeBot(conversationState, userState, dialog, dispatchRecognizer);

const server = restify.createServer();
server.use(restify.plugins.bodyParser());

server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log('\nObtenha o emulador do Bot Framework: https://aka.ms/botframework-emulator');
    console.log('\nPara falar com seu bot, abra o emulador selecione "Open Bot"');
});

server.post('/api/messages', async (req, res) => {
    await adapter.process(req, res, (context) => bot.run(context));
});

server.on('upgrade', async (req, socket, head) => {
    const streamingAdapter = new CloudAdapter(botFrameworkAuthentication);
    streamingAdapter.onTurnError = onTurnErrorHandler;
    await streamingAdapter.process(req, socket, head, (context) => bot.run(context));
});
