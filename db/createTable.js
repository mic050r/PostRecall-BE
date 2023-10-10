const pool = require("./conn"); // 데이터베이스 연결 모듈 가져오기

pool
  .connect()
  .then(() => {
    console.log("MariaDB에 연결되었습니다.");

    // Concept 테이블 생성
    pool
      .query(
        `
      CREATE TABLE Concept (
        id INT AUTO_INCREMENT PRIMARY KEY,
        token VARCHAR(50),
        importance INT,
        description VARCHAR(300)
      )
    `
      )
      .then(() => {
        console.log("Concept 테이블이 성공적으로 생성되었습니다.");

        // Quiz 테이블 생성
        pool
          .query(
            `
          CREATE TABLE Quiz (
            id INT AUTO_INCREMENT PRIMARY KEY,
            token VARCHAR(50),
            importance INT,
            question VARCHAR(300),
            description VARCHAR(300)
          )
        `
          )
          .then(() => {
            console.log("Quiz 테이블이 성공적으로 생성되었습니다.");

            // Wrong 테이블 생성
            pool
              .query(
                `
              CREATE TABLE Wrong (
                id INT AUTO_INCREMENT PRIMARY KEY,
                token VARCHAR(50),
                importance INT,
                description VARCHAR(300)
              )
            `
              )
              .then(() => {
                console.log("Wrong 테이블이 성공적으로 생성되었습니다.");
              })
              .catch((err) => {
                console.error("Wrong 테이블 생성 오류:", err);
              })
              .finally(() => {
                pool
                  .end()
                  .then(() => {
                    console.log("MariaDB 연결이 종료되었습니다.");
                  })
                  .catch((err) => {
                    console.error("MariaDB 연결 종료 오류:", err);
                  });
              });
          })
          .catch((err) => {
            console.error("Quiz 테이블 생성 오류:", err);
            pool
              .end()
              .then(() => {
                console.log("MariaDB 연결이 종료되었습니다.");
              })
              .catch((err) => {
                console.error("MariaDB 연결 종료 오류:", err);
              });
          });
      })
      .catch((err) => {
        console.error("Concept 테이블 생성 오류:", err);
        pool
          .end()
          .then(() => {
            console.log("MariaDB 연결이 종료되었습니다.");
          })
          .catch((err) => {
            console.error("MariaDB 연결 종료 오류:", err);
          });
      });
  })
  .catch((err) => {
    console.error("MariaDB 연결 오류:", err);
  });
