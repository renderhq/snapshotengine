import * as utils from './utils';
import { matchSnapshotNode } from './matcher';
import { SnapshotNode } from './types';

type RestoreResult = {
  restored: number;
  failed: number;
};

export const restoreSnapshot = (
  snapshotData: { nodes: SnapshotNode[] } | null,
  onLog?: (message: string, type: string) => void
): RestoreResult => {
  if (!snapshotData || !snapshotData.nodes) {
    onLog?.('❌ No snapshot data to restore', 'error');
    return { restored: 0, failed: 0 };
  }
  
  let restored = 0;
  let failed = 0;
  
  // Wait for DOM to be ready
  setTimeout(() => {
    snapshotData.nodes.forEach((snapNode: SnapshotNode) => {
      const match = matchSnapshotNode(snapNode);
      
      if (!match) {
        failed++;
        onLog?.(`❌ No match for ${snapNode.tag}${snapNode.id ? `#${snapNode.id}` : ''}`, 'error');
        return;
      }
      
      const { element: el, confidence, method } = match;
      
      if (confidence < 50) {
        failed++;
        onLog?.(`⚠️ Low confidence (${confidence}%) for ${snapNode.tag}`, 'warn');
        return;
      }
      
      // Restore based on element type
      try {
        // Restore input/textarea values
        if (snapNode.value !== undefined && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
          (el as HTMLInputElement).value = snapNode.value;
        }
        
        // Restore checkbox/radio state
        if (snapNode.checked !== undefined && el.tagName === 'INPUT') {
          (el as HTMLInputElement).checked = snapNode.checked;
        }
        
        // Restore select element
        if (snapNode.selectedIndex !== undefined && el.tagName === 'SELECT') {
          (el as HTMLSelectElement).selectedIndex = snapNode.selectedIndex;
        }
        
        // Restore contentEditable content
        if (snapNode.innerHTML !== undefined && el.isContentEditable) {
          el.innerHTML = snapNode.innerHTML;
        }
        
        // Restore scroll position
        if (snapNode.scrollTop !== undefined) {
          (el as HTMLElement).scrollTop = snapNode.scrollTop;
        }
        
        if (snapNode.scrollLeft !== undefined) {
          (el as HTMLElement).scrollLeft = snapNode.scrollLeft;
        }
        
        // Restore cursor position
        if (snapNode.caret) {
          // Small delay to ensure content is rendered before setting caret
          setTimeout(() => utils.setCaret(el, snapNode.caret!), 50);
        }
        
        // Restore data-state
        if (snapNode.dataState !== undefined) {
          el.dataset.state = snapNode.dataState;
        }
        
        // Re-assign key for future snapshots
        if (snapNode.key) {
          el.dataset.inspectorKey = snapNode.key;
        }
        
        restored++;
        onLog?.(`✅ Restored ${snapNode.tag} (${confidence}% via ${method})`, 'success');
      } catch (e: any) {
        failed++;
        onLog?.(`❌ Restore failed for ${snapNode.tag}: ${e.message}`, 'error');
      }
    });
    
    onLog?.(`\n📊 Summary: ${restored} restored, ${failed} failed`, 'info');
  }, 100);
  
  return { restored, failed };
};
