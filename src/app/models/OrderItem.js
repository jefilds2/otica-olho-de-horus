import Sequelize, { Model } from 'sequelize';

class OrderItem extends Model {
    static init(sequelize) {
        super.init({
            order_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            product_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            product_name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            product_slug: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            product_image: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            selected_color_name: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            selected_color_hex: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            unit_price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            total_price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
        }, {
            sequelize,
            tableName: 'order_items',
            underscored: true,
        });
    }

    static associate(models) {
        this.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
        this.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
    }
}

export default OrderItem;
