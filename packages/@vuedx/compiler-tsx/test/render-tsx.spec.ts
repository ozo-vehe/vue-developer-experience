/// <reference types="jest" />
import { Options } from '../src/types';

const samples: Array<{ name: string; template: string; render: string; components?: Options['components'] }> = [
  {
    name: 'Render Context Type',
    template: `<div>foo</div>`,
    render: `
    import _Ctx from './component.vue?internal'

    export function render(_ctx: InstanceType<typeof _Ctx>) {
      return <div>foo</div>
    }
    `,
  },
  {
    name: 'Import Component',
    template: `<Foo>foo</Foo>`,
    components: { Foo: { path: './Foo.vue' } },
    render: `
    import _Ctx from './component.vue?internal'
    import Foo from './Foo.vue'

    export function render(_ctx: InstanceType<typeof _Ctx>) {
      return <Foo>{{ default: () => <>foo</> }}</Foo>
    }
    `,
  },
  {
    name: 'Named Import Component',
    template: `<Foo>foo</Foo>`,
    components: {
      Foo: {
        path: 'foo-components',
        named: true,
      },
    },
    render: `
    import _Ctx from './component.vue?internal'
    import { Foo } from 'foo-components'

    export function render(_ctx: InstanceType<typeof _Ctx>) {
      return <Foo>{{ default: () => <>foo</> }}</Foo>
    }
    `,
  },
  {
    name: 'Unresolved/Global Component',
    template: `<Foo>foo</Foo>`,
    render: `
    import _Ctx from './component.vue?internal'

    export function render(_ctx: InstanceType<typeof _Ctx>) {
      return <Foo>{{ default: () => <>foo</> }}</Foo>
    }
    `,
  },
  {
    name: 'Preserve Web Component',
    template: `<web-component>foo</web-component>`,
    render: `
    import _Ctx from './component.vue?internal'

    export function render(_ctx: InstanceType<typeof _Ctx>) {
      return <web-component>foo</web-component>
    }
    `,
  },
  {
    name: 'Attributes to Props',
    template: `
      <input type="text" />
      <Foo type="text" />
    `,
    render: `
    import _Ctx from './component.vue?internal'
    
    export function render(_ctx: InstanceType<typeof _Ctx>) {
      return (
        <>
          <input type="text" />
          <Foo type="text" />
        </>
      )
    }
    `,
  },
  {
    name: 'Rename v-on events',
    template: `
      <input @focus />
    `,
    render: `
    import _Ctx from './component.vue?internal'
    
    export function render(_ctx: InstanceType<typeof _Ctx>) {
      return <input  onFocus={() => {}} />
    }
    `,
  },
  {
    name: 'Rewrite expressions',
    template: `
      <div :style="style" :[key]="value" @hover="handleHover" @[event]="handleEvent">
        {{ hello }} world
      </div>
    `,
    render: `
    import _Ctx from './component.vue?internal'
    
    export function render(_ctx: InstanceType<typeof _Ctx>) {
      return <div  style={_ctx.style} {...{[_ctx.key]: _ctx.value}} onHover={_ctx.handleHover} {...{['on' + _ctx.event]: _ctx.handleEvent}}>
        {_ctx.hello} world{' '}
      </div>
    }
    `,
  },
  {
    name: 'Transform v-model',
    template: `<input v-model="foo" />`,
    render: `
    import _Ctx from './component.vue?internal'

    export function render(_ctx: InstanceType<typeof _Ctx>) {
      return <input modelValue={_ctx.foo} {...{'onUpdate:modelValue': $event => (_ctx.foo = $event)}} />
    }
    `,
  },
  {
    name: 'Transform v-model custom',
    template: `<input v-model:checked="foo" />`,
    render: `
    import _Ctx from './component.vue?internal'

    export function render(_ctx: InstanceType<typeof _Ctx>) {
      return <input checked={_ctx.foo} {...{'onUpdate:checked': $event => (_ctx.foo = $event)}} />
    }
    `,
  },
  {
    name: 'Transform v-model dynamic',
    template: `<input v-model:[checked]="foo" />`,
    render: `
    import _Ctx from './component.vue?internal'

    export function render(_ctx: InstanceType<typeof _Ctx>) {
      return <input {...{[_ctx.checked]: _ctx.foo}} {...{['onUpdate:'+_ctx.checked]: $event => (_ctx.foo = $event)}} />
    }
    `,
  },
  {
    name: 'Wrap event expressions',
    template: `<input @focus="bar = $event" />`,
    render: `
    import _Ctx from './component.vue?internal'

    export function render(_ctx: InstanceType<typeof _Ctx>) {
      return <input onFocus={$event => (_ctx.bar = $event)} />
    }
    `,
  },
  {
    name: 'Convert v-show to ternary',
    template: `<div style="color: red" v-show="isVisible"></div>`,
    render: `
    import _Ctx from './component.vue?internal'

    export function render(_ctx: InstanceType<typeof _Ctx>) {
      return <div style="color: red" __directiveShow={[_ctx.isVisible]}></div>
    }
    `,
  },
  {
    name: 'Convert v-if, v-else-if, v-else to ternary',
    template: `
    <div v-if="foo">A</div>
    <div v-else-if="bar">B</div>
    <div v-else>C</div>
    `,
    render: `
    import _Ctx from './component.vue?internal'

    export function render(_ctx: InstanceType<typeof _Ctx>) {
      return _ctx.foo ? <div>A</div> :
             _ctx.bar ? <div>B</div> : <div>C</div>
    }
    `,
  },
  {
    name: 'Convert v-if to ternary',
    template: `
    <div v-if="foo">A</div>
    `,
    render: `
    import _Ctx from './component.vue?internal'

    export function render(_ctx: InstanceType<typeof _Ctx>) {
      return _ctx.foo ? <div>A</div> : null
    }
    `,
  },
  {
    name: 'Convert v-for to renderList',
    template: `<div v-for="(item, index) of items">{{ item }} {{ other }}</div>`,
    render: `
    import { renderList as _renderList } from 'vue'
    import _Ctx from './component.vue?internal'

    export function render(_ctx: InstanceType<typeof _Ctx>) {
      return _renderList(_ctx.items, (item, index) => {
        return <div>{item} {_ctx.other}</div>
      })
    }
    `,
  },
  {
    name: 'Convert v-text/v-html to children',
    template: `
      <div v-text="foo" />
      <div v-html="foo" />
    `,
    render: `
    import _Ctx from './component.vue?internal'

    export function render(_ctx: InstanceType<typeof _Ctx>) {
      return (
        <>
          <div __directiveText={[_ctx.foo]}/>
          <div __directiveHtml={[_ctx.foo]}/>
        </>
      )
    }
    `,
  },
  {
    name: 'Custom directive',
    template: `
      <div v-known:arg.modifier="exp" />
      <div v-unknown:[arg].modifier="exp" />
    `,
    render: `
    import _Ctx from './component.vue?internal'

    export function render(_ctx: InstanceType<typeof _Ctx>) {
      return (
        <>
          <div __directiveKnown_arg={[_ctx.exp]} />
          <div __directiveUnknown__arg_={[_ctx.arg, _ctx.exp]} />
        </>
      )
    }
    `,
  },
];

import { compile } from '../src';
import { format } from 'prettier';

describe('compile/tsx', () => {
  test.each(samples.map((sample, index) => [index + 1 + '', sample.name, sample] as const))('%s. %s', (_, __, sample) => {
    const result = compile(sample.template, {
      filename: '/foo/bar/component.vue',
      components: sample.components,
    });

    const actual = prepare(result.code);
    const expected = prepare(sample.render);

    expect(actual).toEqual(expected);

    expect(result.expressions.map((args) => sample.template.substr(...args))).toMatchSnapshot();
    expect(
      result.mappings.map(
        ([generatedOffset, generatedLength, sourceOffset, sourceLength]) =>
          sample.template.substr(sourceOffset, sourceLength).padEnd(16, ' ') +
          '  => ' +
          result.code.substr(generatedOffset, generatedLength)
      )
    ).toMatchSnapshot();
  });
});

function prepare(source: string) {
  return format(trimIndent(source), {
    parser: 'typescript',
    singleQuote: false,
    semi: true,
    trailingComma: 'all',
    printWidth: 120,
  });
}

function trimIndent(source: string) {
  return source.replace(/([,{[(][\s]*)\n/g, (_, exp) => exp);
}