const buildCardData = async (dados, stepContext) => {
    const info = `1- Cep: ${ dados.cep ? dados.cep : 'Cep não encontrado' } 
        \n\n 2- Cidade: ${ dados.localidade } 
        \n\n 3- Bairro: ${ dados.bairro }
        \n\n 4- Endereço: ${ dados.logradouro }
        \n\n 5- Numero: ${ dados.numeroCasa }
        \n\n 6- Complemento: ${ dados.complemento }
        \n\n 7- Nome: ${ dados.nome }
        \n\n 8- CPF: ${ dados.cpf }
        \n\n 9- Telefone: ${ dados.telefone }`;

    await stepContext.context.sendActivity(info);
};

module.exports.buildCardData = buildCardData;
