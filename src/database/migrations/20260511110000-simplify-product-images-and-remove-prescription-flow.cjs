'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const productTable = await queryInterface.describeTable('products');

    if (!productTable.image_paths) {
      await queryInterface.addColumn('products', 'image_paths', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const productTable = await queryInterface.describeTable('products');

    if (productTable.image_paths) {
      await queryInterface.removeColumn('products', 'image_paths');
    }
  },
};
