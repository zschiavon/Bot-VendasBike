const { CardFactory, MessageFactory } = require('botbuilder');

const buildCard = async (bike, index, stepContext) => {
    let position;
    let noMoreBikes = '';
    if (index <= bike.length - 1) {
        position = index;
    } else {
        position = bike.length - 1;
        noMoreBikes = 'Não há mais bikes com esta configuração';
    }
    const card = CardFactory.heroCard(
        '',
        [`${ bike[position].image }`],
        ''
    );
    const information = `Nome: ${ bike[position].name } \n\n Marca: ${ bike[position].brand } \n\n Preço: R$ ${ bike[position].price.toString() }\n\n ${ noMoreBikes }`;
    const message = MessageFactory.attachment(card);
    await stepContext.context.sendActivity(message);
    await stepContext.context.sendActivity(information);
    return { lastpos: position };
};

module.exports.buildCard = buildCard;
