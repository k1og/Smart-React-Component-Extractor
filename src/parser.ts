import * as esprima from 'esprima';

export interface PraseJSXResult {
    props?: Array<string>
    components?: Array<string>
}

export type ParseImportsResult = Array<{
    defaultImport?: string
    destructingImports: Array<string>
    from: string
}> | undefined;

export enum ImportType {
    DEFAULT,
    DESTRUCTURING
}

export const parseJSX = (componentBody: string): PraseJSXResult => {
    const components = componentBody.match(/<[A-Z][^ |\r?\n|\r|>|\/]*/g)?.map(c => c.slice(1)).filter((c, i, arr) => arr.indexOf(c) === i);
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
                return t.type === esprima.Syntax.Identifier && (!previousValueIsObjectProperty && !isObjectKey);
            })
            .map(p => p.value)
        )
        .reduce((acc, val) => acc.concat(val))
        .filter((p, i, arr) => arr.indexOf(p) === i);
    props = props && props.length > 0 ? props : undefined;
    return { components, props };
};

export const parseImports = (componentContent: string): ParseImportsResult  | undefined => {
    const imports = componentContent
        .match(/import[^(;|\r?\r)|'|"]+('|")(.*)('|")/g)
        ?.map(importStatement => esprima.parseModule(importStatement).body[0]);

    return imports?.map(body => {
        // @ts-ignore
        const defaultImportInfo = body.specifiers.find(specifier => specifier.type === 'ImportDefaultSpecifier');
        // @ts-ignore
        const destructingImportsInfo = body.specifiers.filter(specifier => specifier.type === 'ImportSpecifier');
        return ({
            defaultImport: defaultImportInfo ? defaultImportInfo.local.name : undefined,
            // @ts-ignore
            destructingImports: destructingImportsInfo.map(specifier => specifier.local.name),
            // @ts-ignore
            from: body.source.value
        });
    });
};