import React from 'react';

declare module 'avet/head' {
  const Head: React.ReactElement<any>;
  export default Head;
}

declare module 'avet/dynamic' {
  const Dynamic: any;
  export default Dynamic;
}

declare module 'avet/router' {
  const Router: React.ReactElement<any>;
  export default Router;
}

declare module 'avet/config' {
  const Config: any;
  export default Config;
}

declare module 'avet/link' {
  const Link: any;
  export default Link;
}
