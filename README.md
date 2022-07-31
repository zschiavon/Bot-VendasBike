# Bot_vendas
Este Bot é um projeto desenvolvido para o programa de bolsas da **compass.uol**.</br>
Consiste em um bot de vendas de bicicletas onde o cliente navegara pelo bot tendo acesso a varias bicicletas e poderá adiciona-lás ao seu carrinho de compras e finalizar sua compra colocando dados de pagamento e seus dados para entrega.</br>
Foram usados neste projeto uma api contendo as bicicletas, api Viacep para consulta e validação dos ceps e Microsoft azure para criar o projeto e intenções do luis.ia.</br>
---
## Developers

| [<img src="https://avatars.githubusercontent.com/u/82416273?v=4" width=115><br><sub>Amira Ahmad</sub>]( https://www.linkedin.com/in/amiiahmad/) | [<img src="https://avatars.githubusercontent.com/u/61919257?v=4" width=115><br><sub>Isadora Brito</sub>](https://www.linkedin.com/in/isadoradpbrito/) | [<img src="https://avatars.githubusercontent.com/u/88756189?v=4" width=115><br><sub>Juan Schiavon</sub>](https://www.linkedin.com/in/juan-schiavon-10b914236) | [<img src="https://media-exp1.licdn.com/dms/image/C4E03AQEsSLS-7nvN7A/profile-displayphoto-shrink_200_200/0/1643222759304?e=1665014400&v=beta&t=hffVK1omsv5L9x3E-wulCUgkqJbEFcUVF6K_mWI62FE" width=115><br><sub>Ramon Rocha</sub>](https://www.linkedin.com/in/ramonrocha1989/) |
| :---: | :---: | :---: | :---: |
---

## Como rodar o projeto
- Clone o projeto
- Baixe o Bot Framework Emulator:**https://github.com/Microsoft/BotFramework-Emulator/releases/tag/v4.14.1** ;
- Crie um projeto no site **https://portal.azure.com/#home** e também no **https://www.luis.ai/applications**;
- Baixe o arquivo bot_vendas.lu em **https://bitbucket.org/030189rr/bot_vendas/downloads/** e import para o **https://www.luis.ai/applications**;
- No site do **https://www.luis.ai/applications** treine e publique o arquivo;
- No site do luis.ia pegue as variáveis de ambiente fornecida e cole nas variáveis abaixo e crie um arquivo .env no projeto colando as variáveis;</br>
   **LuisAppId=</br>**
   **LuisAPIKey=</br>**
   **LuisAPIHostName=</br>**
- Entre na pasta do projeto abra o terminal e rode o comando **npm i** para instalar as dependências e a pasta node_modules;
- Na pasta do projeto abra o terminal e rode o comando **npm start**;
- Abra o **Bot Framework Emulator** e coloque a seguinte rota: **http://localhost:3978/api/messages;**
- Mande uma mensagem inicial e teste o bot;
---

