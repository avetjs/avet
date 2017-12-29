import React from 'react';
import { shallow } from 'enzyme';
import ToDoList from '../ToDoList';
import ToDoItem from '../ToDoItem';

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
    const wrapper = shallow(<ToDoList items={items} />);
    expect(wrapper.find(ToDoItem)).toHaveLength(items.length);
  });
});
