// File: src/app/businessidea/tabs/financials/ai/financials-tooling.ts

import type { A1 } from '../types';

export type FinancialsSetOp = { type: 'set'; addr: A1; input: string };
export type FinancialsNoteOp = { type: 'note'; message: string };
export type FinancialsOps = FinancialsSetOp | FinancialsNoteOp;

export interface FinancialsToolCall {
  tool: 'financials.apply';
  ops: FinancialsOps[];
}

export function getFinancialsSystemPrompt(): string {
  return `
You have access to a financial spreadsheet tool that can help analyze and update financial data.

When responding to financial questions or when asked to update financial data, you can use the "financials.apply" tool.

The tool accepts the following operations:
1. { type: "set", addr: "A1", input: "=SUM(B1:B10)" } - Set a cell's formula or value
2. { type: "note", message: "Explanation of changes" } - Add a note about the changes

Example tool call:
{
  "tool": "financials.apply",
  "ops": [
    { "type": "set", "addr": "A1", "input": "Revenue" },
    { "type": "set", "addr": "B1", "input": "Expenses" },
    { "type": "set", "addr": "C1", "input": "Profit" },
    { "type": "set", "addr": "A2", "input": "1000" },
    { "type": "set", "addr": "B2", "input": "600" },
    { "type": "set", "addr": "C2", "input": "=A2-B2" },
    { "type": "note", "message": "Created a simple profit calculation" }
  ]
}

Please only use this tool when specifically asked to update financial data or when it would be helpful to demonstrate financial concepts with actual calculations.

When using cell references, use standard A1 notation (e.g., A1, B2, AA10).
For formulas, start with an equals sign (=) followed by the formula.

Only use functions that are supported: SUM, AVERAGE.

For ranges, use colon notation (e.g., A1:B10).

Keep financial models simple and clear. Add notes to explain complex calculations.
`;
}

export function parseToolCalls(messages: Array<{ type: string; content: string }>): FinancialsToolCall[] {
  const toolCalls: FinancialsToolCall[] = [];
  
  // Look through all messages for tool calls
  for (const message of messages) {
    if (message.type !== 'assistant') continue;
    
    try {
      // Try to parse the entire content as JSON first
      const parsed = JSON.parse(message.content);
      if (isValidFinancialsToolCall(parsed)) {
        toolCalls.push(parsed);
      }
      continue;
    } catch (e) {
      // Not a single JSON object, continue to check for embedded JSON
    }
    
    // Look for JSON objects embedded in the content
    const jsonRegex = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
    let match;
    
    while ((match = jsonRegex.exec(message.content)) !== null) {
      try {
        const parsed = JSON.parse(match[0]);
        if (isValidFinancialsToolCall(parsed)) {
          toolCalls.push(parsed);
        }
      } catch (e) {
        // Not a valid JSON object, continue
      }
    }
  }
  
  return toolCalls;
}

function isValidFinancialsToolCall(obj: any): obj is FinancialsToolCall {
  if (!obj || typeof obj !== 'object') return false;
  if (obj.tool !== 'financials.apply') return false;
  if (!Array.isArray(obj.ops)) return false;
  
  // Validate each operation
  for (const op of obj.ops) {
    if (!op || typeof op !== 'object') return false;
    
    if (op.type === 'set') {
      if (typeof op.addr !== 'string') return false;
      if (typeof op.input !== 'string') return false;
      // Basic A1 validation
      if (!/^[A-Z]{1,3}\d{1,4}$/.test(op.addr)) return false;
    } else if (op.type === 'note') {
      if (typeof op.message !== 'string') return false;
    } else {
      return false; // Unknown operation type
    }
  }
  
  return true;
}

export function applyToolCalls(
  calls: FinancialsToolCall[],
  apply: (addr: A1, input: string) => void
): { applied: number; notes: string[] } {
  let applied = 0;
  const notes: string[] = [];
  
  for (const call of calls) {
    if (call.tool !== 'financials.apply') continue;
    
    for (const op of call.ops) {
      if (op.type === 'set') {
        try {
          apply(op.addr, op.input);
          applied++;
        } catch (error) {
          console.error(`Error applying tool call to ${op.addr}:`, error);
        }
      } else if (op.type === 'note') {
        notes.push(op.message);
      }
    }
  }
  
  return { applied, notes };
}
