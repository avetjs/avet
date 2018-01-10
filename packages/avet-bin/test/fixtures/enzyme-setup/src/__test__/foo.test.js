import React from 'react';
import { shallow, mount } from 'enzyme';
import Foo from '../foo';

describe('A suite', () => {
  it('contains foo', () => {
    expect(shallow(<Foo />).contains(<div className="foo" />));
  });

  it('contains .foo', () => {
    expect(shallow(<Foo />).is('.foo'));
  });

  it('contains .foo length 1', () => {
    expect(mount(<Foo />).find('.foo').length === 1);
  });
});
