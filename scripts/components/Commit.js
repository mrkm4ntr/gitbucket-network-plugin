import React, { PropTypes } from 'react';
import Message from './Message';

const height = 30;
const pallet = ['#000000', '#FFD700', '#C71585', '#006400', '#0000ff'];

const Commit =
  ({ maxLane, index, lane, message, parents, id, avatarUrl, refs, month = '', day = '' }) => {
    const x = (maxLane + 2) * 15;
    const color = pallet[lane % pallet.length];

    return (
      <g transform={`translate(50, ${index * height})`}>
        <text x="-44" y="15">
          <tspan dy="5">{month}</tspan>
        </text>
        <text x="-28" y="15">
          <tspan dy="5">{day}</tspan>
        </text>
        {parents.map((p, idx, prnts) => {
          const h = (p.index - index) * height;
          if (lane === p.lane) {
            return (
              <path
                key={p.index} fill="none" strokeWidth="2" stroke={color}
                d={`M${lane * 15 + 10},15 v${h}`}
              />
            );
          }
          if (prnts.length === 2) {
            if (lane < p.lane) {
              return (
                <path
                  key={p.index} fill="none" strokeWidth="2" stroke={pallet[p.lane % pallet.length]}
                  d={`M${lane * 15 + 10},15 l5,5 h${(p.lane - lane) * 15 - 5} v${h - 5}`}
                />
              );
            }
            return (
              <path
                key={p.index} fill="none" strokeWidth="2" stroke={pallet[p.lane % pallet.length]}
                d={`M${lane * 15 + 10},15 l-5,5 h${(p.lane - lane) * 15 + 5} v${h - 5}`}
              />
            );
          }
          return (
            <path
              key={p.index} fill="none" strokeWidth="2" stroke={color}
              d={`M${lane * 15 + 10},15 v${h} h${(p.lane - lane) * 15}`}
            />
          );
        })}
        <rect x={x} y="5" width="20" height="20" stroke={color} fill="none" strokeWidth="2" />
        <circle
          cx={lane * 15 + 10} cy="15" r="3" stroke={color} fill={color}
          onClick={() => window.open(`./commit/${id}`, '_blank')} style={{ cursor: 'pointer' }}
        />
        <image
          x={x} y="5" width="20" height="20" preserveAspectRatio="none" xlinkHref={avatarUrl}
        />
        <Message x={x + 30} refs={refs.join(' ')} color={color}>{message}</Message>
      </g>
    );
  };

Commit.propTypes = {
  maxLane: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
  lane: PropTypes.number.isRequired,
  message: PropTypes.string.isRequired,
  parents: PropTypes.arrayOf(PropTypes.shape({
    index: PropTypes.number.isRequired,
    lane: PropTypes.number.isRequired,
  })).isRequired,
  id: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string.isRequired,
  refs: PropTypes.arrayOf(PropTypes.string).isRequired,
  month: PropTypes.number,
  day: PropTypes.number,
};

export default Commit;
