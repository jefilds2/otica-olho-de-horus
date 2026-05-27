'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'shipping_service_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('orders', 'shipping_service_name', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('orders', 'shipping_company_name', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('orders', 'shipping_price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('orders', 'shipping_delivery_time', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('orders', 'shipping_address_json', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('orders', 'shipping_quote_json', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('orders', 'shipping_quote_json');
    await queryInterface.removeColumn('orders', 'shipping_address_json');
    await queryInterface.removeColumn('orders', 'shipping_delivery_time');
    await queryInterface.removeColumn('orders', 'shipping_price');
    await queryInterface.removeColumn('orders', 'shipping_company_name');
    await queryInterface.removeColumn('orders', 'shipping_service_name');
    await queryInterface.removeColumn('orders', 'shipping_service_id');
  },
};
