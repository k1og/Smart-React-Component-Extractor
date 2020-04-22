import * as assert from 'assert';
import { parse } from '../../parser';

suite('Parser Test Suite', () => {
	test('No html tags', () => {
        const comp = `
            <button>Click</button>
        
            <span>Hello</span>
        
            <Button onClick={handleButtonClick}>{title}</Button>
        
            <StyledSpan onClick={handleNameClick}>{name}</StyledSpan>
        `;
        assert.deepStrictEqual(parse(comp), {components: ['Button', 'StyledSpan'], props: ['handleButtonClick', 'title', 'handleNameClick', 'name']});
    });
    
    test('No duplicates', () => {
        const comp = `
            <button onClick={handleClick}>Click</button>
            
            <span onClick={handleClick}>Hello</span>
        
            <Button onClick={handleClick}>{title}</Button>
        
            <StyledSpan onClick={handleClick}>{name}</StyledSpan>

            <StyledSpan onClick={handleClick}>{name}</StyledSpan>

            <Button onClick={handleClick}>{title}</Button>
        `;
		assert.deepStrictEqual(parse(comp), {components: ['Button', 'StyledSpan'], props: ['handleClick', 'title', 'name']});
    });
    
    test('Self closing components', () => {
        const comp = `
            <Image src={image}/>
            <Modal/>
            <Modal />
        `;
		assert.deepStrictEqual(parse(comp), {components: ['Image', 'Modal'], props: ['image']});
    });
    
    test('No props', () => {
        const comp = `
            <View>
                <Text>Hello world</Text>
            </View>
        `;
        assert.deepStrictEqual(parse(comp), {components: ['View', 'Text'], props: undefined});
    });
    
    test('No react components', () => {
        const comp = `
            <div title={title}>
                <p>Hello world</p>
            </div>
        `;
        assert.deepStrictEqual(parse(comp), {components: undefined, props: ['title']});
    });

    test('No react components and props', () => {
        const comp = `
            <div>
                <p>Hello world</p>
            </div>
        `;
        assert.deepStrictEqual(parse(comp), {components: undefined, props: undefined});
    });

    test('Object prop', () => {
        const comp = `
            <div style={{backgroundColor: color}}>
                <p>Hello world</p>
            </div>
            <div style={{backgroundColor: 'red'}}>
                <p>Hello world</p>
            </div>
        `;
        assert.deepStrictEqual(parse(comp), {components: undefined, props: ['color']});
    });

    test('Ignore true', () => {
        const comp = `
            <button disabled={true} > Disabled button</button>
        `;
        assert.deepStrictEqual(parse(comp), {components: undefined, props: undefined});
    });

    test('Object property prop', () => {
        const comp = `
            <button error={errors.button} > Disabled button</button>
            <span error={styles.general.span} > Disabled button</button>

        `;
        assert.deepStrictEqual(parse(comp), {components: undefined, props: ['errors', 'styles']});
    });

    test('Template string prop', () => {
        const comp = `
            <Button title={\`Hello \${name}\`!} />
        `;
        assert.deepStrictEqual(parse(comp), {components: ['Button'], props: ['name']});
    });

    test('String prop', () => {
        const comp = `
            <Button title='hi' />
            <Button title="hi />
            <Input label={'hi'} />
            <Input label={"hi"} />
        `;
        assert.deepStrictEqual(parse(comp), {components: ['Button', 'Input'], props: undefined});
    });

});
