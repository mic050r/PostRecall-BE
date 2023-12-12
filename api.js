// 모듈 선언
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const app = express();
const port = 3000;
const path = require("path");
const nunjucks = require("nunjucks");
const axios = require("axios");
const pool = require("./db/conn"); // 데이터베이스 연결 모듈 가져오기
const qs = require("qs");
const passport = require("passport");

const bodyParser = require("body-parser");
const inquiriesRouter = require("./routes/inquiries"); // 문의 사항
const conceptRouter = require("./routes/concept"); // 개념 포스트잇
const quizRouter = require("./routes/quiz"); // 퀴즈 포스트잇
const worngRouter = require("./routes/wrong"); // 퀴즈 포스트잇

// 기본 설정
app.use(cors());
app.use(express.json());

// 정적 파일 서빙 설정
app.use(express.static("public"));
app.use("/style", express.static(__dirname + "/style"));

app.use("/inquiries", inquiriesRouter); // 문의사항 라우터
app.use("/concept", conceptRouter); // 개념 포스트잇 라우터
app.use("/quiz", quizRouter); // 개념 포스트잇 라우터
app.use("/wrong", worngRouter); // 개념 포스트잇 라우터

app.use(
  express.static("public", {
    setHeaders: (res, path, stat) => {
      res.set("Content-Type", "text/css");
    },
  })
);

// Express 애플리케이션 설정
app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
});

app.use(
  require("express-session")({
    secret: "ras",
    resave: true,
    saveUninitialized: true,
  })
);

// Express 세션 설정
app.use(
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

// html 파일들 라우트 정의
app.get("/", (req, res) => {
  res.render("index");
});

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
// 카카오 API 정보
const kakao = {
  clientID: "2c536552403975785e3fdc6053dfb673",
  clientSecret: "BHcC3tbvBXLAMDPfOav74BDmhIZFTe1s",
  redirectUri: "http://localhost:3000/auth/kakao/callback",
  logout_url: "http://localhost:3000/kakao/logout",
};

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

    res.redirect("http://localhost:3000/home.html");
  } catch (error) {
    console.error("Error:", error);
    res.json(error.data);
  }
});

app.get("/token", (req, res) => {
  const tokenInfo = {
    token: req.session.nickname,
  };
  res.json(tokenInfo);
});

// 사용자 프로필, 닉네임 가져오는 API
app.get("/get-user-info", (req, res) => {
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

// 카카오 로그아웃 -> 카카오 로그아웃에 url 추가해야함
app.get("/kakao/logout", async (req, res) => {
  const kakaoAuthURL = `https://kauth.kakao.com/oauth/logout?client_id=${kakao.clientID}&logout_redirect_uri=${kakao.logout_url}`;
  res.redirect(kakaoAuthURL);
});

app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});
