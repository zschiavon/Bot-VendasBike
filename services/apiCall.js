const axios = require('axios');

async function searchApi(filtro, value, stepContext) {
    let filtrado;
    try {
        const response = await axios.get('https://pb-bikes-api.herokuapp.com/bike/list');
        switch (filtro.toLowerCase()) {
        case 'preco':
            if (stepContext.entities.Maxvalue && value.length === 1) {
                filtrado = await response.data.filter(bike => { return bike.price <= value[0]; });
            } else if (value.length > 1) {
                filtrado = await response.data.filter(bike => { return bike.price > value[0] && bike.price <= value[1]; });
            } else {
                filtrado = await response.data.filter(bike => { return bike.price > value[0]; });
            }
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
        }
        return await filtrado;
    } catch (e) {
        return filtrado;
    }
}

module.exports.searchApi = searchApi;
