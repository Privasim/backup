// File: src/app/businessidea/tabs/financials/utils/formula.ts

import type { EvalContext } from '../types';
import { fromA1, expandRange } from './address';

// Token types
type Token = 
  | { type: 'number'; value: number }
  | { type: 'operator'; value: '+' | '-' | '*' | '/' | '(' | ')' }
  | { type: 'function'; value: 'SUM' | 'AVERAGE' }
  | { type: 'range'; value: string }
  | { type: 'a1'; value: string }
  | { type: 'comma' }
  | { type: 'eof' };

export function evaluateFormula(input: string, ctx: EvalContext): number {
  if (!input.startsWith('=')) {
    const num = parseFloat(input);
    if (isNaN(num)) throw new Error('Invalid number');
    return num;
  }

  const expression = input.substring(1);
  const tokens = tokenize(expression);
  const rpn = shuntingYard(tokens);
  return evaluateRPN(rpn, ctx);
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  
  while (i < input.length) {
    const char = input[i];
    
    // Skip whitespace
    if (char === ' ' || char === '\t') {
      i++;
      continue;
    }
    
    // Numbers
    if (/\d/.test(char) || char === '.') {
      let numStr = '';
      while (i < input.length && (/\d/.test(input[i]) || input[i] === '.')) {
        numStr += input[i];
        i++;
      }
      const num = parseFloat(numStr);
      if (isNaN(num)) throw new Error(`Invalid number: ${numStr}`);
      tokens.push({ type: 'number', value: num });
      continue;
    }
    
    // Operators
    if (['+', '-', '*', '/', '(', ')'].includes(char)) {
      tokens.push({ type: 'operator', value: char as any });
      i++;
      continue;
    }
    
    // Comma
    if (char === ',') {
      tokens.push({ type: 'comma' });
      i++;
      continue;
    }
    
    // Functions and cell references
    if (/[A-Z]/.test(char)) {
      let word = '';
      while (i < input.length && /[A-Z0-9:.]/.test(input[i])) {
        word += input[i];
        i++;
      }
      
      // Check if it's a function
      if (word === 'SUM' || word === 'AVERAGE') {
        tokens.push({ type: 'function', value: word });
        continue;
      }
      
      // Check if it's a range (contains colon)
      if (word.includes(':')) {
        // Validate range format
        const parts = word.split(':');
        if (parts.length === 2) {
          try {
            fromA1(parts[0]);
            fromA1(parts[1]);
            tokens.push({ type: 'range', value: word });
            continue;
          } catch (e) {
            // Not a valid range, treat as A1 reference
          }
        }
      }
      
      // Check if it's a cell reference
      try {
        fromA1(word);
        tokens.push({ type: 'a1', value: word });
        continue;
      } catch (e) {
        // Not a valid cell reference
      }
      
      throw new Error(`Unknown token: ${word}`);
    }
    
    throw new Error(`Unknown character: ${char}`);
  }
  
  tokens.push({ type: 'eof' });
  return tokens;
}

function shuntingYard(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const operators: Token[] = [];
  
  const precedence = (op: string) => {
    switch (op) {
      case '+':
      case '-': return 1;
      case '*':
      case '/': return 2;
      default: return 0;
    }
  };
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    
    switch (token.type) {
      case 'number':
      case 'a1':
      case 'range':
        output.push(token);
        break;
        
      case 'function':
        operators.push(token);
        break;
        
      case 'comma':
        while (operators.length > 0 && operators[operators.length - 1].type !== 'operator' && 
               (operators[operators.length - 1] as any).value !== '(') {
          output.push(operators.pop()!);
        }
        if (operators.length === 0) throw new Error('Misplaced comma');
        break;
        
      case 'operator':
        if (token.value === '(') {
          operators.push(token);
        } else if (token.value === ')') {
          while (operators.length > 0 && operators[operators.length - 1].type !== 'operator' && 
                 (operators[operators.length - 1] as any).value !== '(') {
            output.push(operators.pop()!);
          }
          if (operators.length === 0) throw new Error('Mismatched parentheses');
          operators.pop(); // Remove the '('
          
          // If the token at the top of the operator stack is a function token, pop it onto the output queue
          if (operators.length > 0 && operators[operators.length - 1].type === 'function') {
            output.push(operators.pop()!);
          }
        } else {
          while (operators.length > 0 && 
                 operators[operators.length - 1].type === 'operator' &&
                 (operators[operators.length - 1] as any).value !== '(' &&
                 precedence((operators[operators.length - 1] as any).value) >= precedence((token as any).value)) {
            output.push(operators.pop()!);
          }
          operators.push(token as any);
        }
        break;
        
      case 'eof':
        while (operators.length > 0) {
          const op = operators.pop()!;
          if (op.type === 'operator' && ((op as any).value === '(' || (op as any).value === ')')) {
            throw new Error('Mismatched parentheses');
          }
          output.push(op);
        }
        break;
    }
  }
  
  return output;
}

function evaluateRPN(tokens: Token[], ctx: EvalContext): number {
  const stack: number[] = [];
  
  for (const token of tokens) {
    switch (token.type) {
      case 'number':
        stack.push(token.value);
        break;
        
      case 'a1':
        const cellValue = ctx.getCellValue((token as any).value);
        stack.push(typeof cellValue === 'number' ? cellValue : 0);
        break;
        
      case 'range':
        const rangeValues = ctx.getRangeValues((token as any).value);
        // For ranges in RPN, we need to handle them appropriately
        // We'll push the array directly and let the function handlers deal with it
        stack.push(rangeValues as any);
        break;
        
      case 'operator':
        if (stack.length < 2) throw new Error(`Not enough operands for operator ${(token as any).value}`);
        const b = stack.pop()!;
        const a = stack.pop()!;
        
        switch ((token as any).value) {
          case '+': stack.push(a + b); break;
          case '-': stack.push(a - b); break;
          case '*': stack.push(a * b); break;
          case '/': 
            if (b === 0) throw new Error('Division by zero');
            stack.push(a / b); 
            break;
          default:
            throw new Error(`Unknown operator: ${(token as any).value}`);
        }
        break;
        
      case 'function':
        if (stack.length < 1) throw new Error(`Not enough arguments for function ${(token as any).value}`);
        
        const args = stack.pop()!;
        
        switch ((token as any).value) {
          case 'SUM':
            if (Array.isArray(args)) {
              stack.push(args.reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0));
            } else {
              stack.push(typeof args === 'number' ? args : 0);
            }
            break;
          case 'AVERAGE':
            if (Array.isArray(args)) {
              const validNumbers = args.filter(val => typeof val === 'number') as number[];
              stack.push(validNumbers.length > 0 ? validNumbers.reduce((sum, val) => sum + val, 0) / validNumbers.length : 0);
            } else {
              stack.push(typeof args === 'number' ? args : 0);
            }
            break;
          default:
            throw new Error(`Unknown function: ${(token as any).value}`);
        }
        break;
        
      case 'eof':
        break;
        
      default:
        throw new Error(`Unknown token type: ${(token as any).type}`);
    }
  }
  
  if (stack.length !== 1) throw new Error('Invalid expression');
  return stack[0];
}
