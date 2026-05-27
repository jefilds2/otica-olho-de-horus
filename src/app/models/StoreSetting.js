import Sequelize, { Model } from 'sequelize';

class StoreSetting extends Model {
    static init(sequelize) {
        super.init({
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
            },
            store_name: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'Ótica Olho de Hórus',
            },
            cnpj: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            contact_email: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            contact_phone: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            shipping_origin_postal_code: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            shipping_origin_address: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            shipping_origin_number: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            shipping_origin_district: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            shipping_origin_city: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            shipping_origin_state: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            default_package_weight: {
                type: Sequelize.DECIMAL(10, 3),
                allowNull: true,
            },
            default_package_width: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
            },
            default_package_height: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
            },
            default_package_length: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
            },
            free_shipping_enabled: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            free_shipping_min_amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
            },
            warranty_months: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            return_days: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            melhor_envio_enabled: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            melhor_envio_sandbox: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            melhor_envio_token: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            melhor_envio_app_name: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            melhor_envio_technical_email: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            melhor_envio_agency: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            melhor_envio_client_id: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            melhor_envio_client_secret: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            melhor_envio_refresh_token: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            melhor_envio_token_expires_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            melhor_envio_oauth_state: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            melhor_envio_public_url: {
                type: Sequelize.STRING,
                allowNull: true,
            },
        }, {
            sequelize,
            tableName: 'store_settings',
            underscored: true,
        });
    }
}

export default StoreSetting;
