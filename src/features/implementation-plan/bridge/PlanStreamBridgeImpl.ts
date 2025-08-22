// PlanStreamBridgeImpl.ts - Concrete implementation of PlanStreamBridge

import { PlanStreamBridge, ImplementationPlanHandlers } from './PlanStreamBridge';

export class PlanStreamBridgeImpl implements PlanStreamBridge {
  private implementationPlanHandlers: ImplementationPlanHandlers | null = null;
  
  start(sourceId: string, suggestion: any): void {
    if (this.implementationPlanHandlers) {
      this.implementationPlanHandlers.ingestExternalStart(sourceId, suggestion);
    }
  }
  
  chunk(sourceId: string, chunk: string): void {
    if (this.implementationPlanHandlers) {
      this.implementationPlanHandlers.ingestExternalChunk(sourceId, chunk);
    }
  }
  
  complete(sourceId: string, finalRaw: string): void {
    if (this.implementationPlanHandlers) {
      this.implementationPlanHandlers.ingestExternalComplete(sourceId, finalRaw);
    }
  }
  
  error(sourceId: string, message: string): void {
    if (this.implementationPlanHandlers) {
      this.implementationPlanHandlers.ingestExternalError(sourceId, message);
    }
  }
  
  registerImplementationPlanHandlers(handlers: ImplementationPlanHandlers): void {
    this.implementationPlanHandlers = handlers;
  }
  
  unregisterImplementationPlanHandlers(): void {
    this.implementationPlanHandlers = null;
  }
}

// Singleton instance for the bridge
let planStreamBridgeInstance: PlanStreamBridgeImpl | null = null;

/**
 * Get the singleton instance of PlanStreamBridgeImpl
 * @returns The singleton instance
 */
export function getPlanStreamBridgeInstance(): PlanStreamBridgeImpl {
  if (!planStreamBridgeInstance) {
    planStreamBridgeInstance = new PlanStreamBridgeImpl();
  }
  return planStreamBridgeInstance;
}
