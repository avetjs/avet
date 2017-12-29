import React from 'react';

export default class ToDoItem extends React.Component {
  render() {
    const { item, onCompleteChange } = this.props;
    return (
      <div className="item">
        <span className="item-mark">{item.complete ? '✓' : '•'}</span>
        <span className="item-title">{item.title}</span>
        <a
          className="item-button"
          onClick={() => onCompleteChange(item, !item.complete)}
        >
          Mark as {item.complete ? 'Pending' : 'Complete'}
        </a>
      </div>
    );
  }
}
