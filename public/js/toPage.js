function navigateToPage(pageNumber) {
  let destinationURL = "";

  if (pageNumber === 1) {
    destinationURL = "addpost-it(concept).html";
  } else if (pageNumber === 2) {
    destinationURL = "addpost-it(quiz).html";
  } else if (pageNumber === 3) {
    destinationURL = "addposit-it(wronganswer).html";
  } else if (pageNumber === 4) {
    destinationURL = "typing.html";
  } else if (pageNumber === 5) {
    destinationURL = "home.html";
  } else if (pageNumber === 6) {
    destinationURL = "category(concept).html";
  } else if (pageNumber === 7) {
    destinationURL = "category(quiz).html";
  } else if (pageNumber === 8) {
    destinationURL = "category(wronganswer).html";
  }
  // 지정된 URL로 페이지 이동
  window.location.href = destinationURL;
}
