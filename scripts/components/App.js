import React from 'react';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import CommitGraph from './CommitGraph';
import FormControl from 'react-bootstrap/lib/FormControl';
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
    this.clearFilter = this.clearFilter.bind(this);
    this.changeFilter = this.changeFilter.bind(this);
    this.state = {
      maxLane: 0,
      commits: [],
      branches: [],
      currentBranch: App.allBranchName,
      isFetching: true,
      count: 100,
      displayCount: 100,
      filter: '',
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
    if (branch.startsWith('.')) return;
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
      const newState = Object.assign({ count: params.count, isFetching: false },
                                     data,
                                     { branches: data.branches.map(
                                         branch => ({ branch, visible: true })) },
                                     { displayCount: data.branches.length }
                                    );
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

  stopPropagation(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  changeFilter(e) {
    this.filter(e.target.value);
  }

  clearFilter(e) {
    e.preventDefault();
    e.stopPropagation();

    this.filter('');
  }

  filter(value) {
    this.setState(Object.assign(this.state, { filter: value }));

    this.setState(Object.assign(this.state, {
      branches: this.state.branches.map(({ branch }) => ({
        branch,
        visible: this.state.filter ?
                 branch.toLowerCase().indexOf(this.state.filter.toLowerCase()) >= 0 : true,
      })),
    }));

    this.setState(Object.assign(this.state, {
      displayCount: this.state.branches.reduce((prev, current) =>
                                                 prev + (current.visible ? 1 : 0), 0),
    }));
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
          <li><div id="branch-control-title">Switch branches</div></li>
          <MenuItem key={App.allBranchName} eventKey={App.allBranchName}>
            {App.allBranchName}
          </MenuItem>
          <MenuItem key={App.defaultBranchName} eventKey={App.defaultBranchName}>
            {App.defaultBranchName}
          </MenuItem>
          <li>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FormControl
                id="branch-control-input"
                type="text" placeholder="Find branch..."
                style={{ width: '90%' }}
                className="input-sm dropdown-filter-input"
                value={this.state.filter}
                onClick={this.stopPropagation}
                onSelect={this.stopPropagation}
                onChange={this.changeFilter}
              />
              <i
                className="octicon octicon-x" style={{ display: 'flex', cursor: 'pointer' }}
                onClick={this.clearFilter}
              />
            </div>
          </li>
          {this.state.branches.filter(({ visible }) => visible).map(({ branch }) =>
            <MenuItem key={branch} eventKey={branch}>{branch}</MenuItem>
          )}
          {this.state.displayCount === 0 ?
            (<MenuItem eventKey=".">NO MATCHED BRANCH</MenuItem>) : (null)}
        </DropdownButton>
        <DropdownButton
          id="countSelector"
          title={`commits:${this.state.count}`}
          onSelect={this.selectCount}
          style={{ margin: '0 0 10px 10px' }}
        >
          <li>
            <div
              id="branch-control-title"
              style={{ whiteSpace: 'nowrap' }}
            >Switch num of commits</div>
          </li>
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
