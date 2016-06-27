import React from 'react';
import assert from 'power-assert';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';
import App from '../../scripts/components/App';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import CommitGraph from '../../scripts/components/CommitGraph';

describe('App', () => {
  it('should render two DropdownButtons', () => {
    const wrapper = shallow(<App />);
    assert(wrapper.find(DropdownButton).length === 2);
  });

  it('should render one CommitGraph', () => {
    const wrapper = shallow(<App />);
    assert(wrapper.find(CommitGraph).length === 1);
  });

  it('should start with an empty commits', () => {
    const wrapper = shallow(<App />);
    assert(wrapper.state('commits').length === 0);
  });

  it('can fetch data', () => {
    const stub = sinon.stub(window, 'fetch');
    stub.returns(Promise.resolve(new window.Response(JSON.stringify({}), {
      status: 200,
      headers: {
        'Content-type': 'application/json'
      }
    })));

    const wrapper = shallow(<App />);
    return wrapper.instance().fetchData({
      count: 100,
      branch: 'foo'
    }).then(() => {
      assert(wrapper.state('isFetching') === false);
      assert(wrapper.state('count') === 100);
      assert(wrapper.state('currentBranch') === App.allBranchName);

      window.fetch.restore()
    });
  });
});
