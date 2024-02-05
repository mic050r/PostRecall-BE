// models/Quiz.js
const { DataTypes, Model } = require("sequelize");

class Quiz extends Model {
  static init(sequelize) {
    return super.init(
      {
        quiz_id: {
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
        question: {
          type: DataTypes.STRING(300),
        },
        description: {
          type: DataTypes.STRING(300),
        },
      },
      {
        sequelize,
        modelName: "Quiz",
        tableName: "quiz",
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

module.exports = Quiz;
