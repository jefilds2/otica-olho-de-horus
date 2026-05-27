'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const tableDefinition = await queryInterface.describeTable('products');

    if (tableDefinition.installments_interest_free) {
      await queryInterface.sequelize.query(
        'ALTER TABLE `products` DROP COLUMN `installments_interest_free`;'
      );
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDefinition = await queryInterface.describeTable('products');

    if (!tableDefinition.installments_interest_free) {
      await queryInterface.addColumn('products', 'installments_interest_free', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
    }
  },
};
