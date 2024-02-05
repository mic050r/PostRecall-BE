// models/Wrong.js
const { DataTypes, Model } = require("sequelize");

class Wrong extends Model {
  static init(sequelize) {
    return super.init(
      {
        wrong_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        importance: {
          type: DataTypes.INTEGER,
        },
        description: {
          type: DataTypes.STRING(300),
        },
      },
      {
        sequelize,
        modelName: "Wrong",
        tableName: "wrong",
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

module.exports = Wrong;
