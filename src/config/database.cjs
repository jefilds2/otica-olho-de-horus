require('dotenv/config');

module.exports = {
    dialect: "mariadb", //tipo de banco de dados
    host: process.env.DB_HOST || "localhost", //endereço
    port: Number(process.env.DB_PORT || 3306), //porta
    username: process.env.DB_USER || "admin", //usuário do banco
    password: process.env.DB_PASSWORD || "admin123", //senha
    database: process.env.DB_NAME || "otica_db", //banco de dados
    define: {
        timestamps: true, //criar campos de data de criação e atualização
        underscored: true, //criar campos com underline "_" ao invés de camelCase. Ex: created_at.
        underscoredAll: true, //criar campos com underline
    },
};
