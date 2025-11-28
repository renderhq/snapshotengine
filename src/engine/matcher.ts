import * as utils from './utils';
import { SnapshotNode, MatchResult } from './types';

export const matchSnapshotNode = (snapNode: SnapshotNode): MatchResult | null => {
  let bestMatch: HTMLElement | null = null;
  let bestScore = 0;
  let bestMethod = '';
  
  // Try exact key match first
  const byKey = document.querySelector(`[data-inspector-key="${snapNode.key}"]`) as HTMLElement;
  if (byKey) {
    return { element: byKey, confidence: 100, method: 'exact-key' };
  }
  
  // Try ID match
  if (snapNode.id) {
    const byId = document.getElementById(snapNode.id);
    if (byId && byId.tagName === snapNode.tag) {
      return { element: byId, confidence: 95, method: 'id' };
    }
  }
  
  // Multi-signal matching
  const candidates = document.querySelectorAll(snapNode.tag);
  
  candidates.forEach((el: Element) => {
    const htmlEl = el as HTMLElement;
    let score = 0;
    
    // Tag match (baseline)
    score += 20;
    
    // Class match
    if (snapNode.className && htmlEl.className === snapNode.className) {
      score += 30;
    }
    
    // Fiber ID match
    const fiberId = utils.getFiberId(htmlEl);
    if (fiberId && fiberId === snapNode.fiberId) {
      score += 25;
    }
    
    // Geometry match (within 10px tolerance)
    const rect = htmlEl.getBoundingClientRect();
    const currentSig = utils.rectSignature(rect);
    if (currentSig === snapNode.rect) {
      score += 15;
    }
    
    // Value similarity (for inputs)
    if (snapNode.value !== undefined && (el as HTMLInputElement).value !== undefined) {
      const inputEl = el as HTMLInputElement;
      const similarity = snapNode.value === inputEl.value ? 10 : 
                        snapNode.value.substring(0, 5) === inputEl.value.substring(0, 5) ? 5 : 0;
      score += similarity;
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = htmlEl;
      bestMethod = 'multi-signal';
    }
  });
  
  return bestMatch ? { 
    element: bestMatch, 
    confidence: bestScore, 
    method: bestMethod 
  } : null;
};
