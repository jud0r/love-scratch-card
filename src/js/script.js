document.addEventListener('DOMContentLoaded', function () {
  const actions = [
    'Beijar',
    'Acariciar',
    'Massagear',
    'Morder',
    'Lamber',
    'Chupar',
    'Sussurrar em',
    'Tocar',
  ]

  const bodyParts = [
    'Bunda',
    'Pescoço',
    'Coxas',
    'Virilha',
    'Parte íntima',
    'Boca',
    'Pés',
    'Peito',
  ]

  function shuffleArray(array) {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  function createCards(items, containerId) {
    const container = document.getElementById(containerId)
    container.innerHTML = ''

    const shuffledItems = shuffleArray(items)

    shuffledItems.forEach((item) => {
      const card = document.createElement('div')
      card.className = 'scratch-card'

      const content = document.createElement('div')
      content.className = 'card-content'
      content.textContent = item

      const overlay = document.createElement('div')
      overlay.className = 'scratch-overlay'

      const overlayContent = document.createElement('div')
      overlayContent.style.textAlign = 'center'

      const icon = document.createElement('div')
      icon.className = 'scratch-icon'
      icon.innerHTML = '❤'

      const scratchText = document.createElement('div')
      scratchText.className = 'scratch-text'
      scratchText.textContent = 'Raspe!'

      overlayContent.appendChild(icon)
      overlayContent.appendChild(scratchText)
      overlay.appendChild(overlayContent)

      // Create canvas for scratch effect
      const canvas = document.createElement('canvas')
      canvas.className = 'scratch-canvas'

      card.appendChild(content)
      card.appendChild(overlay)
      card.appendChild(canvas)

      container.appendChild(card)

      // Initialize scratch effect
      initScratch(canvas, card)
    })
  }

  function initScratch(canvas, card) {
    const ctx = canvas.getContext('2d')
    let isDrawing = false
    let lastX = 0
    let lastY = 0
    let scratchedPercentage = 0
    const totalPixels = canvas.width * canvas.height
    const overlay = card.querySelector('.scratch-overlay')
    const content = card.querySelector('.card-content')

    // Set canvas dimensions
    function resizeCanvas() {
      canvas.width = card.offsetWidth
      canvas.height = card.offsetHeight
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    // Modificação: Tornando o conteúdo visível desde o início
    content.style.opacity = '0'
    content.style.transition = 'opacity 0.2s'

    // Initial resize
    setTimeout(resizeCanvas, 100)

    // Handle events
    canvas.addEventListener('mousedown', startDrawing)
    canvas.addEventListener('touchstart', startDrawingTouch)
    canvas.addEventListener('mousemove', draw)
    canvas.addEventListener('touchmove', drawTouch)
    canvas.addEventListener('mouseup', stopDrawing)
    canvas.addEventListener('touchend', stopDrawing)

    function startDrawing(e) {
      isDrawing = true
      ;[lastX, lastY] = [e.offsetX, e.offsetY]
    }

    function startDrawingTouch(e) {
      e.preventDefault()
      isDrawing = true
      const rect = canvas.getBoundingClientRect()
      const touch = e.touches[0]
      ;[lastX, lastY] = [touch.clientX - rect.left, touch.clientY - rect.top]
    }

    function draw(e) {
      if (!isDrawing) return
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineWidth = 20
      ctx.lineCap = 'round'

      ctx.beginPath()
      ctx.moveTo(lastX, lastY)
      ctx.lineTo(e.offsetX, e.offsetY)
      ctx.stroke()
      ;[lastX, lastY] = [e.offsetX, e.offsetY]

      checkScratchedPercentage()
    }

    function drawTouch(e) {
      if (!isDrawing) return
      e.preventDefault()

      const rect = canvas.getBoundingClientRect()
      const touch = e.touches[0]
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top

      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineWidth = 20
      ctx.lineCap = 'round'

      ctx.beginPath()
      ctx.moveTo(lastX, lastY)
      ctx.lineTo(x, y)
      ctx.stroke()
      ;[lastX, lastY] = [x, y]

      checkScratchedPercentage()
    }

    function stopDrawing() {
      isDrawing = false
    }

    function checkScratchedPercentage() {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const pixels = imageData.data
      let transparentPixels = 0

      // Count transparent pixels (every 4th value is the alpha channel)
      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] < 10) {
          // Considering pixels with alpha <script 10 as scratched
          transparentPixels++
        }
      }

      scratchedPercentage =
        (transparentPixels / (canvas.width * canvas.height)) * 100

      // Mostrar o conteúdo gradualmente à medida que o usuário raspa
      content.style.opacity = (scratchedPercentage / 100).toFixed(2)

      // Ajustar a opacidade do overlay inversamente
      overlay.style.opacity = (1 - scratchedPercentage / 100).toFixed(2)

      // Se mais de 70% for raspado, revelar todo o cartão
      if (scratchedPercentage > 50) {
        canvas.style.display = 'none'
        overlay.style.display = 'none'
        content.style.opacity = '1'
      }
    }
  }

  // Add window resize event listener
  window.addEventListener('resize', function () {
    document.querySelectorAll('.scratch-canvas').forEach((canvas) => {
      const card = canvas.parentElement
      canvas.width = card.offsetWidth
      canvas.height = card.offsetHeight

      // Redraw the covering
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    })
  })

  // Initialize the game
  createCards(actions, 'actions-grid')
  createCards(bodyParts, 'body-parts-grid')

  // Reset button functionality
  document.getElementById('reset-btn').addEventListener('click', function () {
    createCards(actions, 'actions-grid')
    createCards(bodyParts, 'body-parts-grid')
  })
})
