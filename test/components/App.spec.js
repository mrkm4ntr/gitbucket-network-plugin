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

  it('passes selectBranch to branchSelector', () => {
    const wrapper = shallow(<App />);
    const branchSelector = wrapper.find('#branchSelector');
    const selectBranch = wrapper.instance().selectBranch;
    assert(branchSelector.prop('onSelect') === selectBranch);
  });

  it('passes selectCount to countSelector', () => {
    const wrapper = shallow(<App />);
    const countSelector = wrapper.find('#countSelector');
    const selectCount = wrapper.instance().selectCount;
    assert(countSelector.prop('onSelect') === selectCount);
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

  it('can notify error when fail to fetch data ', () => {
    const stub = sinon.stub(window, 'fetch');
    stub.returns(Promise.reject('error'));
    const mock = sinon.mock(window, 'alert');
    mock.expects('alert').withArgs('error');

    const wrapper = shallow(<App />);
    return wrapper.instance().fetchData({}).then(() => {
      assert(wrapper.state('isFetching') === false);
      assert(mock.verify());

      window.fetch.restore();
    });
  });

  it('can select branch', () => {
    const wrapper = shallow(<App />);
    const instance = wrapper.instance();
    const mock = sinon.mock(instance);
    mock.expects('fetchData').withArgs({ branch: 'bar', count: wrapper.state('count') });
    instance.selectBranch('bar');
    assert(mock.verify());
  });

  it('can select count', () => {
    const wrapper = shallow(<App />);
    const instance = wrapper.instance();
    const mock = sinon.mock(instance);
    mock.expects('fetchData').withArgs({ all: 1, count: 1000 });
    instance.selectCount(1000);
    assert(mock.verify());
  });

});
