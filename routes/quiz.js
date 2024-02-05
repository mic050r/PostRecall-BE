const express = require("express");
const router = express.Router();
const pool = require("../db/conn"); // 데이터베이스 연결 모듈 가져오기
const { verifyToken } = require("../middleware/token"); // 토큰 검증 미들웨어 가져오기
const cookieParser = require("cookie-parser");
router.use(cookieParser());
// 퀴즈 포스트잇 POST API 생성
router.post("/", verifyToken, (req, res) => {
  const { user_id } = req.user;
  const { importance, question, description } = req.body;

  // 데이터베이스 풀에서 연결 얻기
  pool
    .getConnection()
    .then((conn) => {
      // 데이터베이스에 데이터 삽입
      conn
        .query(
          "INSERT INTO Quiz (user_id, importance, question, description) VALUES (?, ?, ?, ?)",
          [user_id, importance, question, description]
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

// 퀴즈 리스트 GET API 생성
router.get("/list", verifyToken, (req, res) => {
  const { user_id } = req.user;

  // 데이터베이스 풀에서 연결 얻기
  pool
    .getConnection()
    .then((conn) => {
      // 데이터베이스에서 데이터 조회
      conn
        .query("SELECT * FROM Quiz WHERE user_id = ?", [user_id])
        .then((results) => {
          if (results.length === 0) {
            // 해당 사용자에 대한 데이터가 없을 경우
            res.status(404).json({ error: "데이터를 찾을 수 없습니다." });
          } else {
            // 조회된 데이터를 배열로 묶어서 JSON 응답으로 반환
            const data = results.map((result) => ({
              question: result.question,
              description: result.description,
            }));
            res.json(data);
          }
          conn.release(); // 연결 반환
        })
        .catch((err) => {
          console.error("데이터 조회 오류:", err);
          res.status(500).json({ error: "데이터 조회 오류" });
          conn.release(); // 연결 반환
        });
    })
    .catch((err) => {
      console.error("데이터베이스 연결 오류:", err);
      res.status(500).json({ error: "데이터베이스 연결 오류" });
    });
});

// 퀴즈 포스트잇 중요도 태그 별 GET API
router.get("/importance", verifyToken, (req, res) => {
  const { user_id } = req.user;
  const { importance } = req.query;

  // 데이터베이스 풀에서 연결 얻기
  pool
    .getConnection()
    .then((conn) => {
      // 데이터베이스에서 데이터 조회
      conn
        .query("SELECT * FROM Quiz WHERE user_id = ? AND importance = ?", [
          user_id,
          importance,
        ])
        .then((results) => {
          if (results.length === 0) {
            // 해당 조건에 맞는 데이터가 없을 경우
            res.status(404).json({ error: "데이터를 찾을 수 없습니다." });
          } else {
            // 조회된 데이터를 배열로 묶어서 JSON 응답으로 반환
            const data = results.map((result) => ({
              question: result.question,
              description: result.description,
            }));
            res.json(data);
          }
          conn.release(); // 연결 반환
        })
        .catch((err) => {
          console.error("데이터 조회 오류:", err);
          res.status(500).json({ error: "데이터 조회 오류" });
          conn.release(); // 연결 반환
        });
    })
    .catch((err) => {
      console.error("데이터베이스 연결 오류:", err);
      res.status(500).json({ error: "데이터베이스 연결 오류" });
    });
});

// 퀴즈 중요도 별로 내림차순, 오름차순
router.get("/sort", verifyToken, (req, res) => {
  const { user_id } = req.user;
  const { order } = req.query;

  // 데이터베이스 풀에서 연결 얻기
  pool
    .getConnection()
    .then((conn) => {
      // 데이터베이스에서 데이터 조회
      const sqlQuery = `SELECT * FROM Quiz WHERE user_id = ? ORDER BY importance ${
        order === "asc" ? "ASC" : "DESC"
      }`;
      conn
        .query(sqlQuery, [user_id])
        .then((results) => {
          if (results.length === 0) {
            // 해당 조건에 맞는 데이터가 없을 경우
            res.status(404).json({ error: "데이터를 찾을 수 없습니다." });
          } else {
            // 조회된 데이터를 배열로 묶어서 JSON 응답으로 반환
            const data = results.map((result) => ({
              question: result.question,
              description: result.description,
            }));
            res.json(data);
          }
          conn.release(); // 연결 반환
        })
        .catch((err) => {
          console.error("데이터 조회 오류:", err);
          res.status(500).json({ error: "데이터 조회 오류" });
          conn.release(); // 연결 반환
        });
    })
    .catch((err) => {
      console.error("데이터베이스 연결 오류:", err);
      res.status(500).json({ error: "데이터베이스 연결 오류" });
    });
});

module.exports = router;
