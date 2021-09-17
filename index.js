const EVENTS = ["enter", "click"]
let FLAG_gameStarted = false
let FLAG_shouldHelp = false

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array
}

function isMobile() {
  return /Mobile|webOS|BlackBerry|IEMobile|MeeGo|mini|Fennec|Windows Phone|Android|iP(ad|od|hone)/i.test(navigator.userAgent)
} 

function didSudokuComplete() {
  const boxes = document.querySelectorAll(".box:not(.open)")
  for(let i = 0; i < boxes.length; i++) 
    if(boxes[i].classList.contains("wrong") || boxes[i].textContent !== boxes[i].dataset.s)
      return false
  return true
}

function showResults() {
  alert("Победа!")
}

function generateField() {
  const a = []
  let field = '0681594327597283416342671589934157268278936145156842973729318654813465792465729831'
  let arr = shuffle([1,2,3,4,6,7,5,8,9])
  for (var i = 1; i < 82; i++) 
    a.push(arr[field.substr(i, 1) - 1]) 
  return a
}

function activateBox({ currentTarget: box }) {
  const mobile = isMobile()
  const hiddenInput = document.getElementById("text")
  box.classList.add("selected")
  
  if(mobile)
    hiddenInput.focus()

  const reset = () => {
    box.classList.remove("selected") 
    document.removeEventListener("click", observer)
    if(mobile) 
      hiddenInput.removeEventListener("input", keypress)
    else 
      document.removeEventListener("keypress", keypress)
    
  }
  const observer = ({ target }) => target !== box ? reset() : undefined
  const keypress = ({ key, data }) => {
    if(mobile) key = data
    if(key > 0 && key < 10) {
      box.textContent = key
      if(FLAG_shouldHelp && key !== box.dataset.s)
        box.classList.add("wrong")
      else 
        box.classList.remove("wrong")

      if(didSudokuComplete())
        showResults()
      else
        reset()
    }
    if(mobile) hiddenInput.blur()
  }
  
  document.addEventListener("click", observer)
    if(mobile) 
      hiddenInput.addEventListener("change", keypress)
    else 
      document.addEventListener("keypress", keypress)
}

function resetGame() {
  const startButton = document.querySelector(".start-button")
  const boxes = document.querySelectorAll(".box")
  
  for(let i = 0; i < boxes.length; i++) {
    boxes[i].textContent = boxes[i].dataset.s = ""
    boxes[i].classList.remove("open", "wrong")
    EVENTS.forEach((e) => boxes[i].removeEventListener(e, activateBox))
  }

  FLAG_gameStarted = false
  document.querySelector(".help-radio").classList.remove("invisible")
  document.querySelector(".difficulties").classList.remove("invisible")
  document.querySelector(".sudoku-wrapper").classList.remove("started")
  startButton.textContent = "Начать"
  startButton.classList.remove("started")
}

function generateSudoku(hintsCount) {
  const startButton = document.querySelector(".start-button")
  const boxes = document.querySelectorAll(".box")
  const field = generateField()

  document.querySelector(".help-radio").classList.add("invisible")
  document.querySelector(".difficulties").classList.add("invisible")
  document.querySelector(".sudoku-wrapper").classList.add("started")
  startButton.textContent = "Закончить игру"
  startButton.classList.add("started")
  FLAG_gameStarted = true
  

  for(let i = 0; i < 3; i++) 
    for(let l = 0; l < 3; l++) 
      for(let k = 0; k < 3; k++) 
        for(let m = 0; m < 3; m++) 
          boxes[m + k * 9 + l * 3 + i * 27].dataset.s = field[m + k * 3  + l * 9 + i * 27]

  for(let i = hintsCount % 82, box = boxes[Math.random() * 81 | 0]; i > 0; box = boxes[Math.random() * 81 | 0], i--) {
      if(box.textContent !== "")
        i++
      else {
        box.textContent = box.dataset.s
        box.classList.add("open")
      }
  }

  const closedBoxes = document.querySelectorAll(".box:not(.open)")

  for(let i = 0; i < closedBoxes.length; i++)
    EVENTS.forEach((e) => closedBoxes[i].addEventListener(e, activateBox))
}



(function interfaceV() {
  const controls = document.querySelectorAll(".difficulty")
  const startButton = document.querySelector(".start-button")
  const helpSwitcher = document.querySelector(".switcher")
  let FLAG_difficulty = "easy"

  controls
    .forEach((b) => EVENTS.forEach((e) => b.addEventListener(e, ({ currentTarget }) => {
      FLAG_difficulty = currentTarget.dataset.d
      document.querySelector(".difficulty.selected").classList.remove("selected")
      currentTarget.classList.add("selected")
    })))
  EVENTS
    .forEach((e) => startButton.addEventListener(e, (e) => {
      e.preventDefault();
      FLAG_gameStarted 
            ? resetGame() 
            : generateSudoku(({"easy": 30, "normal": 25, "hard": 20, "hardcore": 17})[FLAG_difficulty])
    }))
  EVENTS
    .forEach(
      (e) => helpSwitcher.addEventListener(e, () => {
        FLAG_shouldHelp = !FLAG_shouldHelp
        helpSwitcher.classList.toggle("active")
      })
    )
})()




  

