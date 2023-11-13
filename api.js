const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;
const path = require("path");
const functions = require("firebase-functions");

const pool = require("./db/conn"); // 데이터베이스 연결 모듈 가져오기

app.use(cors());
app.use(express.json());

// // 정적 파일 서빙 설정
// app.use("./public", express.static("public"));

// 라우팅 설정 예시
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// const express = require("express");
const nunjucks = require("nunjucks");
const axios = require("axios");
const qs = require("qs");
const session = require("express-session");

// Express 애플리케이션 설정
app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
});

// Express 세션 설정
app.use(
  session({
    secret: "ras",
    resave: true,
    saveUninitialized: false,
  })
);

// 카카오 API 정보
const kakao = {
  clientID: "2c536552403975785e3fdc6053dfb673",
  clientSecret: "BHcC3tbvBXLAMDPfOav74BDmhIZFTe1s",
  redirectUri: "http://localhost:3000/auth/kakao/callback",
};

// 라우트 정의
app.get("/", (req, res) => {
  res.render("index");
});
// http://localhost:3000/auth/kakao
app.get("/auth/kakao", (req, res) => {
  const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=${kakao.clientID}&redirect_uri=${kakao.redirectUri}&response_type=code`;
  res.redirect(kakaoAuthURL);
});
app.get("/auth/kakao/callback", async (req, res) => {
  try {
    const tokenResponse = await axios({
      method: "POST",
      url: "https://kauth.kakao.com/oauth/token",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: qs.stringify({
        grant_type: "authorization_code",
        client_id: kakao.clientID,
        client_secret: kakao.clientSecret,
        redirectUri: kakao.redirectUri,
        code: req.query.code,
      }),
    });

    const { access_token } = tokenResponse.data;

    const userResponse = await axios({
      method: "get",
      url: "https://kapi.kakao.com/v2/user/me",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    // 사용자 정보를 세션에 저장
    req.session.kakao = userResponse.data;

    // 여기에서 세션에 토큰 및 사용자 정보 저장
    req.session.accessToken = access_token;
    req.session.nickname = userResponse.data.properties.nickname; // 닉네임
    req.session.profileImage = userResponse.data.properties.profile_image; // 프로필 이미지

    res.redirect("http://192.168.0.26:5500/home.html");
  } catch (error) {
    console.error("Error:", error);
    res.json(error.data);
  }
});

app.get("/token", (req, res) => {
  const token = req.session.accessToken;

  const tokenInfo = {
    token: token,
  };

  res.json(tokenInfo);
});

// API 엔드포인트: 사용자 정보 가져오기
app.get("/get-user-info", (req, res) => {
  // 사용자 정보를 세션에서 가져와서 응답으로 보냅니다.
  const userInfo = {
    profileImage: req.session.profileImage,
    nickname: req.session.nickname,
  };

  res.json(userInfo);
});

// Express 라우트에서 템플릿 렌더링
app.get("/auth/info", (req, res) => {
  const { nickname, profileImage } = req.session.kakao;
  res.render("info", {
    nickname,
    profileImage,
  });
});

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

// 개념 중요도 별로 내림차순, 오름차순
app.get("/concept-sort", (req, res) => {
  const { token, order } = req.query;

  // 데이터베이스 풀에서 연결 얻기
  pool
    .getConnection()
    .then((conn) => {
      // 데이터베이스에서 데이터 조회
      const sqlQuery = `SELECT * FROM Concept WHERE token = ? ORDER BY importance ${
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

// 오답 중요도 별로 내림차순, 오름차순
app.get("/wrong-sort", (req, res) => {
  const { token, order } = req.query;

  // 데이터베이스 풀에서 연결 얻기
  pool
    .getConnection()
    .then((conn) => {
      // 데이터베이스에서 데이터 조회
      const sqlQuery = `SELECT * FROM Wrong WHERE token = ? ORDER BY importance ${
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
app.get("/quiz-sort", (req, res) => {
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
app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});

exports.api = functions.https.onRequest(app);
