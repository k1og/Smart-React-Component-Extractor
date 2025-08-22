import * as assert from 'assert';
import { parseImports, ImportType } from '../../parser';

suite('Imports Parser Test Suite', () => {
    test('Single default import', () => {
        const comp = `
            import React from 'react';
        `;
        assert.deepStrictEqual(parseImports(comp), [{
            defaultImport: 'React',
            destructingImports: [],
            from: 'react'
        }]);
    });

    test('Single destructing import', () => {
        const comp = `
            import { ReactElement } from 'react';
            import { string } from 'yup';

        `;
        assert.deepStrictEqual(parseImports(comp), [
            {
                defaultImport: undefined,
                destructingImports: ['ReactElement'],
                from: 'react'
            },
            {
                defaultImport: undefined,
                destructingImports: ['string'],
                from: 'yup'
            }
        ]);
    });

    test('Multiple destructing imports', () => {
        const comp = `
            import { ReactElement, useState } from 'react';
            import { string, number } from 'yup';
        `;
        assert.deepStrictEqual(parseImports(comp), [
            {
            defaultImport: undefined,
            destructingImports: ['ReactElement', 'useState'],
            from: 'react'
            },
            {
                defaultImport: undefined,
                destructingImports: ['string', 'number'],
                from: 'yup'
            }
        ]);
    });

    test('Default and destructing imports', () => {
        const comp = `
            import React, { ReactElement, useState } from 'react';
            import { string, number } from 'yup';
        `;
        assert.deepStrictEqual(parseImports(comp), [
            {
            defaultImport: 'React',
            destructingImports: ['ReactElement', 'useState'],
            from: 'react'
            },
            {
                defaultImport: undefined,
                destructingImports: ['string', 'number'],
                from: 'yup'
            }
        ]);
    });

    test('Default and destructing imports with line break', () => {
        const comp = `
            import React
             from "react";
            import {
                formatWithIsPositive,
                formatWithIsNotPositive,
            } from '../../lib/util/formatWithColor'
        `;
        assert.deepStrictEqual(parseImports(comp), [
            {
            defaultImport: 'React',
            destructingImports: [],
            from: 'react'
            },
            {
                defaultImport: undefined,
                destructingImports: ['formatWithIsPositive', 'formatWithIsNotPositive'],
                from: '../../lib/util/formatWithColor'
            }
        ]);
    });
});