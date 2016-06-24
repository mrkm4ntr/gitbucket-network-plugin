import React from 'react';
import assert from 'power-assert';
import { shallow, mount } from 'enzyme';
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
  })
});
