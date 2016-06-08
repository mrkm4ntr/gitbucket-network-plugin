import React from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap'
import CommitGraph from './CommitGraph';

export default class App extends React.Component {

  static get allBranchName() {
    return 'all branches';
  }

  constructor(props) {
    super(props);
    this.state = {
      maxLane: 0,
      commits: [],
      branches: [],
      currentBranch: App.allBranchName
    };
  }

  fetchData(key) {
    const query = (key && key !== App.allBranchName) ? `?branch=${key}` : '' 
    fetch(`./network/commits${query}`).then(r => r.json()).then(data => {
      data.branches.push(App.allBranchName);
      if (!data.currentBranch)
        data.currentBranch = App.allBranchName;
      this.setState(data);
    });
  }

  componentDidMount() {
    this.fetchData();
  }

  render () {
    return (
      <div style={{marginLeft: '20px'}}>
        <DropdownButton id={'branchSwitcher'} title={`branch:${this.state.currentBranch}`} onSelect={this.fetchData.bind(this)} style={{marginBottom: '10px'}}>
          {this.state.branches.map(branch =>
            <MenuItem key={branch} eventKey={branch}>{branch}</MenuItem>
          )}
        </DropdownButton>
        <div style={{padding: '20px'}}>
          <CommitGraph {...this.state} />
        </div>
      </div>
    );
  }
}
