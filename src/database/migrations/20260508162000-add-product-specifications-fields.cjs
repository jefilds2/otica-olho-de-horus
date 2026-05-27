'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'available_colors', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('products', 'frame_material', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('products', 'size_label', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('products', 'lens_width_mm', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('products', 'bridge_mm', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('products', 'temple_length_mm', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('products', 'gender', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('products', 'gender');
    await queryInterface.removeColumn('products', 'temple_length_mm');
    await queryInterface.removeColumn('products', 'bridge_mm');
    await queryInterface.removeColumn('products', 'lens_width_mm');
    await queryInterface.removeColumn('products', 'size_label');
    await queryInterface.removeColumn('products', 'frame_material');
    await queryInterface.removeColumn('products', 'available_colors');
  },
};
