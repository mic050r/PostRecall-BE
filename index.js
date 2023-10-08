const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

const pool = require("./db/conn"); // 데이터베이스 연결 모듈 가져오기

app.use(cors());
app.use(express.json());

// 개념 포스트잇 POST API 생성
app.post("/concept", (req, res) => {
  const { token, importance, description } = req.body;

  // 데이터베이스 풀에서 연결 얻기
  pool
    .getConnection()
    .then((conn) => {
      // 데이터베이스에 데이터 삽입
      conn
        .query(
          "INSERT INTO Concept (token, importance, description) VALUES (?, ?, ?)",
          [token, importance, description]
        )
        .then((result) => {
          console.log("데이터가 성공적으로 삽입되었습니다.");
          res.json({ message: "데이터가 성공적으로 삽입되었습니다." });
          conn.release(); // 연결 반환
        })
        .catch((err) => {
          console.error("데이터 삽입 오류:", err);
          res.status(500).json({ error: "데이터 삽입 오류" });
          conn.release(); // 연결 반환
        });
    })
    .catch((err) => {
      console.error("데이터베이스 연결 오류:", err);
      res.status(500).json({ error: "데이터베이스 연결 오류" });
    });
});

app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});
