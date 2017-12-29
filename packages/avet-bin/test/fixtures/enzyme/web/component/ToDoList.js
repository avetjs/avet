import React from 'react';
import ToDoItem from './ToDoItem';

export default class ToDoList extends React.Component {
  render() {
    const { items, onChange } = this.props;
    return (
      <div className="todo-list">
        {items.map(item => (
          <ToDoItem key={item.id} item={item} onCompleteChange={onChange} />
        ))}
      </div>
    );
  }
}
