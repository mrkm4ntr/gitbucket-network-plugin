import React from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap'
import CommitGraph from './CommitGraph';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      maxLane: 0,
      commits: [],
      branches: [],
      currentBranch: ''
    };
    this.handleSelect = key => {
      fetch(`./network/commits?branch=${key}`).then(r => r.json()).then(data => {
        this.setState(data);
      });
    }
  }

  componentDidMount() {
    fetch('./network/commits').then(r => r.json()).then(data => {
      this.setState(data);
    });
  }

  render () {
    return (
      <div style={{marginLeft: '20px'}}>
        <DropdownButton title={`branch:${this.state.currentBranch}`} onSelect={this.handleSelect} style={{marginBottom: '10px'}}>
          {this.state.branches.map(branch =>
            <MenuItem eventKey={branch}>{branch}</MenuItem>
          )}
        </DropdownButton>
        <div style={{padding: '20px'}}>
          <CommitGraph {...this.state} />
        </div>
      </div>
    );
  }
}
