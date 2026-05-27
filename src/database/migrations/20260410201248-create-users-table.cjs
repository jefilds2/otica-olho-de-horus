'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        primaryKey: true, //chave primaria
        allowNull: false, //não pode ser nulo
        type: Sequelize.INTEGER, //Define a valor como número inteiro
        autoIncrement: true, //auto incremento
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true, //valor único
      },
      password_hash: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      cpf: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true, //valor único
      },
      birth_date: {
        allowNull: true,
        type: Sequelize.DATEONLY,
      },
      phone: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      whatsapp: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      cep: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      street: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      number: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      complement: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      neighborhood: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      city: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      state: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      address_reference: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      google_id: {
        allowNull: true,
        type: Sequelize.STRING,
        unique: true,
      },
      avatar_path: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      admin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      email_verified_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      last_login_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  }
};
