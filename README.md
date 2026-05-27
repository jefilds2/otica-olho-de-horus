# Otica Olho de Horus

E-commerce da Otica Olho de Horus com:
- frontend em React + Vite
- backend em Node.js + Express
- MariaDB com Sequelize
- integracao com Mercado Pago
- integracao com Melhor Envio

## Scripts principais

- `npm run dev`: sobe a API em desenvolvimento
- `npm run dev:site`: sobe o frontend Vite
- `npm run build`: instala dependencias do frontend e gera o build de producao
- `npm start`: sobe a aplicacao em modo de producao

## Estrutura

- `src/`: backend, rotas, controllers, services e configuracoes
- `frontend/`: aplicacao React/Vite
- `uploads/`: arquivos enviados em tempo de execucao

## Ambiente

Use o arquivo `.env.example` como base para criar seu `.env`.

## Deploy

Em producao:
1. configurar o `.env`
2. executar `npm install`
3. executar `npm run build`
4. executar `npm start`

O backend serve o build gerado em `frontend/dist` quando ele existe.
