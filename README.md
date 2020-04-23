# Smart React Component Extractor

![preview](https://github.com/k1og/Smart-React-Component-Extractor/blob/master/preview.gif?raw=true)

## Usage

1. Select code you want to extract
2. Ctrl + Shift + P to run command pallete
3. Select "Smart Extract React Component"
4. Input new component name
5. Your new component is created. All imports and props are handled by the Smart React Component Extractor!!!

## Motivation

It’s not always possible to keep code clean and declarative. After a dozen commits, your components become huge and unreadable. And then comes refactoring. You split component into smaller ones. It takes time. You can't just Ctrl-X Ctrl-V. So I decided to write extension, which will help you refactor your React components

## Inspired by

https://marketplace.visualstudio.com/items?itemName=proverbialninja.svelte-extractor

## Known Issues

### Ternary if in prop
    
    Example: <Button color={darkTheme ? black : white} />

    Expected: detect darkTheme, black, white variables
    Actual: detects darkTheme, white variables

### Function declaration in prop
    TODO: Add example and write tests for this case


## Release Notes

### 0.0.2

Initial release of alpha version of extension
