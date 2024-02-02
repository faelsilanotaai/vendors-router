# Instruções:

#### Importante: deve possuir docker e docker-compose instalados

1. Subir os containers (MongoDB e Redis):
```bash
docker-compose up -d
```

2. Executar o arquivo 'db-populate.js':
```bash
node db-populate.js
```

3. Executar a API:
```bash
npm run start:dev
```

4. Fazer uma requisição POST:
```bash
curl --request POST \
  --url http://localhost:3000/ \
  --header 'Content-Type: application/json' \
```