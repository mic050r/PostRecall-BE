const { Sequelize, DataTypes } = require("sequelize");
const User = require("./User");
const Concept = require("./Concept");
const Quiz = require("./Quiz");
const Wrong = require("./Wrong");
const Inquiry = require("./Inquiry");

const sequelize = new Sequelize({
  dialect: "mariadb",
  host: "localhost",
  port: "3308",
  username: "root",
  password: "1234",
  database: "post",
});

const models = {
  User: User.init(sequelize, DataTypes),
  Concept: Concept.init(sequelize, DataTypes),
  Quiz: Quiz.init(sequelize, DataTypes),
  Wrong: Wrong.init(sequelize, DataTypes),
  Inquiry: Inquiry.init(sequelize, DataTypes),
};

// 모델 간의 관계 설정
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  ...models,
};
