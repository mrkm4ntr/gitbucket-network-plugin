import React, { PropTypes } from 'react';

const height = 30;
const pallet = ['#000000', '#FFD700', '#C71585', '#006400', '#0000ff'];

const Commit = ({ maxLane, index, lane, message, parents, id, avatarUrl }) => {

  const x = (maxLane + 2) * 15;
  const color = pallet[lane % pallet.length];

  return <g transform={`translate(0, ${index * height})`}>
    {parents.map(p => {
      if (lane === p.lane) {
        return <path key={p.index} fill="none" stroke-width="2" d={`M${lane * 15 + 10},15 v${(p.index - index) * height}`} stroke={color}></path>
      }
      if (lane < p.lane) {
        return <path key={p.index} fill="none" stroke-width="2" d={`M${lane * 15 + 10},15 l5,5 h${(p.lane - lane) * 15 - 5} v${(p.index - index) * height - 5}`} stroke={pallet[p.lane % pallet.length]}></path>
      }
      return <path key={p.index} fill="none" stroke-width="2" d={`M${lane * 15 + 10},15 v${(p.index - index) * height} h${(p.lane - lane) * 15}`} stroke={color}></path>
    })}
    <rect x={x} y="5" width="20" height="20" stroke={color} fill="none" stroke-width="2"></rect>
    <circle cx={lane * 15 + 10} cy="15" r="3" stroke={color} fill={color} onClick={() => {location.href = `./commit/${id}`}}></circle>
    <image x={x} y="5" width="20" height="20" preserveAspectRatio="none" href={avatarUrl} ></image>
    <text x={x + 30} y="15" width="20" height="20" fill="#000000" stroke-width="2" font="14px">
      <tspan dy="5">{message}</tspan>
    </text>
  </g>
};

Commit.propTypes = {
  maxLane: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
  lane: PropTypes.number.isRequired,
  message: PropTypes.string.isRequired,
  parents: PropTypes.arrayOf(PropTypes.shape({
    index: PropTypes.number.isRequired,
    lane: PropTypes.number.isRequired
  })).isRequired,
  id: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string.isRequired
};

export default Commit;
