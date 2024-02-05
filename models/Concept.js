// models/Concept.js
const { DataTypes, Model } = require("sequelize");

class Concept extends Model {
  static init(sequelize) {
    return super.init(
      {
        concept_id: {
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
        modelName: "Concept",
        tableName: "concept",
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

module.exports = Concept;
