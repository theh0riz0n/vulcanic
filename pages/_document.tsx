import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <meta name='application-name' content='Dark Tide Journal' />
          <meta name='apple-mobile-web-app-capable' content='yes' />
          <meta name='apple-mobile-web-app-status-bar-style' content='default' />
          <meta name='apple-mobile-web-app-title' content='Dark Tide Journal' />
          <meta name='description' content='Dark Tide Journal Progressive Web App' />
          <meta name='format-detection' content='telephone=no' />
          <meta name='mobile-web-app-capable' content='yes' />
          <meta name='theme-color' content='#000000' />
          
          {/* PWA manifest */}
          <link rel='manifest' href='/manifest.json' />
          
          {/* Apple touch icons */}
          <link rel='apple-touch-icon' href='/icons/icon-192x192.png' />
          <link rel='apple-touch-icon' sizes='152x152' href='/icons/apple-touch-icon.png' />
          <link rel='apple-touch-icon' sizes='180x180' href='/icons/apple-touch-icon-180x180.png' />
          
          {/* Favicon */}
          <link rel='shortcut icon' href='/favicon.ico' />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument; 
