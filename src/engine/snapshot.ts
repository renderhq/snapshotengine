import * as utils from './utils';
import { SnapshotNode } from './types';

export const takeSnapshot = () => {
  const nodes: SnapshotNode[] = [];
  const interactiveSelectors = [
    'input:not([type="hidden"])',
    'textarea',
    'select',
    '[contenteditable="true"]',
    '[data-inspector-tracked]',
    'button[data-state]',
    '.scrollable'
  ];
  
  const elements = document.querySelectorAll(interactiveSelectors.join(','));
  
  elements.forEach((el: Element) => {
    const htmlEl = el as HTMLElement;
    if (!htmlEl.dataset.inspectorKey) {
      htmlEl.dataset.inspectorKey = utils.generateKey();
    }
    
    const rect = htmlEl.getBoundingClientRect();
    const nodeSnap: any = {
      key: htmlEl.dataset.inspectorKey,
      tag: htmlEl.tagName,
      id: htmlEl.id || null,
      className: htmlEl.className || null,
      rect: utils.rectSignature(rect),
      fiberId: utils.getFiberId(htmlEl),
      scrollTop: (htmlEl as any).scrollTop || 0,
      scrollLeft: (htmlEl as any).scrollLeft || 0
    };
    
    if (htmlEl.tagName === 'INPUT') {
      const inputEl = htmlEl as HTMLInputElement;
      nodeSnap.value = inputEl.value;
      if (inputEl.type === 'checkbox' || inputEl.type === 'radio') {
        nodeSnap.checked = inputEl.checked;
      }
      nodeSnap.caret = utils.getCaret(htmlEl);
    } else if (htmlEl.tagName === 'TEXTAREA') {
      const textareaEl = htmlEl as HTMLTextAreaElement;
      nodeSnap.value = textareaEl.value;
      nodeSnap.caret = utils.getCaret(htmlEl);
    } else if (htmlEl.tagName === 'SELECT') {
      const selectEl = htmlEl as HTMLSelectElement;
      nodeSnap.selectedIndex = selectEl.selectedIndex;
      nodeSnap.value = selectEl.value;
    } else if (htmlEl.isContentEditable) {
      nodeSnap.innerHTML = htmlEl.innerHTML;
      nodeSnap.caret = utils.getCaret(htmlEl);
    } else if (htmlEl.dataset.state) {
      nodeSnap.dataState = htmlEl.dataset.state;
    }
    
    nodes.push(nodeSnap);
  });
  
  return {
    time: Date.now(),
    nodes,
    ops: []
  };
};
