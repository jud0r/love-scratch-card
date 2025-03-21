"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

document.addEventListener('DOMContentLoaded', function () {
  var actions = ['Massagear', 'Lamber', 'Chupar', 'Mordiscar', 'Ele decide', 'Acariciar', 'Ela decide', 'Beijar'];
  var bodyParts = ['Bunda', 'Pescoço', 'Coxas', 'Virilha', 'Parte íntima', 'Boca', 'Pés', 'Peito'];

  function limitAndShuffleArray(array) {
    var limit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 8;

    // Shuffle array primeiro
    var shuffled = _toConsumableArray(array);

    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var _ref = [shuffled[j], shuffled[i]];
      shuffled[i] = _ref[0];
      shuffled[j] = _ref[1];
    } // Retorna exatamente o número de itens solicitado
    // Se o array for menor, repete itens para alcançar o número desejado


    var result = [];

    if (shuffled.length >= limit) {
      // Se temos itens suficientes, pegamos apenas os primeiros [limit]
      result = shuffled.slice(0, limit);
    } else {
      // Se não temos itens suficientes, repetimos itens para atingir [limit]
      while (result.length < limit) {
        var remainingNeeded = limit - result.length;
        result = result.concat(shuffled.slice(0, Math.min(remainingNeeded, shuffled.length)));
      }
    }

    return result;
  }

  function createCards(items, containerId) {
    var container = document.getElementById(containerId);
    container.innerHTML = ''; // Sempre usa exatamente 8 itens (4 por linha em 2 linhas)

    var shuffledItems = limitAndShuffleArray(items, 8);
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
    var ctx = canvas.getContext('2d', {
      willReadFrequently: true
    });
    var isDrawing = false;
    var lastX = 0;
    var lastY = 0;
    var scratchedPercentage = 0;
    var overlay = card.querySelector('.scratch-overlay');
    var content = card.querySelector('.card-content'); // Set canvas dimensions

    function resizeCanvas() {
      canvas.width = card.offsetWidth;
      canvas.height = card.offsetHeight;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    content.style.opacity = '0';
    content.style.transition = 'opacity 0.2s'; // Initial resize

    setTimeout(resizeCanvas, 100); // Handle events - usar passive: false para melhorar desempenho em toque

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('touchstart', startDrawingTouch, {
      passive: false
    });
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('touchmove', drawTouch, {
      passive: false
    });
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);

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
      ctx.globalCompositeOperation = 'destination-out'; // Aumentar largura da linha para facilitar a raspagem

      ctx.lineWidth = window.innerWidth <= 768 ? 30 : 20;
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
      ctx.globalCompositeOperation = 'destination-out'; // Aumentar largura da linha para facilitar a raspagem em dispositivos touch

      ctx.lineWidth = 30;
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
          // Considering pixels with alpha < 10 as scratched
          transparentPixels++;
        }
      }

      scratchedPercentage = transparentPixels / (canvas.width * canvas.height) * 100; // Mostrar o conteúdo gradualmente à medida que o usuário raspa

      content.style.opacity = (scratchedPercentage / 100).toFixed(2); // Ajustar a opacidade do overlay inversamente

      overlay.style.opacity = (1 - scratchedPercentage / 100).toFixed(2); // Revelar mais cedo em dispositivos móveis (40% em vez de 50%)

      var revealThreshold = window.innerWidth <= 768 ? 40 : 50;

      if (scratchedPercentage > revealThreshold) {
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

      var ctx = canvas.getContext('2d', {
        willReadFrequently: true
      });
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