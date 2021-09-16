const EVENTS = ["enter", "click"]
let FLAG_gameStarted = false

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array
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
  box.classList.add("selected")

  const reset = () => {
    box.classList.remove("selected") 
    document.removeEventListener("click", observer)
    document.removeEventListener("keypress", keypress)
  }
  const observer = ({ target }) => target !== box ? reset() : undefined
  const keypress = ({ key }) => key > 0 && key < 10 ? (box.textContent = key, reset()) : undefined
  
  document.addEventListener("click", observer)
  document.addEventListener("keypress", keypress)
}

function resetGame() {
  const startButton = document.querySelector(".start-button")
  const boxes = document.querySelectorAll(".box")
  
  for(let i = 0; i < boxes.length; i++) {
    boxes[i].textContent = boxes[i].dataset.s = ""
    boxes[i].classList.remove("open")
    EVENTS.forEach((e) => boxes[i].removeEventListener(e, activateBox))
  }

  FLAG_gameStarted = false
  document.querySelector(".sudoku-wrapper").classList.remove("started")
  startButton.textContent = "Начать"
  startButton.classList.remove("started")
}

function generateSudoku(hintsCount) {
  const startButton = document.querySelector(".start-button")
  const boxes = document.querySelectorAll(".box")
  const field = generateField()

  document.querySelector(".sudoku-wrapper").classList.add("started")
  startButton.textContent = "Подвести итоги"
  startButton.classList.add("started")
  FLAG_gameStarted = true
  

  for(let i = 0; i < 3; i++) 
    for(let l = 0; l < 3; l++) 
      for(let k = 0; k < 3; k++) 
        for(let m = 0; m < 3; m++) 
          boxes[m + k * 9 + l * 3 + i * 27].dataset.s = field[m + k * 3  + l * 9 + i * 27]

  for(let i = hintsCount, box = boxes[Math.random() * 81 | 0]; i > 0; box = boxes[Math.random() * 81 | 0], i--) {
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
  let FLAG_difficulty = "easy"

  controls
    .forEach((b) => EVENTS.forEach((e) => b.addEventListener(e, ({ currentTarget }) => {
      resetGame()
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
})()




  

