require('dotenv/config');

function requireEnvironmentVariable(name) {
    const value = String(process.env[name] || '').trim();

    if (!value) {
        throw new Error(`${name} não configurado no ambiente.`);
    }

    return value;
}

module.exports = {
    dialect: "mariadb", //tipo de banco de dados
    host: process.env.DB_HOST || "localhost", //endereço
    port: Number(process.env.DB_PORT || 3306), //porta
    username: requireEnvironmentVariable('DB_USER'), //usuário do banco
    password: requireEnvironmentVariable('DB_PASSWORD'), //senha
    database: requireEnvironmentVariable('DB_NAME'), //banco de dados
    define: {
        timestamps: true, //criar campos de data de criação e atualização
        underscored: true, //criar campos com underline "_" ao invés de camelCase. Ex: created_at.
        underscoredAll: true, //criar campos com underline
    },
};
