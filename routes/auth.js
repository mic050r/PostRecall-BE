// 모듈 선언
const qs = require("qs");
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const axios = require("axios");
const passport = require("passport");
const router = express.Router();
const jwt = require("jsonwebtoken");
const pool = require("../db/conn"); // 데이터베이스 연결 모듈 가져오기
require("dotenv").config();

router.use(cors()); // CORS 미들웨어 추가
router.use(cookieParser());

router.use(
  require("express-session")({
    secret: "ras",
    resave: true,
    saveUninitialized: true,
  })
);

// Express 세션 설정
router.use(
  session({
    secret: "ras",
    resave: true,
    saveUninitialized: false,
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Serialize 및 Deserialize 설정
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// 환경 변수에서 시크릿 키를 가져옴
const secretKey = process.env.JWT_SECRET;

// 카카오 API 정보
const kakao = {
  clientID: process.env.KAKAO_CLIENT_ID,
  clientSecret: process.env.KAKAO_CLIENT_SECRET,
  redirectUri: process.env.KAKAO_REDIRECT_URI,
  logout_url: process.env.KAKAO_LOGOUT_URL,
};

// http://localhost:3000/auth/kakao
router.get("/kakao", (req, res) => {
  const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=${kakao.clientID}&redirect_uri=${kakao.redirectUri}&response_type=code`;
  res.redirect(kakaoAuthURL);
});

router.get("/kakao/callback", async (req, res) => {
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

    // MariaDB에 사용자 정보 저장 (중복 체크 후 삽입)
    const connection = await pool.getConnection();
    try {
      // 이미 존재하는 사용자인지 확인
      const existingUser = await connection.query(
        "SELECT * FROM user WHERE kakao_id = ?",
        [userResponse.data.id]
      );

      let loginuserId;

      if (existingUser.length === 0) {
        // 중복된 사용자가 없으면 삽입
        const result = await connection.query(
          "INSERT INTO user (kakao_id, nickname, image) VALUES (?, ?, ?)",
          [
            userResponse.data.id,
            userResponse.data.properties.nickname,
            userResponse.data.properties.profile_image,
          ]
        );
        // 최근에 추가된 레코드의 id를 가져오기
        loginuserId = result.insertId;
      } else {
        // 이미 존재하는 사용자일 경우 기존 사용자의 id를 가져오기
        loginuserId = existingUser[0].id;
      }

      // JWT 토큰 생성
      const jwtToken = jwt.sign(
        {
          userId: loginuserId,
          nickname: userResponse.data.properties.nickname,
        },
        secretKey,
        { expiresIn: "1h" } // 토큰 만료 시간
      );

      // 쿠키에 토큰 저장
      res.cookie("jwtToken", jwtToken, { httpOnly: true });

      res.redirect("http://localhost:3000/home.html");
    } finally {
      connection.release(); // 연결 반환
    }
  } catch (error) {
    console.error("Error:", error);
    res.json(error.data);
  }
});

// 토큰 값을 반환하는 API 엔드포인트
router.get("/getToken", (req, res) => {
  const jwtToken = req.cookies.jwtToken;

  if (jwtToken) {
    res.json({ token: jwtToken });
  } else {
    res.status(401).json({ error: "Token not found" });
  }
});

router.get("/token", (req, res) => {
  res.json({ token: jwtToken });
});

// 사용자 프로필, 닉네임 가져오는 API
router.get("/user/info", (req, res) => {
  const userInfo = {
    profileImage: req.session.profileImage,
    nickname: req.session.nickname,
  };

  res.json(userInfo);
});

// 카카오 로그아웃 -> 카카오 로그아웃에 url 추가해야함
router.get("/kakao/logout", async (req, res) => {
  // 세션 초기화
  req.session.destroy((err) => {
    if (err) {
      console.error("세션 초기화 오류:", err);
    }

    // 카카오 로그아웃 URL로 리다이렉트
    const kakaoAuthURL = `https://kauth.kakao.com/oauth/logout?client_id=${kakao.clientID}&logout_redirect_uri=${kakao.logout_url}`;
    res.redirect(kakaoAuthURL);
  });
});

module.exports = router;
