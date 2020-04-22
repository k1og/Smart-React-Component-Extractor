import * as esprima from 'esprima';

interface PraseResult {
    props?: Array<string>
    components?: Array<string>
}

export const parse = (componentBody: string): PraseResult => {
    let components = componentBody.match(/<[A-Z][^ |>|\/]*/g)?.map(c => c.slice(1)).filter((c, i, arr) => arr.indexOf(c) === i);
    let props = componentBody
        .match(/{+[^}]+}+/g)
        ?.map(p => p.slice(1, -1).trim())
        .filter((p, i, arr) => arr.indexOf(p) === i)
        .map(p => esprima.tokenize(p)
            .filter((t, i, arr) => {
                let previousValueIsObjectProperty;
                if (arr[i-1] === undefined) {
                    previousValueIsObjectProperty = false;
                } else {
                    if (arr[i-1].value === '.') {
                        previousValueIsObjectProperty = true;
                    } else {
                        previousValueIsObjectProperty = false;
                    }
                }
                let isObjectKey;
                if (arr[i+1] === undefined) {
                    isObjectKey = false;
                } else {
                    if (arr[i+1].value === ':') {
                        isObjectKey = true;
                    } else {
                        isObjectKey = false;
                    }
                }
                return t.type === 'Identifier' && (!previousValueIsObjectProperty && !isObjectKey);
            })
            .map(p => p.value)
        )
        .reduce((acc, val) => acc.concat(val))
        .filter((p, i, arr) => arr.indexOf(p) === i);
    props = props && props.length > 0 ? props : undefined;
    return { components, props };
};