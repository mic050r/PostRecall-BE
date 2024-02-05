// models/Inquiry.js
const { DataTypes, Model } = require("sequelize");

class Inquiry extends Model {
  static init(sequelize) {
    return super.init(
      {
        inquiry_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        title: {
          type: DataTypes.STRING(255),
        },
        message: {
          type: DataTypes.TEXT,
        },
        status: {
          type: DataTypes.STRING(50),
        },
      },
      {
        sequelize,
        modelName: "Inquiry",
        tableName: "inquiry",
        charset: "utf8",
        collate: "utf8_general_ci",
        timestamps: false, // timestamps 옵션을 false로 설정
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: "user_id" });
  }
}

module.exports = Inquiry;
