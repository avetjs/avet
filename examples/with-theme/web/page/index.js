import React from 'react';
import theme from 'avet/theme';

class IndexPage extends React.Component {
  static async getProps({ ctx }) {
    return {
      styles: theme.getStyles(ctx),
    };
  }

  toggleTheme = () => {
    if (theme.currentTheme() === 'dark') {
      theme.chooseTheme('red');
    } else {
      theme.chooseTheme('dark');
    }
  };

  render() {
    const { styles } = this.props;
    return (
      <div className="container">
        <h1 className="title">You can click button to change title color</h1>
        <button onClick={this.toggleTheme}>Change Theme</button>
        <style jsx>{`
          .title {
            color: ${styles.title};
          }
        `}</style>
      </div>
    );
  }
}

export default IndexPage;
