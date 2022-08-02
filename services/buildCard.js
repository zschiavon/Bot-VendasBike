const { CardFactory, MessageFactory } = require('botbuilder');

const buildCard = async (bike, index, stepContext) => {
    let pos;
    let noMoreBikes = '';
    if (index <= bike.length - 1) {
        pos = index;
    } else {
        pos = bike.length - 1;
        noMoreBikes = 'Não há mais bikes com esta configuração';
    }
    const card = CardFactory.heroCard(
        '',
        [`${ bike[pos].image }`],
        ''
    );
    const info = `Nome: ${ bike[pos].name } \n\n Marca: ${ bike[pos].brand } \n\n Preço: R$ ${ bike[pos].price.toString() }\n\n ${ noMoreBikes }`;
    const message = MessageFactory.attachment(card);
    await stepContext.context.sendActivity(message);
    await stepContext.context.sendActivity(info);
    return { lastPos: pos };
};

module.exports.buildCard = buildCard;
