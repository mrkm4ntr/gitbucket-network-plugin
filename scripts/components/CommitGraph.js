import React, { PropTypes } from 'react';
import Commit from './Commit';

const CommitGraph = ({ maxLane, commits }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height={commits.length * 30} style={{width: '100%'}}>
    {commits.map((commit, index) =>
      <Commit key={commit.id} {...commit} index={index} maxLane={maxLane} />
    )}
  </svg>
);

CommitGraph.propTypes = {
  maxLane: PropTypes.number.isRequired,
  commits: PropTypes.arrayOf(PropTypes.shape({
    index: PropTypes.number.isRequired,
    lane: PropTypes.number.isRequired,
    message: PropTypes.string.isRequired,
    parents: PropTypes.arrayOf(PropTypes.shape({
      index: PropTypes.number.isRequired,
      lane: PropTypes.number.isRequired
    })).isRequired,
    id: PropTypes.string.isRequired,
    avatarUrl: PropTypes.string.isRequireß
  })).isRequired
};

export default CommitGraph;
