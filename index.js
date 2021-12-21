const allMovesArr = process.argv.slice(2);
const readline = require("readline");
const { SHA3 } = require("sha3");
const hash = new SHA3(256);
const { stdin: input, stdout: output } = require("process");
const rl = readline.createInterface({ input, output });

function getSecureRandom() {
  hash.update(String(Math.random()));
  return hash.digest("hex");
}

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getHMAC(SecureRandom, moveComputer) {
  let hmacHash = new SHA3(256);
  hmacHash.update(SecureRandom + moveComputer);
  return hmacHash.digest("hex");
}

function getMoveComputer(randomInt, inputParamsArray) {
  return inputParamsArray[randomInt - 1];
}

function getArrOfGameParams() {
  let randomInt = getRandomInteger(1, allMovesArr.length + 1);
  let secureRandom = getSecureRandom();
  let moveComputer = getMoveComputer(randomInt, allMovesArr);
  let hmac = getHMAC(secureRandom, moveComputer);
  return [randomInt, secureRandom, moveComputer, hmac];
}

function continueGame(mesage) {
  console.log(mesage);
  rl.question("Enter 1 to continue:", (move) => {
    if (move === "1") {
      rl.close();
    }
  });
}

let [randomInt, secureRandom, moveComputer, hmac] = getArrOfGameParams();

function checkEnterParams() {
  let set = new Set(allMovesArr);
  if (set.size !== allMovesArr.length) {
    continueGame("There should not be the same parameters!");
  } else if (allMovesArr.length % 2 === 0) {
    continueGame("The number of parameters must be odd!");
  } else {
    console.log(showAllOption(allMovesArr));
    startGame();
  }
}
checkEnterParams();

function showAllOption(inputParamsArray) {
  let info = inputParamsArray.reduce((ac, item, index) => {
    return (ac += `${index + 1} - ${item} \n`);
  }, "");
  return `HMAC: ${hmac} \nAvailable moves: \n${info}0 - exit \n? - help`;
}

function getObjectAllRules(inputParamsArray) {
  let templateVar, objAllRules = {},templateObj = {},
    rulesArr = getRuleTemplate(allMovesArr);
  for (let i = 0; i < inputParamsArray.length; i++) {
    templateObj = {};
    for (j = 0; j < rulesArr.length; j++) {
      templateObj = {...templateObj,[`${j + 1} - ${inputParamsArray[j]}`]: rulesArr[j],};
    }
    templateVar = rulesArr.pop();
    rulesArr.unshift(templateVar);
    objAllRules = {...objAllRules,[`${i + 1} - ${inputParamsArray[i]}`]: templateObj,};
  }
  return objAllRules;
}

function getWinner(move) {
  return getObjectAllRules(allMovesArr)[`${randomInt} - ${moveComputer}`][ `${move} - ${allMovesArr[move - 1]}`];
}

function showResultGame(move) {
  let result;
  if (getWinner(move) === "draw") {
    result = "Draw!";
  } else if (getWinner(move) === "lose") {
    result = "You Win!";
  } else {
    result = "Computer Win!";
  }
  return `Your move:${allMovesArr[move - 1]} \nComputer move:${moveComputer} \n${result} \nHMAC key:${secureRandom}`;
}

function getRuleTemplate(inputParamsArray) {
  let rulesArr = ["draw"];
  for (let i = 1; i < inputParamsArray.length; i++) {
    if (i < inputParamsArray.length / 2) {
      rulesArr.push("win");
    } else {
      rulesArr.push("lose");
    }
  }
  return rulesArr;
}

function isValidEnterMove(move) {
  return (move < 0 || move > allMovesArr.length || (isNaN(move + 1) && move !== "?" && move !== "0"));
}

function startGame() {
  rl.question("Enter your move: ", (move) => {
    if (isValidEnterMove(move)) {
      console.log(
        `The move is not correct.\nYou need to enter a number from "1" to "${allMovesArr.length}" to move or "0" to exit or "?" for help. `
      );
      return startGame();
    } else if (move === "0") {
      console.log("EXIT.");
      rl.close();
    } else if (move === "?") {
      console.log("HELP:");
      console.table(getObjectAllRules(allMovesArr));
      return startGame();
    } else {
      console.log(showResultGame(move));
    }
    rl.close();
  });
}
