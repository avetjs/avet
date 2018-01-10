import React from 'react';
import { render } from 'enzyme';
import ToDoList from '../../../web/component/ToDoList';

function mockItem() {
  return [
    {
      id: '001',
      complete: true,
      title: 'test01',
    },
    {
      id: '002',
      complete: false,
      title: 'test02',
    },
  ];
}

describe('<ToDoList />', () => {
  it('renders the entire list of items', () => {
    const items = [ mockItem(), mockItem() /* , ... */];
    const wrapper = render(<ToDoList items={items} />);
    expect(wrapper).toMatchSnapshot();
  });
});
