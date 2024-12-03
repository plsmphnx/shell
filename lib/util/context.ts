export namespace Context {
    export interface Props {
        ctx: Context;
    }
}

export type Context = { [ctx: symbol]: unknown };

export function Context<T>(init: (ctx: Context) => T): (ctx: Context) => T {
    const sym = Symbol();
    return ctx => (sym in ctx ? ctx[sym] : (ctx[sym] = init(ctx))) as any as T;
}
