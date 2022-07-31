# Bot_vendas
Este Bot é um projeto desenvolvido para o programa de bolsas da **compass.uol**.</br>
Consiste em um bot de vendas de bicicletas onde o cliente navegara pelo bot tendo acesso a varias bicicletas e poderá adiciona-lás ao seu carrinho de compras e finalizar sua compra colocando dados de pagamento e seus dados para entrega.</br>
Foram usados neste projeto uma api contendo as bicicletas, api Viacep para consulta e validação dos ceps e Microsoft azure para criar o projeto e intenções do luis.ia.</br>
---
## Autores
Ramon Rocha: **https://www.linkedin.com/in/ramonrocha1989/** </br>
Isadora Brito:**https://www.linkedin.com/in/isadoradpbrito/** </br>
Juan Schiavon: **https://www.linkedin.com/in/juan-schiavon-10b914236** </br>
Amira Régio: **https://www.linkedin.com/in/amiiahmad/** </br>

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

