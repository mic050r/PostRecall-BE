const express = require("express");
const router = express.Router();
const pool = require("../db/conn"); // 데이터베이스 연결 모듈 가져오기

// 퀴즈 포스트잇 POST API 생성
router.post("/", (req, res) => {
  const { token, importance, question, description } = req.body;

  // 데이터베이스 풀에서 연결 얻기
  pool
    .getConnection()
    .then((conn) => {
      // 데이터베이스에 데이터 삽입
      conn
        .query(
          "INSERT INTO Quiz (token, importance, question, description) VALUES (?, ?, ?, ?)",
          [token, importance, question, description]
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
router.get("/list", (req, res) => {
  const { token } = req.query;

  // 데이터베이스 풀에서 연결 얻기
  pool
    .getConnection()
    .then((conn) => {
      // 데이터베이스에서 데이터 조회
      conn
        .query("SELECT * FROM Quiz WHERE token = ?", [token])
        .then((results) => {
          if (results.length === 0) {
            // 해당 토큰에 대한 데이터가 없을 경우
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

// 퀴즈 포스트잇 조회 API
router.get("/:id", (req, res) => {
  const id = req.params.id;

  // 데이터베이스 풀에서 연결 얻기
  pool
    .getConnection()
    .then((conn) => {
      // 데이터베이스에서 데이터 조회
      conn
        .query("SELECT * FROM Quiz WHERE id = ?", [id])
        .then((results) => {
          if (results.length === 0) {
            // 해당 ID에 대한 데이터가 없을 경우
            res.status(404).json({ error: "데이터를 찾을 수 없습니다." });
          } else {
            // 조회된 데이터를 JSON 응답으로 반환
            const data = {
              id: results[0].id,
              token: results[0].token,
              question: results[0].question,
              importance: results[0].importance,
              description: results[0].description,
            };
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

// 퀴즈 포스트잇 질문, 설명, 중요도 수정
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { importance, question, description } = req.body;
    const conn = await pool.getConnection();
    const result = await conn.query(
      "UPDATE Quiz SET importance = ? , question = ? , description =? WHERE id = ?",
      [importance, question, description, id]
    );
    conn.release();

    if (result.affectedRows === 0) {
      res.status(404).json({ error: "데이터를 찾을 수 없습니다." });
    } else {
      res.json({ message: "데이터가 성공적으로 업데이트되었습니다." });
    }
  } catch (err) {
    console.error("데이터 업데이트 오류:", err);
    res.status(500).json({ error: "데이터 업데이트 오류" });
  }
});

// 퀴즈 포스트잇 삭제
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();
    const result = await conn.query("DELETE FROM Quiz WHERE id = ?", [id]);
    conn.release();

    if (result.affectedRows === 0) {
      res.status(404).json({ error: "데이터를 찾을 수 없습니다." });
    } else {
      res.json({ message: "데이터가 성공적으로 삭제되었습니다." });
    }
  } catch (err) {
    console.error("데이터 삭제 오류:", err);
    res.status(500).json({ error: "데이터 삭제 오류" });
  }
});

// 퀴즈 포스트잇 중요도 태그 별 GET API
router.get("/importance", (req, res) => {
  const { token, importance } = req.query;

  // 데이터베이스 풀에서 연결 얻기
  pool
    .getConnection()
    .then((conn) => {
      // 데이터베이스에서 데이터 조회
      conn
        .query("SELECT * FROM Quiz WHERE token = ? AND importance = ?", [
          token,
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
router.get("/sort", (req, res) => {
  const { token, order } = req.query;

  // 데이터베이스 풀에서 연결 얻기
  pool
    .getConnection()
    .then((conn) => {
      // 데이터베이스에서 데이터 조회
      const sqlQuery = `SELECT * FROM Quiz WHERE token = ? ORDER BY importance ${
        order === "asc" ? "ASC" : "DESC"
      }`;
      conn
        .query(sqlQuery, [token])
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
