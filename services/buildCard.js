const { CardFactory } = require('botbuilder');
const buildCard = async (bike, index)=>{

const card = CardFactory.heroCard(
        ``,
        [`${bike[index].image}`],                 
   );
   const message = MessageFactory.attachment(card);
   return await context.sendActivity(message) 
}

module.exports.buildCard = buildCard