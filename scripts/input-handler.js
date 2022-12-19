import promptSync from "prompt-sync";
const prompt = promptSync();

function inputString(message) {
    let input = prompt(message);
    input = input.trim();
    return input;
}

function inputNumber(message) {
    let input = prompt(message);
    input = input.trim();
    input = Number(input);
    if (isNaN(input)) {
        console.log("\nInvalid input. Please enter a number.");
        input = inputNumber(message);
    }
    return input;
}

function inputYesNo(message) {
    let input = prompt(message);
    input = input.trim();
    input = input.toLowerCase();
    if (input === "y" || input === "yes") {
        return true;
    } else if (input === "n" || input === "no") {
        return false;
    } else {
        console.log("\nInvalid input. Please enter yes or no.");
        input = inputYesNo(message);
    }
    return input;
}

export { inputString, inputNumber, inputYesNo };