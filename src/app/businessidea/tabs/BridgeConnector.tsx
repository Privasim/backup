'use client';

import { useEffect } from 'react';
import { useChatbox } from '@/components/chatbox/ChatboxProvider';
import { useImplementationPlanContext } from '@/features/implementation-plan/ImplementationPlanProvider';
import { getPlanStreamBridge } from '@/features/implementation-plan/bridge/PlanStreamBridge';

export function BridgeConnector() {
  const { setPlanStreamBridge } = useChatbox();
  const implementationPlanContext = useImplementationPlanContext();
  
  useEffect(() => {
    // Get the singleton bridge instance
    const bridge = getPlanStreamBridge();
    
    // Register the implementation plan context methods with the bridge
    bridge.registerImplementationPlanHandlers({
      ingestExternalStart: implementationPlanContext.ingestExternalStart,
      ingestExternalChunk: implementationPlanContext.ingestExternalChunk,
      ingestExternalComplete: implementationPlanContext.ingestExternalComplete,
      ingestExternalError: implementationPlanContext.ingestExternalError,
    });
    
    // Set the bridge in the chatbox context
    setPlanStreamBridge(bridge);
    
    // Cleanup
    return () => {
      bridge.unregisterImplementationPlanHandlers();
      setPlanStreamBridge(null);
    };
  }, [setPlanStreamBridge, implementationPlanContext]);
  
  return null; // This component doesn't render anything
}

export default BridgeConnector;
