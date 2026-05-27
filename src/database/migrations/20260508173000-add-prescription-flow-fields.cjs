'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'requires_prescription', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('orders', 'prescription_required', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('orders', 'prescription_submission_mode', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('orders', 'prescription_status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'nao_aplicavel',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('orders', 'prescription_status');
    await queryInterface.removeColumn('orders', 'prescription_submission_mode');
    await queryInterface.removeColumn('orders', 'prescription_required');
    await queryInterface.removeColumn('products', 'requires_prescription');
  },
};
