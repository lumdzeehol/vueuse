---
category: Browser
---

# useSliceUpload

Slice upload file func


## Usage

```js
import { useShare } from '@vueuse/core'

const { share, isSupported } = useShare()

function startShare() {
  share({
    title: 'Hello',
    text: 'Hello my friend!',
    url: location.href,
  })
}
```


### Passing a source ref

You can pass a `ref` to it, changes from the source ref will be reflected to your sharing options.

```js {7}
import { ref } from 'vue'

const shareOptions = ref < ShareOptions > ({ text: 'foo' })
const { share, isSupported } = useShare(shareOptions)

shareOptions.value.text = 'bar'

share()
```
