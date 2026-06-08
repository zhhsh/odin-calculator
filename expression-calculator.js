

const UNARY_PLUS = 'u+', UNARY_MINUS = 'u-';

const OPERATOR_PRECEDENCE = {
	[UNARY_PLUS]: 3,
	[UNARY_MINUS]: 3,
	'*': 2,
	'/': 2,
	'+': 1,
	'-': 1,
}

// element type
const NUMBER = 0, UNARY_OPERATOR = 1, BINARY_OPERATOR = 2, PARENTHESIS = 3;

const ops = {
	'+': add,
	'-': subtract,
	'*': multiply,
	'/': divide,
}

const EXPRESSION_ERROR_MSG = ' ExpressionError!';


const unaryOps = {
	[UNARY_PLUS]: positive,
	[UNARY_MINUS]: negtive,
}

let duringCalculation = false;


function add(a, b) {
	return a + b;
}
function subtract(a, b) {
	return a - b;
}
function multiply(a, b) {
	return a * b;
}
function divide(a, b) {
	return a / b;
}

function binaryOperate(op, num1, num2) {
	if (op in ops) {
		return ops[op](num1, num2);
	} else {
		return undefined;
	}
}

function positive(a) {
	return a;
}

function negtive(a) {
	return -a;
}

function unaryOperate(op, num) {
	if (op in unaryOps) {
		return unaryOps[op](num);
	} else {
		return undefined;
	}
}

// reset Calculator
function reset() {
	document.querySelector('#display').textContent = '';
}

// append an char at the tail of the experssion on display
function append(ch) {
	let display = document.querySelector('#display');
	if (display.textContent.endsWith(EXPRESSION_ERROR_MSG)) {
		display.textContent = display.textContent.slice(0, -EXPRESSION_ERROR_MSG.length) + ch;
	} else {
		display.textContent += ch;
	}
	display.scrollLeft = display.scrollWidth - display.clientWidth;
}

// remove the tail char of the experssion on display if exists
function backspace() {
	let display = document.querySelector('#display');
	if (display.textContent != '') {
		if (display.textContent.endsWith(EXPRESSION_ERROR_MSG)) {
			display.textContent = display.textContent.slice(0, -EXPRESSION_ERROR_MSG.length);
		} else {
			display.textContent = display.textContent.slice(0, -1);
		}
	}
}

// 低到高
function calculateExpression(expr) {
	let exprElements = splitExpression(expr);
	let prevElementType;
	let num_stack = [], op_stack = [];
	for (let exprElement of exprElements) {
		let elementType = getElementType(exprElement);

		// Element type validation, UNARY_OPERATPR and PARENTHESIS is ignored
		// the correct seqence type must be: num, (biops, num), ...
		if (elementType == NUMBER) {
			if (prevElementType == NUMBER) {
				return undefined;
			} else {
				prevElementType = NUMBER;
			}
		} else if (elementType == BINARY_OPERATOR) {
			if (prevElementType == undefined || prevElementType == BINARY_OPERATOR) {
				return undefined;
			} else {
				prevElementType = BINARY_OPERATOR;
			}
		}

		switch (exprElement) {
			case '(':
				op_stack.push('(');
				break;
			case ')':
				while (true) {
					if (op_stack.length == 0) return undefined;
					let op = op_stack.pop();
					if (op == '(') {
						break;
					} else if (op == UNARY_PLUS || op == UNARY_MINUS) {
						if (num_stack.length < 1) return undefined;
						let num = num_stack.pop();
						let result = unaryOperate(op, num);
						num_stack.push(result);
					} else {
						if (num_stack.length < 2) return undefined;
						let num2 = num_stack.pop();
						let num1 = num_stack.pop();
						let result = binaryOperate(op, num1, num2);
						num_stack.push(result);
					}
				}
				break;
			case UNARY_PLUS:
			case UNARY_MINUS:
				// just push in the op_stack due to unary operator is the highest precedence
				op_stack.push(exprElement);
				break;
			case '+':
			case '-':
			case '*':
			case '/':
				// pop out the higher precedence operator in op_stack and calculate
				while (op_stack.length > 0 && op_stack.at(-1) != '('
					&& comparePrecedence(exprElement, op_stack.at(-1)) <= 0) {
					let op = op_stack.pop();
					if (op == UNARY_PLUS || op == UNARY_MINUS) {
						if (num_stack.length < 1) return undefined;
						let num = num_stack.pop();
						let result = unaryOperate(op, num);
						num_stack.push(result);
					} else {
						if (num_stack.length < 2) return undefined;
						let num2 = num_stack.pop();
						let num1 = num_stack.pop();
						let result = binaryOperate(op, num1, num2);
						num_stack.push(result);
					}
				}
				op_stack.push(exprElement);
				break;
			default: // case for number
				num_stack.push(parseFloat(exprElement));
				break;
		}
	}
	while (op_stack.length > 0) {
		let op = op_stack.pop();
		if (op == UNARY_PLUS || op == UNARY_MINUS) {
			if (num_stack.length < 1) return undefined;
			let num = num_stack.pop();
			let result = unaryOperate(op, num);
			num_stack.push(result);
		} else {
			if (num_stack.length < 2) return undefined;
			let num2 = num_stack.pop();
			let num1 = num_stack.pop();
			let result = binaryOperate(op, num1, num2);
			num_stack.push(result);
		}
	}
	return (num_stack.length == 1) ? num_stack.pop() : undefined;
}

document.querySelector('#calculator').addEventListener('click', e => {
	if (e.target.tagName != 'BUTTON') return;
	switch (e.target.textContent) {
		case '=':
			let expr = document.querySelector('#display').textContent;
			let result = calculateExpression(expr);
			if (result === undefined) {
				document.querySelector('#display').textContent += EXPRESSION_ERROR_MSG;
			} else {
				document.querySelector('#display').textContent += ` = ${result}`;
				duringCalculation = false;
				// document.querySelector('#display').innerHTML = `${expr}<br>${result}`;
				// document.querySelector('#display').style.fontSize = '5px';
			}
			break;
		case 'AC':
			reset();
			duringCalculation = false;
			break;
		case 'C':
			backspace();
			break;
		default:
			if (!duringCalculation) {
				reset();
				duringCalculation = true;
			}
			append(e.target.textContent);
	}
});



function comparePrecedence(op1, op2) {
	return OPERATOR_PRECEDENCE[op1] - OPERATOR_PRECEDENCE[op2];
}

function getElementType(exprElement) {
	if (exprElement == UNARY_PLUS || exprElement == UNARY_MINUS) {
		return UNARY_OPERATOR;
	} else if ('+-*/'.includes(exprElement)) {
		return BINARY_OPERATOR;
	} else if (exprElement == '(' || exprElement == ')') {
		return PARENTHESIS;
	} else {
		return NUMBER;
	}
}

// split expression to a sequence of number, operator and parenthesis
function splitExpression(expr) {
	let exprElements = [];
	let i = 0;
	while (i < expr.length) {
		switch (expr[i]) {
			case '*':
			case '/':
			case '(':
			case ')':
				exprElements.push(expr[i]);
				i++;
				break;
			case '+':
			case '-':
				// distinguish unary from binary
				if (i == 0 || '+-*/('.includes(expr[i - 1])) { // unary
					exprElements.push((expr[i] == '+') ? UNARY_PLUS : UNARY_MINUS);
				} else { // binary
					exprElements.push(expr[i]);
				}
				i++;
				break;
			default: // case for number and decimal point
				let j = i + 1;
				while (j < expr.length && '.0123456789'.includes(expr[j])) j++;
				exprElements.push(expr.slice(i, j));
				i = j;
		}
	}
	return exprElements;
}

// test calculateExpression
console.log(calculateExpression('1+2*3-3+3.4'));
console.log(calculateExpression('2+-2'));
console.log(calculateExpression('(-2)'));
console.log(calculateExpression('3+(2+3)*3.45-2.3'));
console.log(calculateExpression('5*-3-1'));
console.log(calculateExpression('3+(2+3)*-3.45-2.3'));
console.log(calculateExpression('++--3'));
console.log(calculateExpression('++--3+-+-+-++-5-+-+(33+3)'));
console.log(calculateExpression('5*-(33+3)'));
console.log(calculateExpression('5*(-(33+3))'));
console.log(calculateExpression('3+(2+3)*3.45-2.3'));
console.log(calculateExpression('5(-(33+3))')); // unsupportted case: mutiply shorthand 