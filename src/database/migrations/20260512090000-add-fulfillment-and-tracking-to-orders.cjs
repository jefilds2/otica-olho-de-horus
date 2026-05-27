'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'fulfillment_status', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('orders', 'tracking_code', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('orders', 'tracking_url', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('orders', 'shipped_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('orders', 'delivered_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('orders', 'delivered_at');
    await queryInterface.removeColumn('orders', 'shipped_at');
    await queryInterface.removeColumn('orders', 'tracking_url');
    await queryInterface.removeColumn('orders', 'tracking_code');
    await queryInterface.removeColumn('orders', 'fulfillment_status');
  },
};
