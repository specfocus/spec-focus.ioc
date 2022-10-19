export type Resolver = (name: string, locals: Record<string, any>) => Promise<any>;

class Container {
  private static readonly stack: Resolver[] = [];

  public static readonly push = (resolver: Resolver): void => {
    Container.stack.unshift(resolver);
  };

  public static readonly pop = (resolver: Resolver): void => {
    const index = Container.stack.indexOf(resolver);

    switch(index) {
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

  public constructor(public locals: Record<string, any>) {
    this.store('$', this);
  }

  public readonly resolve = async (name: string): Promise<any> => {
    let value: any;

    for (const fn of Container.stack) {
      value = await fn(name, this.locals);
      if (typeof value !== 'undefined') {
        return value;
      }
    }

    const { [name]: singleton } = this.locals;

    return singleton;
  };

  public readonly store = (name: string, singleton: any): void => {
    this.locals[name] = singleton;
  };
}

export default Container;
