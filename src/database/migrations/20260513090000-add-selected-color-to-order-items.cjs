'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('order_items', 'selected_color_name', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('order_items', 'selected_color_hex', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('order_items', 'selected_color_hex');
    await queryInterface.removeColumn('order_items', 'selected_color_name');
  },
};
