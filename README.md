# Bot_vendas

<p align="center">
Este Bot é um projeto desenvolvido para o programa de bolsas da Compass Uol
</p>

Consiste em um bot para vendas de bicicletas onde o cliente terá acesso a várias bicicletas e poderá adiciona-las ao seu carrinho e finalizar sua compra colocando seus dados de pagamento e para entrega.</br>
Foram utilizados neste projeto a api [Loja de bicicletas](https://pb-bikes-api.herokuapp.com/api-docs/#/), a api [Viacep](https://viacep.com.br/) para consulta e validação dos ceps e [Microsoft Azure](https://portal.azure.com) para criar o projeto e intenções do [Luis](https://www.luis.ai).</br>
---

## Developers

| [<img src="https://media-exp1.licdn.com/dms/image/C4E03AQHs8xX81-20Ug/profile-displayphoto-shrink_200_200/0/1650072888118?e=1665014400&v=beta&t=K4L5Z1RvaUKTtIM-27nJ2F2-dc9H880-SXncSsLA5XY" width=115><br><sub>Amira Ahmad</sub>]( https://www.linkedin.com/in/amiiahmad/) | [<img src="https://media-exp1.licdn.com/dms/image/C4D03AQHTanvAqtt13g/profile-displayphoto-shrink_200_200/0/1659311903768?e=1665014400&v=beta&t=_8ugy9Ym-52Hj6c1UkgUw3HAJExXDUVDu_btBbytwRE" width=115><br><sub>Isadora Brito</sub>](https://www.linkedin.com/in/isadoradpbrito/) | [<img src="https://media-exp1.licdn.com/dms/image/C4E03AQHe2PorlRx_tw/profile-displayphoto-shrink_200_200/0/1653049427108?e=1665014400&v=beta&t=-CJ5AtfmtM9WP4Q52J0YDJSFaW4ISCB425vK0CsRgyE" width=115><br><sub>Juan Schiavon</sub>](https://www.linkedin.com/in/juan-schiavon-10b914236) | [<img src="https://media-exp1.licdn.com/dms/image/C4E03AQEsSLS-7nvN7A/profile-displayphoto-shrink_200_200/0/1643222759304?e=1665014400&v=beta&t=hffVK1omsv5L9x3E-wulCUgkqJbEFcUVF6K_mWI62FE" width=115><br><sub>Ramon Rocha</sub>](https://www.linkedin.com/in/ramonrocha1989/) | |
| :---: | :---: | :---: | :---: | :---: |

---

## Como rodar o projeto

- Clone o projeto

- Baixe o [Bot Framework Emulator](https://github.com/Microsoft/BotFramework-Emulator/releases/tag/v4.14.1)
  
- Crie um projeto na [Azure](https://portal.azure.com) e também no [LUIS](https://www.luis.ai)

- Baixe o arquivo [.lu](https://bitbucket.org/030189rr/bot_vendas/downloads/) e importe para o [LUIS](https://www.luis.ai)

- No [LUIS](https://www.luis.ai) treine e publique o arquivo

- No [LUIS](https://www.luis.ai) pegue as variáveis de ambiente fornecida e cole nas variáveis abaixo e crie um arquivo `.env` no projeto colando as variáveis</br>
  
     ```text   
       LuisAppId = 
       LuisAPIKey = 
       LuisAPIHostName =       
     ```

- Entre na pasta do projeto abra o terminal e rode o comando `npm i` para instalar as dependências e a pasta node_modules
     
- Na pasta do projeto abra o terminal e rode o comando `npm start`

- Abra o **Bot Framework Emulator** e coloque a seguinte rota `http://localhost:3978/api/messages`
- Mande uma mensagem inicial e teste o bot :robot:
---
