"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

document.addEventListener('DOMContentLoaded', function () {
  var actions = ['Beijar', 'Acariciar', 'Massagear', 'Morder', 'Lamber', 'Chupar', 'Sussurrar em', 'Tocar'];
  var bodyParts = ['Bunda', 'Pescoço', 'Coxas', 'Virilha', 'Parte íntima', 'Boca', 'Pés', 'Peito'];

  function shuffleArray(array) {
    var newArray = _toConsumableArray(array);

    for (var i = newArray.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var _ref = [newArray[j], newArray[i]];
      newArray[i] = _ref[0];
      newArray[j] = _ref[1];
    }

    return newArray;
  }

  function createCards(items, containerId) {
    var container = document.getElementById(containerId);
    container.innerHTML = '';
    var shuffledItems = shuffleArray(items);
    shuffledItems.forEach(function (item) {
      var card = document.createElement('div');
      card.className = 'scratch-card';
      var content = document.createElement('div');
      content.className = 'card-content';
      content.textContent = item;
      var overlay = document.createElement('div');
      overlay.className = 'scratch-overlay';
      var overlayContent = document.createElement('div');
      overlayContent.style.textAlign = 'center';
      var icon = document.createElement('div');
      icon.className = 'scratch-icon';
      icon.innerHTML = '❤';
      var scratchText = document.createElement('div');
      scratchText.className = 'scratch-text';
      scratchText.textContent = 'Raspe!';
      overlayContent.appendChild(icon);
      overlayContent.appendChild(scratchText);
      overlay.appendChild(overlayContent); // Create canvas for scratch effect

      var canvas = document.createElement('canvas');
      canvas.className = 'scratch-canvas';
      card.appendChild(content);
      card.appendChild(overlay);
      card.appendChild(canvas);
      container.appendChild(card); // Initialize scratch effect

      initScratch(canvas, card);
    });
  }

  function initScratch(canvas, card) {
    var ctx = canvas.getContext('2d');
    var isDrawing = false;
    var lastX = 0;
    var lastY = 0;
    var scratchedPercentage = 0;
    var totalPixels = canvas.width * canvas.height;
    var overlay = card.querySelector('.scratch-overlay');
    var content = card.querySelector('.card-content'); // Set canvas dimensions

    function resizeCanvas() {
      canvas.width = card.offsetWidth;
      canvas.height = card.offsetHeight;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } // Modificação: Tornando o conteúdo visível desde o início


    content.style.opacity = '0';
    content.style.transition = 'opacity 0.2s'; // Initial resize

    setTimeout(resizeCanvas, 100); // Handle events

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('touchstart', startDrawingTouch);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('touchmove', drawTouch);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('touchend', stopDrawing);

    function startDrawing(e) {
      isDrawing = true;
      var _ref2 = [e.offsetX, e.offsetY];
      lastX = _ref2[0];
      lastY = _ref2[1];
    }

    function startDrawingTouch(e) {
      e.preventDefault();
      isDrawing = true;
      var rect = canvas.getBoundingClientRect();
      var touch = e.touches[0];
      lastX = touch.clientX - rect.left;
      lastY = touch.clientY - rect.top;
    }

    function draw(e) {
      if (!isDrawing) return;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 20;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
      var _ref3 = [e.offsetX, e.offsetY];
      lastX = _ref3[0];
      lastY = _ref3[1];
      checkScratchedPercentage();
    }

    function drawTouch(e) {
      if (!isDrawing) return;
      e.preventDefault();
      var rect = canvas.getBoundingClientRect();
      var touch = e.touches[0];
      var x = touch.clientX - rect.left;
      var y = touch.clientY - rect.top;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 20;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
      lastX = x;
      lastY = y;
      checkScratchedPercentage();
    }

    function stopDrawing() {
      isDrawing = false;
    }

    function checkScratchedPercentage() {
      var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      var pixels = imageData.data;
      var transparentPixels = 0; // Count transparent pixels (every 4th value is the alpha channel)

      for (var i = 3; i < pixels.length; i += 4) {
        if (pixels[i] < 10) {
          // Considering pixels with alpha <script 10 as scratched
          transparentPixels++;
        }
      }

      scratchedPercentage = transparentPixels / (canvas.width * canvas.height) * 100; // Mostrar o conteúdo gradualmente à medida que o usuário raspa

      content.style.opacity = (scratchedPercentage / 100).toFixed(2); // Ajustar a opacidade do overlay inversamente

      overlay.style.opacity = (1 - scratchedPercentage / 100).toFixed(2); // Se mais de 70% for raspado, revelar todo o cartão

      if (scratchedPercentage > 50) {
        canvas.style.display = 'none';
        overlay.style.display = 'none';
        content.style.opacity = '1';
      }
    }
  } // Add window resize event listener


  window.addEventListener('resize', function () {
    document.querySelectorAll('.scratch-canvas').forEach(function (canvas) {
      var card = canvas.parentElement;
      canvas.width = card.offsetWidth;
      canvas.height = card.offsetHeight; // Redraw the covering

      var ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
  }); // Initialize the game

  createCards(actions, 'actions-grid');
  createCards(bodyParts, 'body-parts-grid'); // Reset button functionality

  document.getElementById('reset-btn').addEventListener('click', function () {
    createCards(actions, 'actions-grid');
    createCards(bodyParts, 'body-parts-grid');
  });
});