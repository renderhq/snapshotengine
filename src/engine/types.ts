export interface Todo {
  id: number;
  text: string;
  done: boolean;
}

export interface LogEntry {
  message: string;
  type: string;
  time: number;
}

export interface CaretPosition {
  start: number;
  end: number;
  startPath?: number[];
  endPath?: number[];
}

export interface SnapshotNode {
  key: string;
  tag: string;
  id: string | null;
  className: string | null;
  rect: string;
  fiberId: string | null;
  scrollTop: number;
  scrollLeft: number;
  value?: string;
  checked?: boolean;
  selectedIndex?: number;
  innerHTML?: string;
  caret?: CaretPosition;
  dataState?: string;
}

export interface SnapshotData {
  time: number;
  nodes: SnapshotNode[];
  ops: any[];
}

export interface MatchResult {
  element: HTMLElement;
  confidence: number;
  method: string;
}
