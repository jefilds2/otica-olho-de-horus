'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'installments_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 10,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('products', 'installments_count');
  },
};
