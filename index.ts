export const IDENTITY = '$';

export interface Locals {
  [IDENTITY]?: Container;
  [K: string]: any;
}

export type Resolver = (name: string, locals: Locals) => Promise<any>;

export class Container {
  private static readonly stack: Resolver[] = [];

  // Implement singleton container
  public static create = (locals: Locals): Container => {
    let { [IDENTITY]: instance } = locals;

    if (instance instanceof Container) {
      return instance;
    }

    instance = new Container(locals);

    instance.store(IDENTITY, instance);

    return instance;
  };

  public static readonly push = (resolver: Resolver): void => {
    Container.stack.unshift(resolver);
  };

  public static readonly pop = (resolver: Resolver): void => {
    const index = Container.stack.indexOf(resolver);

    switch (index) {
      case -1:
        break;
      case 0:
        Container.stack.shift();
        break;
      default:
        Container.stack.splice(index, 1);
        break;
    }
  };

  private constructor(public locals: Locals) {
  }

  public readonly resolve = async (name: string): Promise<any> => {
    // identity resolution
    if (name === IDENTITY) {
      return this;
    }

    // default resolution
    let { [name]: result } = this.locals;

    // go though resolver stack
    for (const fn of Container.stack) {
      const value = await fn(name, this.locals);

      if (typeof value !== 'undefined') {
        // complete with custom resolution
        result = value;
        break;
      }
    }

    return result;
  };

  public readonly store = (name: string, value: any): void => {
    if (name === IDENTITY) {
      throw new Error(`${IDENTITY} is a reserved variable`);
    }

    this.locals[name] = value;
  };
}
