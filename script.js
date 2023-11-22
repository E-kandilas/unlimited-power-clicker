// Game State Variables
// let numUnlockedModifiers = 0;
// let numUnlockedProducers = 0;
let numTicksRemainingOfCrack = 0;
let playedlaugh = false;
const gameData = window.localStorage.getItem("gameData")
if (gameData) {
  const windowCleanData = window.data;
  window.data = JSON.parse(gameData);
  if (window.data.modifiers[1].qty) {
    window.data = windowCleanData
  }
  console.log('gameData', JSON.parse(gameData))
}

const { modifiers, producers } = window.data;

// Elements
const I_AM_THE_SENATE = document.getElementById('the_senate_image');
const HATE_COUNTER_ELEMENT = document.getElementById('hatred_counter');
const HPS_COUNTER_ELEMENT = document.getElementById('hps_display');
const MODIFIER_ELEMENT = document.getElementById('modifier_container');
const PRODUCER_ELEMENT = document.getElementById('producer_container');

// Audio
const UNLOCKED_AUDIO = new Audio('assets/unlock.mp3');
UNLOCKED_AUDIO.volume = 0.2;
const UNLIMITED_POWER_AUDIO = new Audio('assets/unlimitedpower.mp3');
const EVIL_LAUGH_AUDIO = new Audio('assets/emperorlaugh.mp3');

// Event Handlers
const handleImageClick = (e) => {
  let newHateVal;
  if (modifiers[0].qty === 0) {
    newHateVal = window.data.hatred + 1;
  } else {
    newHateVal = window.data.hatred + (2 * modifiers[0].qty)
  }
  handleHateChange(newHateVal);
}

// {
//   id: 'unlimited_power',
//   price: 20000000,
//   multiplier: 501,
//   unlocked: false,
//   length: 30000,
// }

const purchase = (type, id) => {
  const element = window.data[type].find(element => {
    return element.id === id;
  });
  // Modify the window data here
  const currentHatred = window.data.hatred;
  const notCrackedOut = (id === 'unlimited_power' && numTicksRemainingOfCrack > 0)
  if (currentHatred >= element.price && !notCrackedOut) {
    const newHateVal = window.data.hatred - element.price;
    if (type === 'producers') {
      const newHPSVal = window.data.totalHPS + element.hps;
      handleHPSChange(newHPSVal); // update backend and frontend
    }
    id !== 'unlimited_power' && handleHateChange(newHateVal);
    let newQty = null;
    if (id !== 'unlimited_power') {
      newQty = element.qty + 1;
    }
    const newPrice = Math.floor(element.price * 1.75);
    handleQuantityAndPriceChange(element, newPrice, newQty); // update backend and frontend
    if (id === 'unlimited_power' && numTicksRemainingOfCrack === 0) {
      element.active = true;
      numTicksRemainingOfCrack += element.duration;
      handleHateChange(newHateVal)
      // We have to toggle it on here
      document.getElementById(id).querySelector('.quantity-badge').classList.add('active-power');
      UNLIMITED_POWER_AUDIO.play();
    }
  }
}

// Game Logic
function handleQuantityAndPriceChange(element, newPrice, newQty) {
  element.price = newPrice;
  element.qty = newQty;
  const id = element.id;
  const button = document.getElementById(id);
  const isPower = id === 'unlimited_power' ? 'power-button' : '';
  const isActive = element.active ? 'active-power' : '';
  let processedQty = newQty;
  if (id === 'unlimited_power' && numTicksRemainingOfCrack > 0) {
    processedQty = numTicksRemainingOfCrack;
  }
  
  button.innerHTML = `
    <div class='button-inner-container'>
          <img src='assets/${id}.webp'></img>
      <div class="button-body">
          <div class="quantity-badge ${isPower} ${isActive}">
              <span>${newQty || ''}</span>
          </div>
          <span>Price: ${newPrice.toLocaleString("en-US")}</span>
      </div>
    </div>
  `;
}

function handleHateChange(newHateValue) {
  window.data.hatred = newHateValue;
  const hateCounterString = `Hatred: ${window.data.hatred}`;
  HATE_COUNTER_ELEMENT.innerHTML = hateCounterString;
}

function handleHPSChange(newHpsValue) {
  window.data.totalHPS = newHpsValue;
  const HPSCounterString = `HPS: ${window.data.totalHPS}`;
  HPS_COUNTER_ELEMENT.innerHTML = HPSCounterString;
  const opacityCheck = Math.min(newHpsValue/1500,1);
  I_AM_THE_SENATE.style.opacity = 1 - opacityCheck;
  if (opacityCheck === 1 && !playedlaugh) {
    EVIL_LAUGH_AUDIO.play();
    playedlaugh = true;
  } 
}

// Element Creation Functions
const makeButton = (buttonText, id, price, qty, buttonType) => {
  const button = document.createElement('button');
  const displayQuantity = qty === undefined || qty === null ? '' : qty;
  const powerButtonToggleClass = id === 'unlimited_power' ? 'power-button' : '';
  const buttonInnerHTMl = `
    <div class='button-inner-container'>
      <img src='assets/${buttonText.split(' ').join('_')}.webp'></img>
      <div class="button-body">
      <div class="quantity-badge ${powerButtonToggleClass}">
          <span>${displayQuantity}</span>
      </div>
          <span>Price: ${price.toLocaleString("en-US")}</span>
      </div>
    </div>
  `;
  button.innerHTML = buttonInnerHTMl;
  button.id = id;
  button.onclick = () => purchase(buttonType, id);
  return button;
}

const handleCrackTicks = () => {
    const crackDisplay = document.getElementById('unlimited_power').querySelector('.quantity-badge');
  if (numTicksRemainingOfCrack) {
    crackDisplay.innerHTML = numTicksRemainingOfCrack;
  } else {
    crackDisplay.innerHTML = '';
  }
}

// [{id, price, multiplier, unlock}, {...} ...] -- multiplyers
// [{id, price, qty, unlock}, {...} ...] -- producers

const makeButtons = (arr, buttonType) => {
  for (let i = 0; i < arr.length; i++) {
    const { id, price, qty, unlocked } = arr[i]; // this is our button object
    const button = makeButton(id.split('_').join(' '), id, price, qty, buttonType);
    if (buttonType === 'modifiers') {
      button.classList.add('modifierButton')
      if (!unlocked) {
        button.classList.add('locked');
      }
      // const img = button.querySelector(`img`);
      // img.classList.add('locked');
      MODIFIER_ELEMENT.appendChild(button);
    } else {
      button.classList.add('producerButton');
      if (!unlocked) {
        button.classList.add('locked');
       }
      // const img = button.querySelector(`img`);
      // img.classList.add('locked');
      PRODUCER_ELEMENT.appendChild(button);
    }
  };
};

// Add Elements to DOM
makeButtons(modifiers, 'modifiers');
makeButtons(producers, 'producers');

// Add Properties to elements:
I_AM_THE_SENATE.onclick = handleImageClick;

// Game Logic
const evaluateHate = (producer) => {
  return producer.hps * producer.qty;
};

const checkUnlocked = (purchasableObject) => {
  if (window.data.hatred >= purchasableObject.price) {
    purchasableObject.unlocked = true; // this is a bug
    const button = document.getElementById(purchasableObject.id);
    button.classList.remove('locked');
    // button.querySelector(`img`).classList.remove('locked');
    UNLOCKED_AUDIO.play();
    return 1;
  } else {
    return 0;
  };
};

// Game Tick
const gameTick = () => {
  
  let nextHPS = 0;
  // Iteratively check producers and aggregate HPS
  for (let i = 0; i < producers.length; i++) {
    let multiplier = 1;
    if (numTicksRemainingOfCrack > 0) {
      multiplier = modifiers[1].multiplier;
    };
    nextHPS += multiplier * evaluateHate(producers[i]);
  };
  // Then Handle hate change
  handleHPSChange(nextHPS);
  handleHateChange(window.data.hatred + nextHPS);

  if (window.data.numUnlockedModifiers < modifiers.length) {
    for (let i = window.data.numUnlockedModifiers; i < modifiers.length; i++) {
      const modifier = modifiers[i]
      window.data.numUnlockedModifiers += checkUnlocked(modifier);
    }
  }

  if (window.data.numUnlockedProducers < producers.length) {
    for (let j = window.data.numUnlockedProducers; j < producers.length; j++) {
      const producer = producers[j]
      window.data.numUnlockedProducers += checkUnlocked(producer);
    }
  }

  numTicksRemainingOfCrack = Math.max(numTicksRemainingOfCrack - 1, 0);
  if (numTicksRemainingOfCrack === 0) {
    modifiers[1].active = false;
    document.getElementById('unlimited_power').querySelector('.quantity-badge').classList.remove('active-power');
  };
// Save game state to local storage here
  window.localStorage.setItem("gameData", JSON.stringify(window.data));
  console.log('windows data', window.data)
  // console.log('Window local storage:', JSON.parse(window.localStorage.gameData))

  handleCrackTicks();
}

// Create Function that takes a modifier ID and does stuff with it; // triggerModifier

//SET INTERVAL CALL - GAME LOOP call the function that calls the other functions inside the interval :)
setInterval(() => gameTick(), 900);

// TODO:
/*
- add mboile scaling and style
- add more audio?
-- Optional--
- button on click effects
- Tooltips with flavor texts and modifiers
- organize our stuff a little if we want?
*/
