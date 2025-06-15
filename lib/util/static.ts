export function Static<T>(init: () => T): () => T {
    const sym = Symbol();
    return () => (sym in Static ? (Static as any)[sym] : ((Static as any)[sym] = init()));
}
