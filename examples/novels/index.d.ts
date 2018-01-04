declare module 'avet' {
  export * from 'egg';

  export interface IAdapter {
    constructor(ctx: Context);
  }

  export interface IAPI {
    constructor(ctx: Context);
  }

  export interface IService extends Egg.IService {
    adapter: IAdapter;
  }
  export interface IController extends Egg.IController {
    api: IAPI;
  }

  export interface ISubscription {}

  // 目前哪个配置报错就直接重写应付先
  export interface EggAppConfig extends Egg.EggAppConfig {}

  export interface Application extends Egg.Application {
    controller: IController;
    config: EggAppConfig;
  }

  export interface Context extends Egg.Context {
    app: Application;
    service: IService;
    config: EggAppConfig;
  }

  export class Subscription extends Egg.BaseContextClass {
    constructor(ctx: Context);

    app: Application;
    config: EggAppConfig;
    ctx: Context;
    service: IService;
  }

  export class Controller extends Egg.Controller {
    constructor(ctx: Context);

    app: Application;
    ctx: Context;
    service: IService;
  }

  export class Service extends Egg.Service {
    constructor(ctx: Context);

    app: Application;
    ctx: Context;
    config: EggAppConfig;
    service: IService;
  }
}

declare module 'avet/head' {
  const Head: React.ReactElement;
  export default Head;
}

declare module 'avet/dynamic' {
  const Dynamic: any;
  export default Dynamic;
}

declare module 'avet/router' {
  const Router: React.ReactElement;
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

declare module 'dva' {
  const c: any;
  export default c;
}
