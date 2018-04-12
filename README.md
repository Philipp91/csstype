# CSSType

TypeScript and Flow definitions for CSS, generated by [data from MDN](https://github.com/mdn/data). It provides autocompletion and type checking for CSS properties and values.

```ts
import * as CSS from 'csstype';

const style: CSS.Properties = {
  alignSelf: 'stretsh', // Type error on value
  colour: 'white', // Type error on property
};
```

## Getting started

```sh
$ npm install csstype
$ # or
$ yarn add csstype
```

## Table of content

* [Style types](#style-types)
  * [`Properties`](#properties)
  * [`PropertiesHyphen`](#propertieshyphen)
  * [`PropertiesFallback`](#propertiesfallback)
  * [`PropertiesHyphenFallback`](#propertieshyphenfallback)
* [At-rule types](#at-rule-types)
  * [`@counter-style`](#counter-style)
  * [`@font-face`](#font-face)
  * [`@page`](#page)
  * [`@viewport`](#viewport)
* [Pseudo types](#pseudo-types)
* [Usage](#usage)
* [What should I do when I get type errors?](#what-should-i-do-when-i-get-type-errors)
* [Version 2.0](#version-20)

## Style types

All properties are categorized in different uses and in several technical variations to provide the type that suits as many as possible.

Categories:

* `Standard` - Current properties
* `Vendor` - Vendor prefixed properties
* `Obsolete` - Removed or deprecated properties
* `Svg` - SVG-specific properties

Variations:

* _Default variation_ - JavaScript default (camel) cased property names
* `Hyphen` - CSS default (kebab) cased property names
* `Fallback` - Accepts array of values e.g. `string | string[]`

All interfaces has one optional generic argument to define length. It defaults to `string | 0` because `0` is the [only unitless length](https://www.w3.org/TR/REC-CSS2/syndata.html#length-units) by default. You can specify this, e.g. `string | number`, for platforms and libraries that accepts any numeric value with a specific unit.

### `Properties`

CSS properties interface with **camel** cased property names:

Extends:

* `StandardProperties`
  * `StandardLonghandProperties`
  * `StandardShorthandProperties`
* `VendorProperties`
  * `VendorLonghandProperties`
  * `VendorShorthandProperties`
* `ObsoleteProperties`
* `SvgProperties`

### `PropertiesHyphen`

CSS properties interface with **kebab** cased property names:

Extends:

* `StandardPropertiesHyphen`
  * `StandardLonghandPropertiesHyphen`
  * `StandardShorthandPropertiesHyphen`
* `VendorPropertiesHyphen`
  * `VendorLonghandPropertiesHyphen`
  * `VendorShorthandPropertiesHyphen`
* `ObsoletePropertiesHyphen`
* `SvgPropertiesHyphen`

### `PropertiesFallback`

Equals to **`Properties`** but also allows array of values:

Extends:

* `StandardPropertiesFallback`
  * `StandardLonghandPropertiesFallback`
  * `StandardShorthandPropertiesFallback`
* `VendorPropertiesFallback`
  * `VendorLonghandPropertiesFallback`
  * `VendorShorthandPropertiesFallback`
* `ObsoletePropertiesFallback`
* `SvgPropertiesFallback`

### `PropertiesHyphenFallback`

Equals to **`PropertiesHyphen`** but also allows array of values:

Extends:

* `StandardPropertiesHyphenFallback`
  * `StandardLonghandPropertiesHyphenFallback`
  * `StandardShorthandPropertiesHyphenFallback`
* `VendorPropertiesHyphenFallback`
  * `VendorLonghandPropertiesHyphenFallback`
  * `VendorShorthandPropertiesHyphenFallback`
* `ObsoletePropertiesHyphenFallback`
* `SvgPropertiesHyphenFallback`

## At-rule types

At-rule interfaces with descriptors.

### `@counter-style`

* `CounterStyle`
* `CounterStyleFallback`
* `CounterStyleHyphen`
* `CounterStyleHyphenFallback`

### `@font-face`

* `FontFace`
* `FontFaceFallback`
* `FontFaceHyphen`
* `FontFaceHyphenFallback`

### `@page`

* `Page`
* `PageFallback`
* `PageHyphen`
* `PageHyphenFallback`

### `@viewport`

* `Viewport`
* `ViewportFallback`
* `ViewportHyphen`
* `ViewportHyphenFallback`

## Pseudo types

String literals of pseudo classes and pseudo elements

* `Pseudos`
  * `AdvancedPseudos` Function-like pseudos like `:not(...)`
  * `SimplePseudos`

## Usage

Length defaults to `string | 0`. But it's possible to override it using generics.

```ts
import * as CSS from 'csstype';

const style: CSS.Properties<string | number> = {
  padding: 10,
  margin: '1rem',
};
```

In some cases, like for CSS-in-JS libraries, an array of values is a way to provide fallback values in CSS. Using `CSS.PropertiesFallback` instead of `CSS.Properties` will add the possibility to use any property value as an array of values.

```ts
import * as CSS from 'csstype';

const style: CSS.PropertiesFallback = {
  display: ['-webkit-flex', 'flex'],
  color: 'white',
};
```

There's even string literals for pseudo selectors and elements.

```ts
import * as CSS from 'csstype';

const pseudos: { [P in CSS.SimplePseudos]?: CSS.Properties } = {
  ':hover': {
    display: 'flex',
  },
};
```

Hyphen cased (kebab cased) properties are provided in `CSS.PropertiesHyphen` and `CSS.PropertiesHyphenFallback`. It's not **not** added by default in `CSS.Properties`. To allow both of them, you can simply extend with `CSS.PropertiesHyphen` or/and `CSS.PropertiesHyphenFallback`.

```ts
import * as CSS from 'csstype';

interface Style extends CSS.Properties, CSS.PropertiesHyphen {}

const style: Style = {
  'flex-grow': 1,
  'flex-shrink': 0,
  'font-weight': 'normal',
  backgroundColor: 'white',
};
```

## What should I do when I get type errors?

The goal is to have as perfect types as possible and we're trying to do our best. But with CSS Custom Properties, the CSS specification changing frequently and vendors implementing their own specifications with new releases sometimes causes type errors even if it should work. Here's some steps you could take to get it fixed:

_If you're using CSS Custom Properties you can step directly to step 3._

1.  **First of all, make sure you're doing it right.** A type error could also indicate that you're not :wink:
2.  **Have a look in [issues](https://github.com/frenic/csstype/issues) to see if an issue already has been filed. If not, create a new one.** To help us out, please refer to any information you have found.
3.  Fix the issue locally with **TypeScript** (Flow further down):

    * The recommended way is to use **module augmentation**. Here's a few examples:

      ```ts
      // My css.d.ts file
      import * as CSS from 'csstype';

      declare module 'csstype' {
        interface Properties {
          // Add a missing property
          WebkitRocketLauncher?: string;

          // Add a CSS Custom Property
          '--theme-color'?: 'black' | 'white';

          // ...or allow any other property
          [index: string]: any;
        }
      }
      ```

    * The alternative is also to use **type assertion**. Here's a few examples:

      ```ts
      const style: CSS.Properties = {
        // Add a missing property
        ['WebkitRocketLauncher' as any]: 'launching',

        // Add a CSS Custom Property
        ['--theme-color' as any]: 'black',
      };
      ```

    Fix the issue locally with **Flow**:

    * Use **type assertion**. Here's a few examples:

      ```js
      const style: $Exact<CSS.Properties<*>> = {
        // Add a missing property
        [('WebkitRocketLauncher': any)]: 'launching',

        // Add a CSS Custom Property
        [('--theme-color': any)]: 'black',
      };
      ```

## Version 2.0

The casing of CSS vendor properties are changed matching the casing of prefixes in Javascript. So all of them are capitalized except for `ms`.

* `msOverflowStyle` is still `msOverflowStyle`
* `mozAppearance` is now `MozAppearance`
* `webkitOverflowScrolling` is now `WebkitOverflowScrolling`

More info: https://www.andismith.com/blogs/2012/02/modernizr-prefixed/
