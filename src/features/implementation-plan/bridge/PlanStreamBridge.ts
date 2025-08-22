// PlanStreamBridge.ts - Mediator for streaming plan content between Chatbox and ImplementationPlan

export interface ImplementationPlanHandlers {
  ingestExternalStart: (sourceId: string, suggestion: any) => void;
  ingestExternalChunk: (sourceId: string, chunk: string) => void;
  ingestExternalComplete: (sourceId: string, finalRaw: string) => void;
  ingestExternalError: (sourceId: string, message: string) => void;
}

export interface PlanStreamBridge {
  /**
   * Signal the start of a plan generation stream
   * @param sourceId Unique identifier for the conversation/stream source
   * @param suggestion The business suggestion being used to generate the plan
   */
  start(sourceId: string, suggestion: any): void;
  
  /**
   * Add a content chunk to the stream
   * @param sourceId Unique identifier for the conversation/stream source
   * @param chunk Text content chunk from the LLM
   */
  chunk(sourceId: string, chunk: string): void;
  
  /**
   * Signal completion of the plan generation stream
   * @param sourceId Unique identifier for the conversation/stream source
   * @param finalRaw The complete raw content from the LLM
   */
  complete(sourceId: string, finalRaw: string): void;
  
  /**
   * Signal an error in the plan generation stream
   * @param sourceId Unique identifier for the conversation/stream source
   * @param message Error message
   */
  error(sourceId: string, message: string): void;
  
  /**
   * Register implementation plan handlers
   * @param handlers The implementation plan handlers
   */
  registerImplementationPlanHandlers(handlers: ImplementationPlanHandlers): void;
  
  /**
   * Unregister implementation plan handlers
   */
  unregisterImplementationPlanHandlers(): void;
}

import { getPlanStreamBridgeInstance } from './PlanStreamBridgeImpl';

/**
 * Get the currently registered PlanStreamBridge implementation
 * @returns The bridge implementation
 */
export function getPlanStreamBridge(): PlanStreamBridge {
  return getPlanStreamBridgeInstance();
}
