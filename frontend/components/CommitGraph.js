import React from 'react';
import Commit from './Commit';

const CommitGraph = ({ maxLane, commits }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height="2000" width="800">
    <defs>
      <marker id="arr" markerUnits="strokeWidth" markerWidth="3" markerHeight="3" viewBox="0 0 10 10" refX="5" refY="5" orient="auto">
        <polygon points="0,0 5,5 0,10 10,5 " fill="red"/>
      </marker>
    </defs>
    {commits.map((commit, index) =>
      <Commit {...commit} index={index} maxLane={maxLane} />
    )}
  </svg>
);

export default CommitGraph;
