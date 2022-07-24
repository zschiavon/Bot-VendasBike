const { CardFactory, MessageFactory } = require('botbuilder');

const buildCardData = async (zipeVector, informações, stepContext) => {
    const info = `1- Nome: ${ zipeVector.cep } 
        \n\n 2- Cidade: ${ zipeVector.localidade } 
        \n\n 3- Bairro: ${ zipeVector.bairro }
        \n\n 4- Endereço: ${ zipeVector.logradouro }
        \n\n 5- Numero: ${ informações.numberHouse }
        \n\n 6- Complemento: ${ informações.complemento }
        \n\n 7- Nome: ${ informações.name }
        \n\n 8- CPF: ${ informações.cpf }
        \n\n 9- Telefone: ${ informações.telefone }`;

    await stepContext.context.sendActivity(info);
};

module.exports.buildCardData = buildCardData;
