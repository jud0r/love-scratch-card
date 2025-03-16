document.addEventListener('DOMContentLoaded', function () {
  const actions = [
    'Massagear',
    'Lamber',
    'Chupar',
    'Mordiscar',
    'Ele decide',
    'Acariciar',
    'Ela decide',
    'Beijar',
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

  function limitAndShuffleArray(array, limit = 8) {
    // Shuffle array primeiro
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    // Retorna exatamente o número de itens solicitado
    // Se o array for menor, repete itens para alcançar o número desejado
    let result = []

    if (shuffled.length >= limit) {
      // Se temos itens suficientes, pegamos apenas os primeiros [limit]
      result = shuffled.slice(0, limit)
    } else {
      // Se não temos itens suficientes, repetimos itens para atingir [limit]
      while (result.length < limit) {
        const remainingNeeded = limit - result.length
        result = result.concat(
          shuffled.slice(0, Math.min(remainingNeeded, shuffled.length))
        )
      }
    }

    return result
  }

  function createCards(items, containerId) {
    const container = document.getElementById(containerId)
    container.innerHTML = ''

    // Sempre usa exatamente 8 itens (4 por linha em 2 linhas)
    const shuffledItems = limitAndShuffleArray(items, 8)

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
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    let isDrawing = false
    let lastX = 0
    let lastY = 0
    let scratchedPercentage = 0
    const overlay = card.querySelector('.scratch-overlay')
    const content = card.querySelector('.card-content')

    // Set canvas dimensions
    function resizeCanvas() {
      canvas.width = card.offsetWidth
      canvas.height = card.offsetHeight
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    content.style.opacity = '0'
    content.style.transition = 'opacity 0.2s'

    // Initial resize
    setTimeout(resizeCanvas, 100)

    // Handle events - usar passive: false para melhorar desempenho em toque
    canvas.addEventListener('mousedown', startDrawing)
    canvas.addEventListener('touchstart', startDrawingTouch, { passive: false })
    canvas.addEventListener('mousemove', draw)
    canvas.addEventListener('touchmove', drawTouch, { passive: false })
    canvas.addEventListener('mouseup', stopDrawing)
    canvas.addEventListener('touchend', stopDrawing)
    canvas.addEventListener('touchcancel', stopDrawing)

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

      // Aumentar largura da linha para facilitar a raspagem
      ctx.lineWidth = window.innerWidth <= 768 ? 30 : 20
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

      // Aumentar largura da linha para facilitar a raspagem em dispositivos touch
      ctx.lineWidth = 30
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
          // Considering pixels with alpha < 10 as scratched
          transparentPixels++
        }
      }

      scratchedPercentage =
        (transparentPixels / (canvas.width * canvas.height)) * 100

      // Mostrar o conteúdo gradualmente à medida que o usuário raspa
      content.style.opacity = (scratchedPercentage / 100).toFixed(2)

      // Ajustar a opacidade do overlay inversamente
      overlay.style.opacity = (1 - scratchedPercentage / 100).toFixed(2)

      // Revelar mais cedo em dispositivos móveis (40% em vez de 50%)
      const revealThreshold = window.innerWidth <= 768 ? 40 : 50

      if (scratchedPercentage > revealThreshold) {
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
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
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
