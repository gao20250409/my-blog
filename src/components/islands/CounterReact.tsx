import { useState } from 'react';

interface Props {
  initialCount?: number;
}

export default function CounterReact({ initialCount = 0 }: Props) {
  const [count, setCount] = useState(initialCount);

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-3 text-gray-900">
        React 计数器岛屿
      </h3>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setCount(count - 1)}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          -
        </button>
        <span className="text-xl font-mono text-gray-900">{count}</span>
        <button
          onClick={() => setCount(count + 1)}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          +
        </button>
      </div>
      <p className="text-sm text-gray-600 mt-2">
        这是一个 React 组件岛屿，具有客户端交互性
      </p>
    </div>
  );
}