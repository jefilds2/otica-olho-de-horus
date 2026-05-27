'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('store_settings', 'default_package_weight', {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: true,
    });
    await queryInterface.addColumn('store_settings', 'default_package_width', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
    await queryInterface.addColumn('store_settings', 'default_package_height', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
    await queryInterface.addColumn('store_settings', 'default_package_length', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });

    await queryInterface.bulkUpdate('store_settings', {
      default_package_weight: 0.4,
      default_package_width: 16,
      default_package_height: 6,
      default_package_length: 18,
    }, { id: 1 });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('store_settings', 'default_package_length');
    await queryInterface.removeColumn('store_settings', 'default_package_height');
    await queryInterface.removeColumn('store_settings', 'default_package_width');
    await queryInterface.removeColumn('store_settings', 'default_package_weight');
  },
};
