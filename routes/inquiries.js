// routes/inquiries.js
const express = require("express");
const router = express.Router();
const pool = require("../db/conn"); // 데이터베이스 연결 모듈 가져오기

// Inquiry 목록 조회 API
router.get("/", (req, res) => {
  pool
    .getConnection()
    .then((conn) => {
      // 데이터베이스에 데이터 삽입
      conn
        .query("SELECT * FROM Inquiry")
        .then((result) => {
          conn.release(); // 연결 반환

          // 조회된 결과를 클라이언트에게 응답
          res.json(result);
        })
        .catch((err) => {
          conn.release(); // 연결 반환

          console.error("조회 중 오류 발생:", err);
          res.status(500).json({ error: "서버 오류" });
        });
    })
    .catch((err) => {
      console.error("데이터베이스 연결 오류:", err);
      res.status(500).json({ error: "서버 오류" });
    });
});

// 단일 Inquiry 조회 API
router.get("/:id", (req, res) => {
  const inquiryId = req.params.id;

  pool
    .getConnection()
    .then((conn) => {
      conn
        .query("SELECT * FROM Inquiry WHERE inquiry_id = ?", [inquiryId])
        .then((result) => {
          conn.release(); // 연결 반환

          // 조회된 결과를 클라이언트에게 응답
          if (result.length > 0) {
            res.json(result[0]);
          } else {
            res
              .status(404)
              .json({ error: "해당 ID의 Inquiry를 찾을 수 없습니다." });
          }
        })
        .catch((err) => {
          conn.release(); // 연결 반환

          console.error("조회 중 오류 발생:", err);
          res.status(500).json({ error: "서버 오류" });
        });
    })
    .catch((err) => {
      console.error("데이터베이스 연결 오류:", err);
      res.status(500).json({ error: "서버 오류" });
    });
});

// Inquiry 생성 API
router.post("/", (req, res) => {
  const { user_id, title, message, status } = req.body;

  pool
    .getConnection()
    .then((conn) => {
      // 데이터베이스에 데이터 삽입
      conn
        .query(
          "INSERT INTO Inquiry (user_id, title, message, status) VALUES (?, ?, ?, ?)",
          [user_id, title, message, status]
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

module.exports = router;
