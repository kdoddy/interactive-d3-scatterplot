import React, { useEffect, useRef } from 'react';
import './App.css';
import * as d3 from 'd3';
import InteractiveScatter from './InteractiveScatter';

const D3blackbox = ({ x, y, render }) => {
  const refAnchor = useRef(null);

  useEffect(() => {
    render(d3.select(refAnchor.current))
  });

  return <g ref={refAnchor} transform={`translate(${x}, ${y})`} />;
}

function App() {
  return (
    <div className="App">
      <svg width='900' height='900'>
        <D3blackbox x={0} y={0} render={svg => InteractiveScatter(svg, 600, 600)} />
      </svg>
    </div>
  );
}

export default App;
