const { FileTranscriptStore } = require("botbuilder");

const getEntities = (result, criteria) => {
        let value;
    try {
            switch (criteria.toLowerCase()) {
            case 'cor':
            value = result.entities.Cor[0];                 
            break;        
            case 'tipo':
            value = result.entities.Tipo[0];                 
            break;        
            case 'genero':
            value = result.entities.Genero[0];                 
            break;        
            case 'preco':
            value = result.entities.money.number;                 
            break; 
        }
        
       return { entidade: value };       
    } catch (error) {
        return { entidade: undefined}
        
    }        
}
       
   


module.exports.getEntities = getEntities