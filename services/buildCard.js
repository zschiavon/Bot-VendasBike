const { CardFactory } = require('botbuilder');
const { MessageFactory } = require('botbuilder');

const buildCard = async (bike, index, stepContext) => {
        const card = CardFactory.heroCard(
                ``,
                [`${ bike[index].image }`],
                '',
        );
        const info = `Nome: ${ bike[index].name } \n\n Marca: ${ bike[index].brand } \n\n Preço:${ bike[index].price.toString() }`

        const message = MessageFactory.attachment(card);
        await stepContext.context.sendActivity(message);
        await stepContext.context.sendActivity(info);
};

module.exports.buildCard = buildCard;
