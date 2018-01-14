import React from 'react';
import PropTypes from 'prop-types';
import sideEffect from './side-effect';

class Head extends React.Component {
  static contextTypes = {
    headManager: PropTypes.object,
  };

  render() {
    return null;
  }
}

export function defaultHead() {
  return [ <meta charSet="utf-8" className="app-head" /> ];
}

function reduceComponents(components) {
  return components
    .map(c => c.props.children)
    .map(children => React.Children.toArray(children))
    .reduce((a, b) => a.concat(b), [])
    .reduce((a, b) => {
      if (React.Fragment && b.type === React.Fragment) {
        return a.concat(React.Children.toArray(b.props.children));
      }
      return a.concat(b);
    }, [])
    .reverse()
    .concat(...defaultHead())
    .filter(c => !!c)
    .filter(unique())
    .reverse()
    .map(c => {
      const className = `${c.className ? `${c.className} ` : ''}app-head`;
      return React.cloneElement(c, { className });
    });
}

function mapOnServer(head) {
  return head;
}

function onStateChange(head) {
  if (this.context && this.context.headManager) {
    this.context.headManager.updateHead(head);
  }
}

const METATYPES = [ 'name', 'httpEquiv', 'charSet', 'itemProp', 'property' ];

// returns a function for filtering head child elements
// which shouldn't be duplicated, like <title/>.

function unique() {
  const keys = new Set();
  const tags = new Set();
  const metaTypes = new Set();
  const metaCategories = {};

  return h => {
    if (h.key && h.key.startsWith('.$')) {
      if (keys.has(h.key)) return false;
      keys.add(h.key);
    }

    switch (h.type) {
      case 'title':
      case 'base':
        if (tags.has(h.type)) return false;
        tags.add(h.type);
        break;
      case 'meta':
        for (let i = 0, len = METATYPES.length; i < len; i++) {
          const metatype = METATYPES[i];
          if (!h.props.hasOwnProperty(metatype)) continue;

          if (metatype === 'charSet') {
            if (metaTypes.has(metatype)) return false;
            metaTypes.add(metatype);
          } else {
            const category = h.props[metatype];
            const categories = metaCategories[metatype] || new Set();
            if (categories.has(category)) return false;
            categories.add(category);
            metaCategories[metatype] = categories;
          }
        }
        break;
      default:
        break;
    }
    return true;
  };
}

export default sideEffect(reduceComponents, onStateChange, mapOnServer)(Head);
