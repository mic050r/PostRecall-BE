// 모듈 선언
const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;
const nunjucks = require("nunjucks");

const bodyParser = require("body-parser");
const inquiriesRouter = require("./routes/inquiries"); // 문의 사항
const conceptRouter = require("./routes/concept"); // 개념 포스트잇
const quizRouter = require("./routes/quiz"); // 퀴즈 포스트잇
const worngRouter = require("./routes/wrong"); // 오답노트 포스트잇
const authRouter = require("./routes/auth"); // 사용자 정보

// 기본 설정
app.use(cors());
app.use(express.json());

// 정적 파일 서빙 설정
app.use(express.static("public"));
app.use("/style", express.static(__dirname + "/style"));

app.use(
  express.static("public", {
    setHeaders: (res, path, stat) => {
      res.set("Content-Type", "text/css");
    },
  })
);

app.use("/inquiries", inquiriesRouter); // 문의사항 라우터
app.use("/concept", conceptRouter); // 개념 포스트잇 라우터
app.use("/quiz", quizRouter); // 퀴즈 포스트잇 라우터
app.use("/wrong", worngRouter); // 오답 포스트잇 라우터
app.use("/auth", authRouter); // auth 라우터

// Express 애플리케이션 설정
app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
});

// html 파일들 라우트 정의
app.get("/", (req, res) => {
  res.render("index");
});

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});
