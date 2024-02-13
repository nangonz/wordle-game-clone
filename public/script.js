import { WORDS } from "./words.js";

const NUMBER_OF_GUESSES = 6;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)]
console.log(rightGuessString)

const gameInfoVisibility = document.getElementsByClassName('gameInfo')[0]
const hintTextVisibility = document.getElementsByClassName('hintBulb')[0]
const textInfo = document.getElementsByClassName('textInfo')[0] //
const hintText = document.getElementsByClassName('textInfo')[1] //
const svgHintIcon = document.getElementById('svg-hint-icon')
const svgPath = svgHintIcon.querySelector('path')

// Add event listener to reset the game when clicking resetButton
const resetButton = document.getElementById("reset-button")
resetButton.addEventListener("click", function(){
  resetGame()
  resetButton.blur()
});


function initBoard() {
  let board = document.getElementById("game-board");

  for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
    let row = document.createElement("div")
    row.className = "letter-row"
        
    for (let j = 0; j < WORDS[j].length; j++) {
      let box = document.createElement("div")
      box.className = "letter-box"
      row.appendChild(box)
    }
  
    board.appendChild(row)
  }
}

initBoard()

// se añaden los eventos a las teclas.
document.addEventListener("keyup", (e) => {
  if (guessesRemaining === 0) return

  let pressedKey = String(e.key)
  if (pressedKey === "Backspace" && nextLetter !== 0) {
    deleteLetter()
    return
  }

  if (pressedKey === "Enter") {
    checkGuess()
    return
  }

  // let found = pressedKey.match(/[a-z]/gi)
  let found = pressedKey.match(/[a-zA-Z\u00C0-\u024F]/gu)
  if (!found || found.length > 1) {
    return
  } else {
    insertLetter(pressedKey)
  }
})

function insertLetter (pressedKey) {
  if (nextLetter === 5) {
    return
  }
  pressedKey = pressedKey.toLowerCase()

  let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining]
  let box = row.children[nextLetter]
  animateCSS(box, "pulse")
  box.textContent = pressedKey
  box.classList.add("filled-box")
  currentGuess.push(pressedKey)
  nextLetter += 1
}

function deleteLetter () {
  let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining]
  let box = row.children[nextLetter - 1]
  box.textContent = ""
  box.classList.remove("filled-box")
  currentGuess.pop()
  nextLetter -= 1
}

function checkGuess () {
  let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining]
  let guessString = ''
  let rightGuess = Array.from(rightGuessString)

  for (const val of currentGuess) {
    guessString += val
  }

  if (guessString.length != 5) {
    toastr.error("Not enough letters!")
    return
  }

  if (!WORDS.includes(guessString)) {
    toastr.error("Word not in list!")
    return
  }
  
  for (let i = 0; i < 5; i++) {
    let letterColor = ''
    let colorLetter = ''
    let box = row.children[i]
    let letter = currentGuess[i]
      
    let letterPosition = rightGuess.indexOf(currentGuess[i])
    // is letter in the correct guess
    if (letterPosition === -1) {
      letterColor = '#9e9e9e'
      colorLetter = 'white'
    } else {
      // now, letter is definitely in word
      // if letter index and right guess index are the same
      // letter is in the right position 
      if (currentGuess[i] === rightGuess[i]) {
        // shade green 
        letterColor = '#66e69b'
        colorLetter = 'white'
      } else {
        // shade box yellow
        letterColor = '#eaf852'
        colorLetter = 'white'
      }

      rightGuess[letterPosition] = "#"
    }

    let delay = 250 * i
    setTimeout(()=> {
        //flip box
        animateCSS(box, 'flipInX')
        //shade box
        box.style.backgroundColor = letterColor
        box.style.color = colorLetter
        shadeKeyBoard(letter, letterColor)
    }, delay)
  }

  if (guessString === rightGuessString) {
      toastr.success("You guessed right!")
      guessesRemaining = 0
      animateCSS(gameInfoVisibility, 'wobble')
      gameInfoVisibility.style.setProperty('--animate-duration', '1s');
      toggleDisplay('flex')
  } else {
    guessesRemaining -= 1;
    currentGuess = [];
    nextLetter = 0;

    if (guessesRemaining === 0) {
      toastr.error("You've run out of guesses! Game over!")
      toggleDisplay('flex', `🥲 La palabra correcta era: "${rightGuessString}"`, 'fail')
    }
  }
}

function shadeKeyBoard(letter, color) {
  for (const elem of document.getElementsByClassName("keyboard-button")) {
    if (elem.textContent === letter) {
      let oldColor = elem.style.backgroundColor
      if (oldColor === '#66e69b') {
        return
      } 

      if (oldColor === '#eaf852' && color !== '#66e69b') {
        return
      }

      elem.style.backgroundColor = color
      break
    }
  }
}

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
  const target = e.target
  
  if (!target.classList.contains("keyboard-button")) {
    return
  }
  let key = target.textContent

  if (key === "Del") {
    key = "Backspace"
  } 

  document.dispatchEvent(new KeyboardEvent("keyup", {'key': key}))
})

const animateCSS = (element, animation, prefix = 'animate__') =>
  // We create a Promise and return it
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    // const node = document.querySelector(element);
    const node = element
    node.style.setProperty('--animate-duration', '0.3s');
    
    node.classList.add(`${prefix}animated`, animationName);

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve('Animation ended');
    }

    node.addEventListener('animationend', handleAnimationEnd, {once: true});
});



//-----------------------------------------------------------------------------

function resetGame() {
  guessesRemaining = NUMBER_OF_GUESSES;
  currentGuess = [];
  nextLetter = 0;
  rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)];
  hintText.textContent = ''
  hintBulb.classList.remove('hintActive')
  svgPath.setAttribute('fill', 'white')
  

  // Toggle #gameInfo visibility
  toggleDisplay('none')

  //"Clean the content of the letter boxes on the board."
  const board = document.getElementById("game-board")
  board.innerHTML = ''

  // Initialize board to restart the game
  initBoard();

  // Restore keyboard's buttons color to default
  const keyboardButtons = document.getElementsByClassName("keyboard-button");
  for (let i = 0; i < keyboardButtons.length; i++) {
    keyboardButtons[i].style.backgroundColor = ""
  }
}


//---------------------------------------------
function toggleDisplay (display, message = '🎉¡Felicidades! Descubriste la palabra', type = 'success') {
  if(type === 'fail') {
    gameInfoVisibility.classList.add('fail')
    resetButton.classList.add('reset-fail')
  }
  textInfo.textContent = message
  gameInfoVisibility.style.display = display
  display === 'none'
    ? hintTextVisibility.style.display = 'flex'
    : hintTextVisibility.style.display = 'none'
}

function getHelpHint () {
  if(hintText.textContent === '') {
    hintBulb.classList.add('hintActive')
    svgPath.setAttribute('fill', '#F8FF86')
    hintText.textContent = `
    Comienza con 
    ${rightGuessString[0].toUpperCase()} 
    y termina con 
    ${rightGuessString[rightGuessString.length - 1].toUpperCase()}
    `
  } else {
    hintText.textContent = ''
    hintBulb.classList.remove('hintActive')
    svgPath.setAttribute('fill', 'white')
  } 
}

const hintBulb = document.getElementsByClassName('hintBulb')[0]
hintBulb.addEventListener('click', getHelpHint)
