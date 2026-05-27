'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('store_settings', 'melhor_envio_enabled', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('store_settings', 'melhor_envio_sandbox', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    await queryInterface.addColumn('store_settings', 'melhor_envio_token', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('store_settings', 'melhor_envio_app_name', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('store_settings', 'melhor_envio_technical_email', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('store_settings', 'melhor_envio_agency', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('orders', 'melhor_envio_order_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('orders', 'melhor_envio_protocol', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('orders', 'melhor_envio_status', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('orders', 'melhor_envio_payload_json', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('orders', 'melhor_envio_prepared_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('orders', 'melhor_envio_prepared_at');
    await queryInterface.removeColumn('orders', 'melhor_envio_payload_json');
    await queryInterface.removeColumn('orders', 'melhor_envio_status');
    await queryInterface.removeColumn('orders', 'melhor_envio_protocol');
    await queryInterface.removeColumn('orders', 'melhor_envio_order_id');

    await queryInterface.removeColumn('store_settings', 'melhor_envio_agency');
    await queryInterface.removeColumn('store_settings', 'melhor_envio_technical_email');
    await queryInterface.removeColumn('store_settings', 'melhor_envio_app_name');
    await queryInterface.removeColumn('store_settings', 'melhor_envio_token');
    await queryInterface.removeColumn('store_settings', 'melhor_envio_sandbox');
    await queryInterface.removeColumn('store_settings', 'melhor_envio_enabled');
  },
};
