// db.js

const mariadb = require("mariadb");

// 데이터베이스 연결 풀 설정
const pool = mariadb.createPool({
  host: "localhost", // 데이터베이스 호스트
  port: 3308,
  user: "root", // 데이터베이스 사용자명
  password: "1234", // 데이터베이스 비밀번호
  database: "post", // 사용할 데이터베이스명
});

module.exports = pool;
