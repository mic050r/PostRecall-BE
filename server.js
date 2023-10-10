const express = require("express");
const app = express();
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
    secret: "ras", // 세션 암호화를 위한 비밀키
    resave: true, // 세션 변경 사항이 없어도 다시 저장할지 여부
    secure: false, // 개발 환경에서는 false로 설정 (HTTPS가 아닌 환경에서도 사용 가능)
    saveUninitialized: false, // 초기화되지 않은 세션을 저장할지 여부
  })
);

// 카카오 API 정보
const kakao = {
  clientID: "카카오 클라이언트 ID", // 카카오 클라이언트 ID
  clientSecret: "카카오 클라이언트 시크릿", // 카카오 클라이언트 시크릿
  redirectUri: "카카오 로그인 후 리다이렉션할 URL", // 카카오 로그인 후 리다이렉션할 URL
};

// 카카오 로그인 시작 라우트
app.get("/auth/kakao", (req, res) => {
  const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=${kakao.clientID}&redirect_uri=${kakao.redirectUri}&response_type=code&scope=profile,account_email`;
  res.redirect(kakaoAuthURL); // 카카오 로그인 페이지로 리다이렉션
});

// 카카오 로그인 콜백 라우트
app.get("/auth/kakao/callback", async (req, res) => {
  try {
    // 카카오로부터 받은 인증 코드로부터 액세스 토큰을 얻기 위한 요청
    const token = await axios({
      method: "POST",
      url: "https://kauth.kakao.com/oauth/token",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      data: qs.stringify({
        grant_type: "authorization_code",
        client_id: kakao.clientID,
        client_secret: kakao.clientSecret,
        redirectUri: kakao.redirectUri,
        code: req.query.code,
      }),
    });

    // 액세스 토큰을 사용하여 사용자 정보를 얻기 위한 요청
    const user = await axios({
      method: "get",
      url: "https://kapi.kakao.com/v2/user/me",
      headers: {
        Authorization: `Bearer ${token.data.access_token}`,
      },
    });

    // 사용자 정보를 세션에 저장
    req.session.kakao = user.data;
  } catch (e) {
    console.error("사용자 정보 가져오기 오류:", e);
    res.json(e.data);
  }

  res.send("success");
});

// 사용자 정보 페이지
app.get("/auth/info", (req, res) => {
  let { nickname, profile_image } = req.session.kakao.properties;
  res.render("info", {
    nickname,
    profile_image,
  });
});

// 홈 페이지
app.get("/", (req, res) => {
  res.render("index");
});

// 서버 리스닝
app.listen(3000, () => {
  console.log(`server start 3000`);
});
