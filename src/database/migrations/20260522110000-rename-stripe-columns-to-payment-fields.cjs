'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const table = await queryInterface.describeTable('orders');

    if (table.stripe_session_id && !table.payment_reference) {
      await queryInterface.renameColumn('orders', 'stripe_session_id', 'payment_reference');
    }

    if (table.stripe_payment_intent_id && !table.payment_transaction_id) {
      await queryInterface.renameColumn('orders', 'stripe_payment_intent_id', 'payment_transaction_id');
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('orders');

    if (table.payment_reference && !table.stripe_session_id) {
      await queryInterface.renameColumn('orders', 'payment_reference', 'stripe_session_id');
    }

    if (table.payment_transaction_id && !table.stripe_payment_intent_id) {
      await queryInterface.renameColumn('orders', 'payment_transaction_id', 'stripe_payment_intent_id');
    }
  },
};
