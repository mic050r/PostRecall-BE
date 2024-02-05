const express = require("express");
const router = express.Router();
const pool = require("../db/conn");
const { verifyToken } = require("../middleware/token");
const cookieParser = require("cookie-parser");
router.use(cookieParser());

// 오답 포스트잇 POST API 생성
router.post("/", verifyToken, async (req, res) => {
  try {
    const { importance, description } = req.body;
    const user_id = req.user.user_id; // 사용자 ID 가져오기

    // 데이터베이스 풀에서 연결 얻기
    const conn = await pool.getConnection();

    // 데이터베이스에 데이터 삽입
    const result = await conn.query(
      "INSERT INTO Wrong (user_id, importance, description) VALUES (?, ?, ?)",
      [user_id, importance, description]
    );

    // 응답
    res.json({ message: "데이터가 성공적으로 삽입되었습니다." });

    conn.release(); // 연결 반환
  } catch (error) {
    console.error("데이터 삽입 오류:", error);
    res.status(500).json({ error: "데이터 삽입 오류" });
  }
});

// 오답 리스트 GET API 생성
router.get("/list", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.user_id; // 사용자 ID 가져오기

    // 데이터베이스 풀에서 연결 얻기
    const conn = await pool.getConnection();

    // 데이터베이스에서 데이터 조회
    const results = await conn.query("SELECT * FROM Wrong WHERE user_id = ?", [
      user_id,
    ]);

    if (results.length === 0) {
      // 해당 user_id에 대한 데이터가 없을 경우
      res.status(404).json({ error: "데이터를 찾을 수 없습니다." });
    } else {
      // 조회된 데이터를 배열로 묶어서 JSON 응답으로 반환
      const data = results.map((result) => ({
        description: result.description,
      }));
      res.json(data);
    }

    conn.release(); // 연결 반환
  } catch (error) {
    console.error("데이터 조회 오류:", error);
    res.status(500).json({ error: "데이터 조회 오류" });
  }
});

// 오답 포스트잇 중요도 태그 별 GET API
router.get("/importance", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.user_id; // 사용자 ID 가져오기
    const { importance } = req.query;

    // 데이터베이스 풀에서 연결 얻기
    const conn = await pool.getConnection();

    // 데이터베이스에서 데이터 조회
    const results = await conn.query(
      "SELECT * FROM Wrong WHERE user_id = ? AND importance = ?",
      [user_id, importance]
    );

    if (results.length === 0) {
      // 해당 조건에 맞는 데이터가 없을 경우
      res.status(404).json({ error: "데이터를 찾을 수 없습니다." });
    } else {
      // 조회된 데이터를 배열로 묶어서 JSON 응답으로 반환
      const data = results.map((result) => ({
        description: result.description,
      }));
      res.json(data);
    }

    conn.release(); // 연결 반환
  } catch (error) {
    console.error("데이터 조회 오류:", error);
    res.status(500).json({ error: "데이터 조회 오류" });
  }
});

// 오답 중요도 별로 내림차순, 오름차순
router.get("/sort", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.user_id; // 사용자 ID 가져오기
    const { order } = req.query;

    // 데이터베이스 풀에서 연결 얻기
    const conn = await pool.getConnection();

    // 데이터베이스에서 데이터 조회
    const sqlQuery = `SELECT * FROM Wrong WHERE user_id = ? ORDER BY importance ${
      order === "asc" ? "ASC" : "DESC"
    }`;
    const results = await conn.query(sqlQuery, [user_id]);

    if (results.length === 0) {
      // 해당 조건에 맞는 데이터가 없을 경우
      res.status(404).json({ error: "데이터를 찾을 수 없습니다." });
    } else {
      // 조회된 데이터를 배열로 묶어서 JSON 응답으로 반환
      const data = results.map((result) => ({
        description: result.description,
      }));
      res.json(data);
    }

    conn.release(); // 연결 반환
  } catch (error) {
    console.error("데이터 조회 오류:", error);
    res.status(500).json({ error: "데이터 조회 오류" });
  }
});

module.exports = router;
