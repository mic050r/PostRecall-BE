// models/User.js
const { DataTypes, Model } = require("sequelize");

class User extends Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        kakao_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
        nickname: {
          type: DataTypes.STRING(50),
        },
        image: {
          type: DataTypes.STRING(300),
        },
      },
      {
        sequelize,
        modelName: "Useur",
        tableName: "user",
        charset: "utf8", // 추가: 문자 인코딩 설정
        collate: "utf8_general_ci", // 추가: collate 설정
        timestamps: false, // timestamps 옵션을 false로 설정
      }
    );
  }

  static associate(models) {
    this.hasMany(models.Concept, { foreignKey: "user_id" });
    this.hasMany(models.Quiz, { foreignKey: "user_id" });
    this.hasMany(models.Wrong, { foreignKey: "user_id" });
    this.hasMany(models.Inquiry, { foreignKey: "user_id" });
  }
}

module.exports = User;
