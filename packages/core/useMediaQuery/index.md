# useMediaQuery

> The Browser provides features that can test the results of a [media query programmatically](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Testing_media_queries), via the MediaQueryList interface and its methods and properties. Once you've created a MediaQueryList object, you can check the result of the query or receive notifications when the result changes.

## Usage

```js
import { useMediaQuery } from '@vueuse/core'

const isLargeScreen = useMediaQuery('(min-width: 1024px)')
```

| State   | Type           | Description                  |
| ------- | -------------- | ---------------------------- |
| matches | `Ref<boolean>` | If the query matches or not. |