const axios = require('axios');

async function searchApi(filtro, value) {
    let filtrado;
    try {
        const response = await axios.get('https://pb-bikes-api.herokuapp.com/bike/list');
        switch (filtro.toLowerCase()) {
        case 'preco':
            filtrado = await response.data.filter(bike => { return bike.price <= value; });
            // console.log(value);
            break;
        case 'genero':
            filtrado = await response.data.filter(bike => { return bike.gender == value; });
            break;
        case 'tipo':
            filtrado = await response.data.filter(bike => { return bike.type == value; });
            break;
        case 'cor':
            filtrado = await response.data.filter(bike => { return bike.color == value; });
            break;
        default:
            break;
        }
        return await filtrado;
    } catch (error) {
        console.error(`Deu erro na sua chamada da API, conserte o problema. erro: ${ error }`);
    }
}

module.exports.searchApi = searchApi;
