import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { 
  Todo, 
  LogEntry,
  takeSnapshot, 
  restoreSnapshot, 
  saveSnapshot, 
  loadSnapshot 
} from './engine';

const DemoApp = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showJSON, setShowJSON] = useState(false);
  const [snapshotData, setSnapshotData] = useState<any>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [todoText, setTodoText] = useState('');
  const [todos, setTodos] = useState<Todo[]>([]);
  
  const addLog = (message: string, type: string = 'info') => {
    setLogs(prev => [...prev, { message, type, time: Date.now() }]);
  };
  
  useEffect(() => {
    const saved = loadSnapshot();
    if (saved) {
      setIsRestoring(true);
      addLog('🔄 Snapshot found, restoring...', 'info');
      setSnapshotData(saved);
      restoreSnapshot(saved, addLog);
      setTimeout(() => setIsRestoring(false), 500);
    }
  }, []);
  
  const handleSimulateHMR = () => {
    addLog('📸 Taking snapshot...', 'info');
    const snap = takeSnapshot();
    setSnapshotData(snap);
    
    const saved = saveSnapshot(snap);
    if (saved) {
      addLog(`✅ Saved: ${snap.nodes.length} nodes`, 'success');
      addLog('🔄 Reloading in 1s...', 'info');
      setTimeout(() => window.location.reload(), 1000);
    } else {
      addLog('❌ Save failed', 'error');
    }
  };
  
  const addTodo = () => {
    if (!todoText.trim()) return;
    setTodos([...todos, { id: Date.now(), text: todoText, done: false }]);
    setTodoText('');
  };
  
  const toggleTodo = (id: number) => {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };
  
  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8 border-b border-white pb-6">
        <h1 className="text-2xl font-bold mb-2">SNAPSHOT ENGINE</h1>
        <p className="text-sm text-gray-400">
          Cursor-aware state preservation across HMR reloads
        </p>
      </div>
      
      {isRestoring && (
        <div className="max-w-5xl mx-auto mb-6 p-3 border border-white">
          <RefreshCw className="inline animate-spin mr-2" size={14} />
          <span className="text-sm">Restoring state...</span>
        </div>
      )}
      
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Examples */}
        <div className="space-y-6">
          {/* Code Editor */}
          <div className="border border-white">
            <div className="border-b border-white p-2 text-xs">app.tsx</div>
            <textarea
              rows={12}
              placeholder="const MyComponent = () => {
  return <div>Hello World</div>
}"
              className="w-full px-3 py-2 bg-black text-white text-xs border-0 focus:outline-none resize-none"
              data-inspector-tracked
            />
          </div>
          
          {/* Todo List */}
          <div className="border border-white">
            <div className="border-b border-white p-2 text-xs">todo.tsx</div>
            <div className="p-3 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={todoText}
                  onChange={(e) => setTodoText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                  placeholder="Add task..."
                  className="flex-1 px-2 py-1 text-xs bg-black border border-white focus:outline-none"
                  data-inspector-tracked
                />
                <button
                  onClick={addTodo}
                  className="px-3 text-xs bg-white text-black hover:bg-gray-200"
                >
                  +
                </button>
              </div>
              
              <div className="space-y-1 text-xs">
                {todos.map(todo => (
                  <label key={todo.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={todo.done}
                      onChange={() => toggleTodo(todo.id)}
                      className="w-3 h-3"
                      data-inspector-tracked
                    />
                    <span className={todo.done ? 'line-through text-gray-500' : ''}>
                      {todo.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          {/* Form */}
          <div className="border border-white">
            <div className="border-b border-white p-2 text-xs">form.tsx</div>
            <div className="p-3 space-y-2">
              <input
                type="email"
                placeholder="email@example.com"
                className="w-full px-2 py-1 text-xs bg-black border border-white focus:outline-none"
                data-inspector-tracked
              />
              
              <select 
                className="w-full px-2 py-1 text-xs bg-black border border-white focus:outline-none" 
                data-inspector-tracked
              >
                <option>Role...</option>
                <option>Developer</option>
                <option>Designer</option>
                <option>Manager</option>
              </select>
              
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" className="w-3 h-3" data-inspector-tracked />
                <span>Subscribe</span>
              </label>
            </div>
          </div>
          
          {/* Reload Button */}
          <button
            onClick={handleSimulateHMR}
            className="w-full bg-white text-black px-4 py-3 text-sm font-bold hover:bg-gray-200"
          >
            ⟳ RELOAD & TEST
          </button>
        </div>
        
        {/* Right: Console & Info */}
        <div className="space-y-6">
          {/* Console */}
          <div className="border border-white">
            <div className="border-b border-white p-2 text-xs">console.log</div>
            <div className="h-64 overflow-y-auto p-3 text-xs space-y-1">
              {logs.length === 0 ? (
                <div className="text-gray-500">No events</div>
              ) : (
                logs.map((log, i) => (
                  <div 
                    key={i} 
                    className={`${log.type === 'error' ? 'text-red-400' : log.type === 'warn' ? 'text-yellow-400' : 'text-gray-400'}`}
                  >
                    {log.message}
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Snapshot JSON */}
          <div className="border border-white">
            <button
              onClick={() => setShowJSON(!showJSON)}
              className="w-full border-b border-white p-2 text-xs text-left hover:bg-white hover:text-black"
            >
              {showJSON ? '▼' : '▶'} snapshot.json
            </button>
            
            {showJSON && snapshotData && (
              <div className="p-3 overflow-auto max-h-64 text-xs">
                <pre className="text-gray-400">
                  {JSON.stringify(snapshotData, null, 2)}
                </pre>
              </div>
            )}
            
            {snapshotData && (
              <div className="p-3 space-y-1 text-xs border-t border-white">
                <div className="flex justify-between">
                  <span className="text-gray-400">nodes:</span>
                  <span>{snapshotData.nodes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">size:</span>
                  <span>{(JSON.stringify(snapshotData).length / 1024).toFixed(1)}kb</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Engine Info */}
          <div className="border border-white p-3">
            <div className="text-xs space-y-2">
              <div className="font-bold mb-2">ENGINE FEATURES:</div>
              <div className="space-y-1 text-gray-400">
                <div>→ Stable element keys</div>
                <div>→ Caret position tracking</div>
                <div>→ Multi-signal matching</div>
                <div>→ Confidence scoring</div>
                <div>→ localStorage bridge</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoApp;
