function roundResult(num) {
	return Math.round(num * 1E10) / 1E10;
}

function add(a, b) {
	return roundResult(a + b);
}
function subtract(a, b) {
	return roundResult(a - b);
}
function multiply(a, b) {
	return roundResult(a * b);
}
function divide(a, b) {
	return b == 0 ? NaN : roundResult(a / b);
}

function power(a, b) {
	return roundResult(a ** b);
}

const ops = {
	'+': add,
	'-': subtract,
	'*': multiply,
	'/': divide,
	'^': power,
}

function operate(op, num1, num2) {
	if (op in ops) {
		return ops[op](num1, num2);
	} else {
		return NaN;
	}
}

function getFormulaContent() {
	return document.querySelector('#formula-display').textContent;
}
function setFormulaContent(newContent) {
	document.querySelector('#formula-display').textContent = newContent;
}
function appendFormulaContent(appendContent) {
	document.querySelector('#formula-display').textContent += appendContent;
}

function getDisplayContent() {
	return document.querySelector('#input-display').textContent;
}
function setDisplayContent(newContent) {
	document.querySelector('#input-display').textContent = newContent;
}
function appendDisplayContent(appendContent) {
	document.querySelector('#input-display').textContent += appendContent;
}


let num1, operator, num2;
let num2_inputing = false;
const DIVIDE_ZERO_ERROER_MSG = 'error operation: divide 0!';

function handleInput(currentInput) {
	let currentDisplayContent = getDisplayContent();
	if (num1 === undefined) {
		// get input for the first number
		if ('0123456789'.includes(currentInput)) {
			// prevent 0 prefix in number
			if (currentDisplayContent == '0') {
				setDisplayContent(currentInput);
				setFormulaContent(currentInput);
			} else {
				appendDisplayContent(currentInput);
				appendFormulaContent(currentInput);
			}
		} else if (currentInput == '.') {
			// append . only if num doesn't have one
			if (!currentDisplayContent.includes('.')) {
				appendDisplayContent(currentInput);
				appendFormulaContent(currentInput);
			}
		} else if ('+-*/^'.includes(currentInput)) {
			// set num1 and operator
			num1 = parseFloat(currentDisplayContent);
			operator = currentInput;
			appendFormulaContent(currentInput);
		} else if (currentInput == '←') {
			// if new content is empty, use 0
			if (currentDisplayContent.length > 1) {
				setDisplayContent(currentDisplayContent.slice(0, -1));
				setFormulaContent(getFormulaContent().slice(0, -1));
			} else {
				setDisplayContent('0');
				setFormulaContent('0');
			}
		} else if (currentInput == 'C') {
			setDisplayContent('0');
			setFormulaContent('0');
		} else if (currentInput == 'AC') {
			setDisplayContent('0');
			setFormulaContent('0');
		} else if (currentInput == '=') {
			// not ready to compute, do nothing
		} else { // unsupport input
			// throw new Error;
		}
	} else if (operator === undefined) {
		if ('0123456789'.includes(currentInput)) {
			// re-input num1 
			num1 = undefined;
			setDisplayContent(currentInput);
			setFormulaContent(currentInput);
		} else if (currentInput == '.') {
			// re-input num1, start with '0.'
			num1 = undefined;
			setDisplayContent('0.');
			setFormulaContent('0.');
		} else if ('+-*/^'.includes(currentInput)) {
			operator = currentInput;
			setFormulaContent(`${num1}${operator}`);
		} else if (currentInput == '←') {
			// make num1 unfinished and modified num1
			num1 = undefined;
			if (currentDisplayContent.length > 1) {
				setDisplayContent(currentDisplayContent.slice(0, -1));
				setFormulaContent(currentDisplayContent.slice(0, -1));
			} else {
				setDisplayContent('0');
				setFormulaContent('0');
			}
		} else if (currentInput == 'C') {
			// clear num1
			num1 = undefined;
			setDisplayContent('0');
			setFormulaContent('0');
		} else if (currentInput == 'AC') {
			// clear num1
			num1 = undefined;
			setDisplayContent('0');
			setFormulaContent('0');
		} else if (currentInput == '=') {
			// not ready to compute, do nothing
		} else { // unsupport input
			// throw new Error;
		}
	} else if (num2 === undefined) {
		if ('0123456789'.includes(currentInput)) {
			if (!num2_inputing) {
				num2_inputing = true;
				setDisplayContent(currentInput);
				appendFormulaContent(currentInput);
			} else {
				if (currentDisplayContent == '0') {
					setDisplayContent(currentInput);
					setFormulaContent(`${getFormulaContent().slice(0, -1)}${currentInput}`);
				} else {
					appendDisplayContent(currentInput);
					appendFormulaContent(currentInput);
				}
			}
		} else if (currentInput == '.') {
			if (!num2_inputing) {
				num2_inputing = true;
				setDisplayContent('0.');
				appendFormulaContent('0.');
			} else {
				if (!currentDisplayContent.includes('.')) {
					appendDisplayContent(currentInput);
					appendFormulaContent(currentInput);
				}
			}
		} else if ('+-*/^'.includes(currentInput)) {
			// @todo
			if (!num2_inputing) {
				// replace the operator
				operator = currentInput;
			} else {
				// finish num2 input, and compute
				num2 = parseFloat(currentDisplayContent);
				let result = operate(operator, num1, num2);

				if (!Number.isNaN(result)) { // operation success
					// display result, set state to the next round operation
					setDisplayContent(result);
					setFormulaContent(`${result}${currentInput}`)
					num1 = result;
					operator = currentInput;
					num2 = undefined;
					num2_inputing = false;
				} else if (operator == '/') { // handle divide 0 error
					// alert error message, and recover
					alert(DIVIDE_ZERO_ERROER_MSG);
					num2 = undefined;
				} else if (operator == '^') { // handle exponentiate error
					// alert error message, and recover
					alert(`The result of ${num1}^${num2} is not a real number!`);
					num2 = undefined;
				}
			}
		} else if (currentInput == '←') {
			if (!num2_inputing) {
				// num2 input not started, do nothing
			} else {
				if (currentDisplayContent.length > 1) {
					setDisplayContent(currentDisplayContent.slice(0, -1));
					setFormulaContent(getFormulaContent().slice(0, -1));
				} else {
					setDisplayContent('0');
					setFormulaContent(`${getFormulaContent().slice(0, -1)}0`);
				}
			}
		} else if (currentInput == 'C') {
			if (!num2_inputing) {
				// num2 input not started, do nothing
			} else {
				setDisplayContent('0');
				setFormulaContent(`${getFormulaContent().slice(0, -currentDisplayContent.length)}0`);
			}
		} else if (currentInput == 'AC') {
			num1 = undefined;
			operator = undefined;
			num2_inputing = false;
			setDisplayContent('0');
			setFormulaContent('0');
		} else if (currentInput == '=') {
			if (!num2_inputing) {
				// num2 input is not started, not ready to compute, do nothing
			} else {
				// finish num2 input, and compute
				num2 = parseFloat(currentDisplayContent);
				let result = operate(operator, num1, num2);

				if (!Number.isNaN(result)) { // operation success
					// display result, set state to the next round operation
					setDisplayContent(result);
					appendFormulaContent('=')
					num1 = result;
					operator = undefined;
					num2 = undefined;
					num2_inputing = false;
				} else if (operator == '/') { // handle divide 0 error
					// alert error message, and recover
					alert(DIVIDE_ZERO_ERROER_MSG);
					num2 = undefined;
				} else if (operator == '^') { // handle exponentiate error
					// alert error message, and recover
					alert(`The result of ${num1}^${num2} is not a real number!`);
					num2 = undefined;
				}
			}
		} else { // unsupport input
			// throw new Error;
		}
	} else { // never happen
		// throw new Error;
	}
}

let calculator = document.querySelector('#calculator');
calculator.addEventListener('click', e => {
	if (e.target.tagName != 'BUTTON') return;
	let currentInput = e.target.textContent;
	handleInput(currentInput);
});

document.addEventListener('keyup', e => {
	if (e.key == 'Backspace') {
		handleInput('←');
	} else if (e.key == 'Enter') {
		handleInput('=');
	} else if (e.key == 'Escape') {
		handleInput('AC');
	}
	else if ('+-*/^=.0123456789'.includes(e.key)) {
		handleInput(e.key);
	} else {
		// unsupported key, ignore
	}
});