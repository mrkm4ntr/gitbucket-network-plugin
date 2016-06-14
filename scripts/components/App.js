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
      currentBranch: App.allBranchName,
      isFetching: true
    };
  }

  fetchData(key) {
    this.setState(Object.assign({}, this.state, { isFetching: true }));
    const query = (key && key !== App.allBranchName) ? `?branch=${key}` : '' 
    fetch(`./network/commits${query}`).then(r => r.json()).then(data => {
      data.branches.push(App.allBranchName);
      if (!data.currentBranch)
        data.currentBranch = App.allBranchName;
      data.isFetching = false;
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
        <div style={{border: 'solid 1px #ccc', position: 'relative'}}>
          <div style={this.state.isFetching ? {} : { display: 'none' }}>
            <div style={{position: 'absolute', width: '100%', height: `${this.state.commits.length * 30}px`}}></div>
            <img src="../../../assets/common/images/indicator-bar.gif" style={{margin: '300px auto', display: 'block'}} />
          </div>
          <div style={this.state.isFetching ? { display: 'none' } : {}}>
            <CommitGraph {...this.state} />
          </div>
        </div>
      </div>
    );
  }
}
