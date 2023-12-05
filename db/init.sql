-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS post;

-- 사용자 생성
CREATE USER IF NOT EXISTS 'root'@'localhost' IDENTIFIED BY '1234';
CREATE USER IF NOT EXISTS 'post'@'localhost' IDENTIFIED BY '1234';

-- 권한 부여
GRANT ALL PRIVILEGES ON post.* TO 'post'@'localhost' WITH GRANT OPTION;

-- 사용할 데이터베이스 선택
USE post;

-- Concept 테이블 생성
CREATE TABLE IF NOT EXISTS Concept (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(50),
    importance INT,
    description VARCHAR(300)
) DEFAULT CHARSET=utf8mb4;

-- Quiz 테이블 생성
CREATE TABLE IF NOT EXISTS Quiz (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(50),
    importance INT,
    question VARCHAR(300),
    description VARCHAR(300)
) DEFAULT CHARSET=utf8mb4;

-- Wrong 테이블 생성
CREATE TABLE IF NOT EXISTS Wrong (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(50),
    importance INT,
    description VARCHAR(300)
) DEFAULT CHARSET=utf8mb4;

-- Inquiry 테이블 생성
CREATE TABLE IF NOT EXISTS Inquiry (
    inquiry_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(100),
    title VARCHAR(255),
    message TEXT,
    status VARCHAR(50)
) DEFAULT CHARSET=utf8mb4;

alter table concept default charset = utf8;
ALTER TABLE concept CONVERT TO character SET utf8;

alter table quiz default charset = utf8;
ALTER TABLE quiz CONVERT TO character SET utf8;

alter table wrong default charset = utf8;
ALTER TABLE wrong CONVERT TO character SET utf8;

alter table Inquiry default charset = utf8;
ALTER TABLE Inquiry CONVERT TO character SET utf8;