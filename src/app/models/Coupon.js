import Sequelize, { Model } from 'sequelize';

class Coupon extends Model {
    static init(sequelize) {
        super.init({
            code: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            description: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            type: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            value: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            min_order_amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
            },
            usage_limit: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            usage_count: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            starts_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            expires_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
        }, {
            sequelize,
            tableName: 'coupons',
            underscored: true,
        });
    }
}

export default Coupon;
