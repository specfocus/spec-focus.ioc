export type Resolver = (name: string, locals: Record<string, any>) => Promise<any>;

export class Container {
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
    this.locals[name] = value;
  };
}
