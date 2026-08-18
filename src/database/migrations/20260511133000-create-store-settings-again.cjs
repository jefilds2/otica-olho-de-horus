'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('store_settings', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      store_name: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Ótica Olho de Hórus',
      },
      cnpj: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      contact_email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      contact_phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      shipping_origin_postal_code: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      shipping_origin_address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      shipping_origin_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      shipping_origin_district: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      shipping_origin_city: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      shipping_origin_state: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      free_shipping_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      free_shipping_min_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
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

    await queryInterface.bulkInsert('store_settings', [{
      id: 1,
      store_name: 'Ótica Olho de Hórus',
      cnpj: null,
      contact_email: null,
      contact_phone: null,
      free_shipping_enabled: false,
      free_shipping_min_amount: null,
      created_at: new Date(),
      updated_at: new Date(),
    }]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('store_settings');
  },
};
