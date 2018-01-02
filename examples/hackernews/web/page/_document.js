import Document, { Html, Head, Body, Main, AvetScript } from 'avet/document';

export default class extends Document {
  render() {
    return (
      <Html>
        <Head>
          <style
            dangerouslySetInnerHTML={{
              __html: `
            body,
            html {
              font-family: Verdana;
              font-size: 13px;
              height: 100%
            }
            ul {
              list-style-type: none;
              padding: 0;
              margin: 0
            }
            a {
              color: #000;
              cursor: pointer;
              text-decoration: none
            }
            .view {
              position: absolute;
              background-color: #f6f6ef;
              width: 100%;
              -webkit-transition: opacity .2s ease;
              transition: opacity .2s ease;
              box-sizing: border-box;
              padding: 8px 20px
            }
            .view.v-enter,
            .view.v-leave {
              opacity: 0
            }
            @media screen and (max-width: 700px) {
              body,
              html {
                margin: 0
              }
              .wrapper {
                width: 100%
              }
            }
          `,
            }}
          />
        </Head>
        <Body>
          <Main />
          <AvetScript />
        </Body>
      </Html>
    );
  }
}
