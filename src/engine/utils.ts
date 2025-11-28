import { CaretPosition } from './types';

export const generateKey = () => `ins-${Math.random().toString(36).substr(2, 9)}`;

export const rectSignature = (rect: DOMRect) => {
  if (!rect) return 'no-rect';
  return `${Math.round(rect.left)}:${Math.round(rect.top)}:${Math.round(rect.width)}:${Math.round(rect.height)}`;
};

export const smallHash = (str: string) => {
  if (!str) return '0';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

export const getCaret = (el: HTMLElement) => {
  if (!el) return null;
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
    const input = el as HTMLInputElement | HTMLTextAreaElement;
    return {
      start: input.selectionStart ?? 0,
      end: input.selectionEnd ?? 0
    };
  }
  if (el.isContentEditable) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);
    return {
      start: range.startOffset,
      end: range.endOffset,
      startPath: getNodePath(range.startContainer, el),
      endPath: getNodePath(range.endContainer, el)
    };
  }
  return null;
};

export const setCaret = (el: HTMLElement, caret: CaretPosition) => {
  if (!el || !caret) return false;
  try {
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      const input = el as HTMLInputElement | HTMLTextAreaElement;
      input.setSelectionRange(caret.start, caret.end);
      return true;
    }
    if (el.isContentEditable && caret.startPath) {
      const sel = window.getSelection();
      if (!sel) return false;
      
      const range = document.createRange();
      const startNode = getNodeByPath(el, caret.startPath);
      const endNode = caret.endPath ? getNodeByPath(el, caret.endPath) : startNode;
      
      if (startNode && endNode) {
        const startOffset = Math.min(caret.start, startNode.textContent?.length || 0);
        const endOffset = caret.end !== undefined 
          ? Math.min(caret.end, endNode.textContent?.length || 0)
          : startOffset;
          
        range.setStart(startNode, startOffset);
        range.setEnd(endNode, endOffset);
        
        sel.removeAllRanges();
        sel.addRange(range);
        return true;
      }
    }
  } catch (e) {
    console.warn('Caret restore failed:', e);
  }
  return false;
};

export const getNodePath = (node: Node, root: Node): number[] => {
  const path: number[] = [];
  let current: Node | null = node;
  
  while (current && current !== root) {
    const parent = current.parentNode as Node & ParentNode | null;
    if (!parent) break;
    
    const children = Array.from(parent.childNodes);
    const index = children.findIndex(child => child === current);
    if (index === -1) break;
    
    path.unshift(index);
    current = parent;
  }
  
  return path;
};

export const getNodeByPath = (root: Node, path: number[]) => {
  let current: Node | null = root;
  for (const index of path) {
    if (!current.childNodes[index]) return null;
    current = current.childNodes[index];
  }
  return current;
};

export const getFiberId = (el: HTMLElement) => {
  const key = Object.keys(el).find(k => k.startsWith('__reactFiber'));
  if (!key) return null;
  const fiber = (el as any)[key];
  return fiber ? `fiber-${smallHash(fiber.type?.name || 'unknown')}` : null;
};
