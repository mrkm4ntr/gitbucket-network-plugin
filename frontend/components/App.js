import React from 'react';
import CommitGraph from './CommitGraph';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      commits: []
    };
  }

  componentDidMount() {
    fetch('./network/commits').then(r => r.json()).then(data => {
      this.setState(data);
    });
  }

  render () {
    return (
      <div>
        <CommitGraph {...this.state} />
      </div>
    );
  }
}
