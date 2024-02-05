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
const { User } = require("../models"); // 시퀄라이저 모델 가져오기
const sequelize = require("../config/database");
require("dotenv").config();

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("모델이 성공적으로 동기화되었습니다.");
  })
  .catch((error) => {
    console.error("모델 동기화 오류:", error);
  });

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

    try {
      // MariaDB에 사용자 정보 저장 (중복 체크 후 삽입)
      const [user, created] = await User.findOrCreate({
        where: { kakao_id: userResponse.data.id }, // 수정된 부분
        defaults: {
          nickname: userResponse.data.properties.nickname,
          image: userResponse.data.properties.profile_image,
        },
      });

      let loginuserId;

      if (created) {
        // 새로운 사용자가 생성되었으면
        loginuserId = user.id;
      } else {
        // 이미 존재하는 사용자일 경우
        loginuserId = user.id;
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
      // Sequelize에서는 명시적인 연결 해제가 필요하지 않습니다.
    }
  } catch (error) {
    console.error("Error:", error);
    res.json(error.data);
  }
});

// 토큰 값을 반환하는 API 엔드포인트
router.get("/token", (req, res) => {
  const jwtToken = req.cookies.jwtToken;

  if (jwtToken) {
    res.json({ token: jwtToken });
  } else {
    res.status(401).json({ error: "Token not found" });
  }
});

// 사용자 프로필, 닉네임 가져오는 API
router.get("/user/info", (req, res) => {
  const userInfo = {
    profileImage: req.session.profileImage,
    nickname: req.session.nickname,
  };

  res.json(userInfo);
});
// 로그아웃
router.get("/logout", (req, res) => {
  req.logout();
  res.clearCookie("jwtToken"); // 토큰 쿠키 삭제
  res.redirect("http://localhost:3000/");
});
module.exports = router;
