'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('store_settings', 'warranty_months', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('store_settings', 'return_days', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('store_settings', 'return_days');
    await queryInterface.removeColumn('store_settings', 'warranty_months');
  },
};
