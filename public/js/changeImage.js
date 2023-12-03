// 이미지 변경을 처리하는 JavaScript 코드
function changeImage(buttonId, defaultImage, hoverImage, pressedImage) {
  var buttonElement = document.getElementById(buttonId);
  var imageElement = buttonElement.querySelector("img");

  buttonElement.addEventListener("mouseover", function () {
    imageElement.src = hoverImage;
  });

  buttonElement.addEventListener("mouseout", function () {
    imageElement.src = defaultImage;
  });

  buttonElement.addEventListener("mousedown", function () {
    imageElement.src = pressedImage;
  });

  buttonElement.addEventListener("mouseup", function () {
    imageElement.src = hoverImage;
  });
}
