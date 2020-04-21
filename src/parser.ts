interface PraseResult {
    props?: Array<string>
    components?: Array<string>
}

export const parse = (componentBody: string): PraseResult => {
    let components = componentBody.match(/<[A-Z][^ |>|\/]*/g)?.map(c => c.slice(1)).filter((c, i, arr) => arr.indexOf(c) === i);
    let props = componentBody.match(/{(?! *true)[^{}:()'"]+}/g)?.map(p => p.replace(/{|}| |\r?\n|\r|\..*/g, '')).filter((p, i, arr) => arr.indexOf(p) === i);
    return { components, props };
};