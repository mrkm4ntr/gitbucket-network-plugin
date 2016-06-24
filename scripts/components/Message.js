import React, { PropTypes } from 'react';
import tinycolor from 'tinycolor2';

export default class Message extends React.Component {

  constructor(props) {
    super(props);
    this.state = { refsWidth: 0 };
  }

  shouldComponentUpdate(nextProp, nextState) {
    return nextProp.x !== this.props.x || nextState.refsWidth !== this.state.refsWidth;
  }

  render() {
    return (
      <g>
        {(() => {
          if (this.props.refs) {
            return (
              <g>
                <rect
                  x={this.props.x} y="6" width={this.state.refsWidth + 6}
                  height="20" stroke="#000" rx="3" ry="3"
                  fill={tinycolor(this.props.color).brighten(70).toHexString()}
                />
                <text
                  x={this.props.x + 3} y="15"
                  ref={text => {
                    if (text) {
                      const bbox = text.getBBox();
                      this.setState({ refsWidth: bbox.width });
                    }
                  }}
                >
                  <tspan dy="5">{this.props.refs}</tspan>
                </text>
              </g>
            );
          }
          return '';
        })()}
        <text x={this.props.x + this.state.refsWidth + (this.state.refsWidth > 0 ? 10 : 0)} y="15">
          <tspan dy="5">{this.props.children}</tspan>
        </text>
      </g>
    );
  }
}

Message.propTypes = {
  refs: PropTypes.string,
  x: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  children: PropTypes.string.isRequired,
};
