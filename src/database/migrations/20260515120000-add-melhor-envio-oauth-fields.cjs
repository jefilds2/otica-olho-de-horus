'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('store_settings', 'melhor_envio_client_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('store_settings', 'melhor_envio_client_secret', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('store_settings', 'melhor_envio_refresh_token', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('store_settings', 'melhor_envio_token_expires_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('store_settings', 'melhor_envio_oauth_state', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('store_settings', 'melhor_envio_oauth_state');
    await queryInterface.removeColumn('store_settings', 'melhor_envio_token_expires_at');
    await queryInterface.removeColumn('store_settings', 'melhor_envio_refresh_token');
    await queryInterface.removeColumn('store_settings', 'melhor_envio_client_secret');
    await queryInterface.removeColumn('store_settings', 'melhor_envio_client_id');
  },
};
