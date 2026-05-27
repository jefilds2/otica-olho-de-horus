'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'weight', {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: false,
      defaultValue: 0.4,
    });

    await queryInterface.addColumn('products', 'width', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 16,
    });

    await queryInterface.addColumn('products', 'height', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 6,
    });

    await queryInterface.addColumn('products', 'length', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 18,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('products', 'length');
    await queryInterface.removeColumn('products', 'height');
    await queryInterface.removeColumn('products', 'width');
    await queryInterface.removeColumn('products', 'weight');
  },
};
