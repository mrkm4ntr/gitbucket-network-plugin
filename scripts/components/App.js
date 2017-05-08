import React from 'react';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import CommitGraph from './CommitGraph';
import 'whatwg-fetch';

export default class App extends React.Component {

  static get allBranchName() {
    return 'All Branches';
  }

  static get defaultBranchName() {
    return 'Default Branch';
  }

  constructor(props) {
    super(props);
    this.selectBranch = this.selectBranch.bind(this);
    this.selectCount = this.selectCount.bind(this);
    this.state = {
      maxLane: 0,
      commits: [],
      branches: [],
      currentBranch: App.allBranchName,
      isFetching: true,
      count: 100,
    };
  }

  componentDidMount() {
    this.fetchData({ count: 100 });
  }

  setParams(branchName, params) {
    const returnParams = params;
    switch (branchName) {
      case App.allBranchName:
        returnParams.all = 1;
        break;
      case App.defaultBranchName:
        returnParams.branch = this.state.defaultBranch;
        break;
      default:
        returnParams.branch = branchName;
    }
    return returnParams;
  }

  selectBranch(branch) {
    const params = this.setParams(branch, { count: this.state.count });
    this.fetchData(params);
  }

  selectCount(count) {
    const params = this.setParams(this.state.currentBranch, { count });
    this.fetchData(params);
  }

  fetchData(params) {
    const query = Object.keys(params).map(k => `${k}=${params[k]}`).join('&');
    this.setState(Object.assign({}, this.state, { isFetching: true }));
    return window.fetch(`./network/commits?${query}`, { credentials: 'include' }).then(
      r => r.json()
    ).then(data => {
      const newState = Object.assign({ count: params.count, isFetching: false }, data);
      if (data.all) {
        newState.currentBranch = App.allBranchName;
      }
      this.setState(newState);
    })
    .catch(e => {
      this.setState(Object.assign(this.state, { isFetching: false }));
      window.alert(e);
    });
  }

  render() {
    return (
      <div style={{ marginLeft: '20px' }}>
        <DropdownButton
          id="branchSelector"
          title={`branch:${this.state.currentBranch}`}
          onSelect={this.selectBranch}
          style={{ marginBottom: '10px' }}
        >
          <MenuItem key={App.allBranchName} eventKey={App.allBranchName}>
            {App.allBranchName}
          </MenuItem>
          <MenuItem key={App.defaultBranchName} eventKey={App.defaultBranchName}>
            {App.defaultBranchName}
          </MenuItem>
          <MenuItem divider />
          {this.state.branches.map(branch =>
            <MenuItem key={branch} eventKey={branch}>{branch}</MenuItem>
          )}
        </DropdownButton>
        <DropdownButton
          id="countSelector"
          title={`commits:${this.state.count}`}
          onSelect={this.selectCount}
          style={{ margin: '0 0 10px 10px' }}
        >
          {[100, 500, 1000].map(count =>
            <MenuItem key={count} eventKey={count}>{count}</MenuItem>
          )}
        </DropdownButton>
        <div style={{ border: 'solid 1px #ccc', position: 'relative' }}>
          <div style={this.state.isFetching ? {} : { display: 'none' }}>
            <div
              style={{
                position: 'absolute', width: '100%',
                height: `${this.state.commits.length * 30}px`,
              }}
            />
            <img
              src="../../../assets/common/images/indicator-bar.gif"
              style={{ margin: '300px auto', display: 'block' }}
              role="presentation"
            />
          </div>
          <div style={this.state.isFetching ? { display: 'none' } : {}}>
            <CommitGraph {...this.state} />
          </div>
        </div>
      </div>
    );
  }
}
