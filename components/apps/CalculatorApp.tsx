"use client";
import React, { useState } from 'react';

const calculate = (expression: string): string => {
    try {
        // Basic sanitization: Allow numbers, operators, parenthesis, dot
        const sanitizedExpression = expression.replace(/[^0-9+\-*/().]/g, '');
        if (!sanitizedExpression) return "0";
        
        const result = evaluateExpression(sanitizedExpression);
        
        // Handle potential issues like division by zero or invalid results
        if (result === Infinity || result === -Infinity || isNaN(result)) {
            return "Error";
        }
        return String(result);
    } catch (error) {
        console.error("Calculator Error:", error);
        return "Error";
    }
};

// Tokenize expression into numbers and operators
const tokenize = (expression: string): string[] => {
    const tokens: string[] = [];
    let currentNumber = '';
    
    for (let i = 0; i < expression.length; i++) {
        const char = expression[i];
        
        if ('0123456789.'.includes(char)) {
            currentNumber += char;
        } else {
            // Push number token if we have one
            if (currentNumber) {
                tokens.push(currentNumber);
                currentNumber = '';
            }
            
            // Handle negative numbers
            if (char === '-' && (i === 0 || '(+*/'.includes(expression[i - 1]))) {
                currentNumber = '-';
            } else if ('+-*/()'.includes(char)) {
                tokens.push(char);
            }
        }
    }
    
    // Push final number if exists
    if (currentNumber) {
        tokens.push(currentNumber);
    }
    
    return tokens;
};

// Check if token is an operator
const isOperator = (token: string): boolean => {
    return ['+', '-', '*', '/'].includes(token);
};

// Get operator precedence
const getPrecedence = (operator: string): number => {
    if (operator === '+' || operator === '-') return 1;
    if (operator === '*' || operator === '/') return 2;
    return 0;
};

// Apply operator to operands
const applyOperator = (operator: string, b: number, a: number): number => {
    switch (operator) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return a / b;
        default: throw new Error('Invalid operator');
    }
};

// Convert infix expression to postfix (Reverse Polish Notation)
const infixToPostfix = (tokens: string[]): string[] => {
    const output: string[] = [];
    const operators: string[] = [];
    
    for (const token of tokens) {
        // Number
        if (!isOperator(token) && token !== '(' && token !== ')') {
            output.push(token);
        }
        // Opening parenthesis
        else if (token === '(') {
            operators.push(token);
        }
        // Closing parenthesis
        else if (token === ')') {
            while (operators.length > 0 && operators[operators.length - 1] !== '(') {
                output.push(operators.pop()!);
            }
            // Remove the opening parenthesis
            operators.pop();
        }
        // Operator
        else {
            while (
                operators.length > 0 && 
                operators[operators.length - 1] !== '(' &&
                getPrecedence(operators[operators.length - 1]) >= getPrecedence(token)
            ) {
                output.push(operators.pop()!);
            }
            operators.push(token);
        }
    }
    
    // Add remaining operators to output
    while (operators.length > 0) {
        output.push(operators.pop()!);
    }
    
    return output;
};

// Evaluate postfix expression
const evaluatePostfix = (tokens: string[]): number => {
    const stack: number[] = [];
    
    for (const token of tokens) {
        if (isOperator(token)) {
            if (stack.length < 2) throw new Error('Invalid expression');
            const b = stack.pop()!;
            const a = stack.pop()!;
            stack.push(applyOperator(token, b, a));
        } else {
            stack.push(parseFloat(token));
        }
    }
    
    if (stack.length !== 1) throw new Error('Invalid expression');
    return stack[0];
};

// Main expression evaluation function
const evaluateExpression = (expression: string): number => {
    const tokens = tokenize(expression);
    const postfix = infixToPostfix(tokens);
    return evaluatePostfix(postfix);
};

const CalculatorApp: React.FC = () => {
  const [displayValue, setDisplayValue] = useState("0");
  const [expression, setExpression] = useState(""); // Store the full expression

   const handleInput = (input: string) => {
       if (displayValue === "Error") {
           setExpression(input);
           setDisplayValue(input);
           return;
       }

       if (input === 'C') {
           setDisplayValue("0");
           setExpression("");
       } else if (input === '=') {
           const result = calculate(expression);
           setDisplayValue(result);
           setExpression(result === "Error" ? "" : result); // Reset expression or set to result
       } else if (['+', '-', '*', '/'].includes(input)) {
           // Append operator, ensuring not to double up (simple check)
           if (expression && !['+', '-', '*', '/'].includes(expression.slice(-1))) {
               setExpression(prev => prev + input);
               setDisplayValue(input); // Show the operator briefly
           } else if (!expression && input === '-') { // Allow starting with negative
               setExpression(input);
               setDisplayValue(input);
           }
       } else { // Digit or decimal point
           if (displayValue === "0" || ['+', '-', '*', '/'].includes(displayValue)) {
               // If display is 0 or an operator, replace it with the new digit
               setDisplayValue(input);
               setExpression(prev => prev + input);
           } else {
               // Append digit/decimal to current number shown
               setDisplayValue(prev => prev + input);
                setExpression(prev => prev + input);
           }
       }
   };

   const buttons = [
       'C', '(', ')', '/',
       '7', '8', '9', '*',
       '4', '5', '6', '-',
       '1', '2', '3', '+',
       '0', '.', '='
   ];

  return (
    <div className="w-full h-full bg-gray-800 text-white p-2 flex flex-col">
      {/* Display */}
      <input
        type="text"
        value={displayValue}
        readOnly
        className="w-full h-12 bg-gray-900 text-right text-2xl px-3 mb-2 rounded border border-gray-700 font-mono"
        aria-label="Calculator Display"
      />

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-1 flex-grow">
        {buttons.map((btn) => (
          <button
            key={btn}
            onClick={() => handleInput(btn)}
            className={`
              ${btn === '=' ? 'col-span-1' : ''}
              ${btn === '0' ? 'col-span-2' : ''}
              ${['+', '-', '*', '/', '='].includes(btn) ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-600 hover:bg-gray-700'}
              ${btn === 'C' ? 'bg-red-500 hover:bg-red-600' : ''}
              text-white text-lg font-semibold rounded flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white
            `}
          >
            {btn}
          </button>
        ))}
          {/* Handle the zero button spanning 2 cols requires slight adjustment if using map index */}
          {/* The styling approach above handles '0' spanning via class, assuming grid places it correctly */}
      </div>
    </div>
  );
};

export default CalculatorApp;