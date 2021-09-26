const EVENTS = ["enter", "click"]
const boxIndexMap = []

let FIELD = ""

let FLAG_gameStarted = false
let FLAG_shouldHelp = false

for (let i = 0; i < 3; i++)
    for (let l = 0; l < 3; l++)
      for (let k = 0; k < 3; k++)
        for (let m = 0; m < 3; m++)
          boxIndexMap[m + k * 3 + l * 9 + i * 27] = m + k * 9 + l * 3 + i * 27

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function isMobile() {
  return /Mobile|webOS|BlackBerry|IEMobile|MeeGo|mini|Fennec|Windows Phone|Android|iP(ad|od|hone)/i.test(
    navigator.userAgent
  )
}




function didSudokuComplete() {
  const boxes = document.querySelectorAll(".box:not(.open):not(.wrong)")
  for (let i = 0; i < boxes.length; i++)
    if (boxes[i].textContent !== boxes[i].dataset.s)
      return false
  return true
}

function generateField() {
  const a = []
  let field = "0681594327597283416342671589934157268278936145156842973729318654813465792465729831"
  let arr = shuffle([1, 2, 3, 4, 6, 7, 5, 8, 9])
  for (let i = 1; i < 82; i++) 
    a.push(arr[field.substr(i, 1) - 1])
  return a
}





function activateBox({ currentTarget: box }) {
  const mobile = isMobile()
  const hiddenInput = document.getElementById("text")
  
  box.classList.add("selected")

  if (mobile) hiddenInput.focus()

  const reset = () => {
    box.classList.remove("selected")

    document.removeEventListener("click", observer)
    if (mobile) 
      hiddenInput.removeEventListener("input", input)
    else 
      document.removeEventListener("keypress", input)
  }
  const observer = ({ target }) => (target !== box ? reset() : undefined)
  const input = ({ key, data }) => {
    if (mobile) {
      key = data
      hiddenInput.blur()
    }

    if (key > 0 && key < 10) {
      const method = FLAG_shouldHelp && key !== box.dataset.s ? "add" : "remove"
      box.classList[method]("wrong")
      box.textContent = key

      reset()
      if (didSudokuComplete()) 
        finishGame()
    }
  }

  document.addEventListener("click", observer)
  if (mobile) 
    hiddenInput.addEventListener("input", input)
  else 
    document.addEventListener("keypress", input)
}



function finishGame() {
  const boxes = document.querySelectorAll(".box")
  const groups = Array(17).fill(0).map(() => ([]))

  for(let i = 0; i < 17; i++)
    for(let k = Math.min(i, 8), n = Math.max(i - 8, 0); k >= 0 && n <= 8; k--, n++)
      groups[i].push(boxes[boxIndexMap[[k * 9 + n]]])

  (function f(i) {
    if(i < 17) {
      groups[i].forEach((box) => box.classList.add("animation"))
      setTimeout(f, 50, i + 1)
    } 
    else 
      setTimeout(resetGame, 750)
  })(0)
}

function resetGame() {
  const startButton = document.querySelector(".start-button")
  const boxes = document.querySelectorAll(".box")

  for (let i = 0; i < boxes.length; i++) {
    boxes[i].textContent = boxes[i].dataset.s = ""
    boxes[i].classList.remove("open", "wrong", "animation", "selected")
    EVENTS.forEach((e) => boxes[i].removeEventListener(e, activateBox))
  }

  document.querySelectorAll(".difficulties").forEach((el) => el.classList.remove("invisible"))
  document.querySelector(".difficulty-button").classList.remove("invisible")
  document.querySelector(".help-radio").classList.remove("invisible")
  document.querySelector(".sudoku-wrapper").classList.remove("started")

  startButton.textContent = "Начать"
  startButton.classList.remove("started")

  FLAG_gameStarted = false
}

function generateSudoku(hintsCount, field, openedBoxes = [], activatedBoxes = []) {
  const startButton = document.querySelector(".start-button")
  const boxes = document.querySelectorAll(".box")
  FIELD = field || generateField()

  document.querySelectorAll(".difficulties").forEach((el) => el.classList.add("invisible"))
  document.querySelector(".difficulty-button").classList.add("invisible")
  document.querySelector(".help-radio").classList.add("invisible")
  document.querySelector(".sudoku-wrapper").classList.add("started")

  startButton.textContent = "Закончить игру"
  startButton.classList.add("started")

  localStorage.removeItem("save")
  FLAG_gameStarted = true

  for (let i = 0; i < 81; i++) 
    boxes[boxIndexMap[i]].dataset.s = FIELD[i]

  if(openedBoxes.length) {
    while(openedBoxes.length) {
      const box = boxes[openedBoxes.shift()]
      box.textContent = box.dataset.s
      box.classList.add("open")
    }
  } else {
    for (let i = hintsCount % 82, box = boxes[(Math.random() * 81) | 0]; i > 0; box = boxes[(Math.random() * 81) | 0], i--) 
      if (box.textContent !== "") i++
      else {
        box.textContent = box.dataset.s
        box.classList.add("open")
      }
  }
    
  
  if(activatedBoxes.length) 
    while(activatedBoxes.length) {
      let [idx, isWrong, value] = activatedBoxes.shift().split("|")
      if(idx === "") continue

      const box = boxes[idx]
      if(isWrong === "w")
        box.classList.add("wrong")
      else 
        value = isWrong
      box.textContent = value
    }
    

  const closedBoxes = document.querySelectorAll(".box:not(.open)")
  for (let i = 0; i < closedBoxes.length; i++)
    EVENTS.forEach((e) => closedBoxes[i].addEventListener(e, activateBox))
}



(function interfaceV() {
  const DIFFICULTIES_ENUM = [
      ["easy", 35], ["normal", 30], ["hard", 25], ["hardcore", 17]
    ].reduce((e, [ l, o ]) => (e[l] = o, e[o] = l, e), {})
  let FLAG_difficulty = "easy"

  const controls = document.querySelectorAll(".difficulty")
  const startButton = document.querySelector(".start-button")
  const helpSwitcher = document.querySelector(".switcher")
  
  function toggleSwitcher(value) {
      FLAG_shouldHelp = value === undefined ? !FLAG_shouldHelp : value
      const method = FLAG_shouldHelp ? "add" : "remove"
      helpSwitcher.classList[method]("active")
  } 

  controls.forEach((control) =>
    EVENTS.forEach((eventName) =>
      control.addEventListener(eventName, ({ currentTarget }) => {
        FLAG_difficulty = currentTarget.dataset.d
        document
          .querySelector(".difficulty.selected")
          .classList.remove("selected")
        currentTarget.classList.add("selected")
      })
    )
  )
  EVENTS.forEach((eventName) =>
    startButton.addEventListener(eventName, (event) => {
      event.preventDefault()
      FLAG_gameStarted
        ? resetGame()
        : generateSudoku(DIFFICULTIES_ENUM[FLAG_difficulty])
    })
  )
  EVENTS.forEach((eventName) =>
    helpSwitcher.addEventListener(eventName, () => toggleSwitcher())
  )

  const mobileControl = document.querySelector(".difficulty-button")
  const mobileDifficultyButtons = document.querySelectorAll(".difficulties-mobile-view__list__item")
  const mobilePopupVeil = document.querySelector(".difficulties-mobile-view-veil")
  const currentDifficultyButton = () => document.querySelector(".difficulties-mobile-view__list__item.selected")
  
  mobileDifficultyButtons.forEach((button) =>
    button.addEventListener("click", ({ target }) => {
      FLAG_difficulty = target.dataset.d

      mobilePopupVeil.classList.add("invisible")
      currentDifficultyButton().classList.remove("selected")
      target.classList.add("selected")
      mobileControl.textContent = target.textContent
    })
  )

  mobileControl.addEventListener("click", () => {
    mobilePopupVeil.classList.remove("invisible")
    document.addEventListener("click", 
      function k({ target }) {
        if (target === mobilePopupVeil) {
          mobilePopupVeil.classList.add("invisible")
          document.removeEventListener("click", k)
        }
      }
    )
  })

  window.addEventListener("load", () => {
    const save = localStorage.getItem("save")
    let shouldHelp, field, open, activatedBoxes
    if(!save) 
      return

    save
      .split("&")
      .map((a) => a.split("="))
      .forEach(([option, value]) => (
          ({
            h: () => shouldHelp = Boolean(eval(value)),
            f: () => field = value.split(","),
            o: () => open = value.split(","),
            a: () => activatedBoxes = value.length ? value.split(",") : []
          })[option]()
        )
      )
    
    toggleSwitcher(shouldHelp)
    generateSudoku(DIFFICULTIES_ENUM[open.length], field, open, activatedBoxes)
  })

  window.addEventListener("beforeunload", (e) => {
    const boxes = document.querySelectorAll(".box")
    
    if(!FLAG_gameStarted) 
      return true

    let o = "", a = ""
    for(let i = 0, box = boxes[i]; i < boxes.length; box = boxes[++i])
      if(box.classList.contains("open"))
        o += "," + i
      else if(box.textContent !== "") 
        a += `,${i}` + (box.classList.contains("wrong") ? "|w" : "") + `|${box.textContent}`

    localStorage.setItem("save", `h=${FLAG_shouldHelp}&f=${FIELD}&o=${o.substring(1)}&a=${a.length ? a.substring(1) : ""}`)
  })
})()
