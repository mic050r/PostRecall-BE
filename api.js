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

// 오답 포스트잇 POST API 생성
app.post("/wrong", (req, res) => {
  const { token, importance, description } = req.body;

  // 데이터베이스 풀에서 연결 얻기
  pool
    .getConnection()
    .then((conn) => {
      // 데이터베이스에 데이터 삽입
      conn
        .query(
          "INSERT INTO Wrong (token, importance, description) VALUES (?, ?, ?)",
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

// 퀴즈 포스트잇 POST API 생성
app.post("/quiz", (req, res) => {
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
app.get("/concept-list", (req, res) => {
  const { token } = req.query;

  // 데이터베이스 풀에서 연결 얻기
  pool
    .getConnection()
    .then((conn) => {
      // 데이터베이스에서 데이터 조회
      conn
        .query("SELECT * FROM Concept WHERE token = ?", [token])
        .then((results) => {
          if (results.length === 0) {
            // 해당 토큰에 대한 데이터가 없을 경우
            res.status(404).json({ error: "데이터를 찾을 수 없습니다." });
          } else {
            // 조회된 데이터를 배열로 묶어서 JSON 응답으로 반환
            const data = results.map((result) => ({
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

// 퀴즈 리스트 GET API 생성
app.get("/quiz-list", (req, res) => {
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

// 퀴즈 리스트 GET API 생성
app.get("/wrong-list", (req, res) => {
  const { token } = req.query;

  // 데이터베이스 풀에서 연결 얻기
  pool
    .getConnection()
    .then((conn) => {
      // 데이터베이스에서 데이터 조회
      conn
        .query("SELECT * FROM Wrong WHERE token = ?", [token])
        .then((results) => {
          if (results.length === 0) {
            // 해당 토큰에 대한 데이터가 없을 경우
            res.status(404).json({ error: "데이터를 찾을 수 없습니다." });
          } else {
            // 조회된 데이터를 배열로 묶어서 JSON 응답으로 반환
            const data = results.map((result) => ({
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
app.get("/concept-importance", (req, res) => {
  const { token, importance } = req.query;

  // 데이터베이스 풀에서 연결 얻기
  pool
    .getConnection()
    .then((conn) => {
      // 데이터베이스에서 데이터 조회
      conn
        .query("SELECT * FROM Concept WHERE token = ? AND importance = ?", [
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
app.get("/wrong-importance", (req, res) => {
  const { token, importance } = req.query;

  // 데이터베이스 풀에서 연결 얻기
  pool
    .getConnection()
    .then((conn) => {
      // 데이터베이스에서 데이터 조회
      conn
        .query("SELECT * FROM Wrong WHERE token = ? AND importance = ?", [
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
app.get("/quiz-importance", (req, res) => {
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

app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});
