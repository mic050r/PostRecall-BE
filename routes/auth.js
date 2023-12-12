// 모듈 선언
const qs = require("qs");
const express = require("express");
const session = require("express-session");
const axios = require("axios");
const passport = require("passport");
const router = express.Router();

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

// 카카오 API 정보
const kakao = {
  clientID: "2c536552403975785e3fdc6053dfb673",
  clientSecret: "BHcC3tbvBXLAMDPfOav74BDmhIZFTe1s",
  redirectUri: "http://localhost:3000/auth/kakao/callback",
  logout_url: "http://localhost:3000/auth/kakao/logout",
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

    res.redirect("http://localhost:3000/home.html");
  } catch (error) {
    console.error("Error:", error);
    res.json(error.data);
  }
});

router.get("/token", (req, res) => {
  const tokenInfo = {
    token: req.session.nickname,
  };
  res.json(tokenInfo);
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
