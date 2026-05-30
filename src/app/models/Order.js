import Sequelize, { Model } from 'sequelize';

class Order extends Model {
    static init(sequelize) {
        super.init({
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            payment_reference: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            payment_transaction_id: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            payment_details_json: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            customer_name: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            customer_email: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            customer_phone: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            shipping_service_id: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            shipping_service_name: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            shipping_company_name: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            shipping_price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },
            shipping_delivery_time: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            shipping_address_json: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            shipping_quote_json: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            status: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'aguardando_pagamento',
            },
            fulfillment_status: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            tracking_code: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            tracking_url: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            melhor_envio_order_id: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            melhor_envio_protocol: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            melhor_envio_status: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            melhor_envio_payload_json: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            melhor_envio_prepared_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            shipped_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            delivered_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            currency: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'brl',
            },
            subtotal_amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },
            coupon_code: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            coupon_description: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            discount_amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },
            total_amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },
            paid_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            inventory_deducted_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            last_notified_stage: {
                type: Sequelize.STRING,
                allowNull: true,
            },
        }, {
            sequelize,
            tableName: 'orders',
            underscored: true,
        });
    }

    static associate(models) {
        this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        this.hasMany(models.OrderItem, { foreignKey: 'order_id', as: 'items' });
    }
}

export default Order;
