import { ref, unref, watch } from 'vue-demi'
import { toReactive, tryOnScopeDispose } from '@vueuse/shared'
import type { Awaitable, MaybeRef } from '@vueuse/shared'
import { useWebWorkerFn } from '../useWebWorkerFn'
import type { UseWebWorkerOptions } from '../useWebWorkerFn'
import { useFetch } from '../useFetch'
import type { UseFetchReturn } from '../useFetch'

type UseSliceUploadWorker = UseWebWorkerOptions | false
export interface UseSliceUpload {
  /**
       * CSS Selector for the target element applying to
       *
       * @default 'html'
       */
  parallel?: number
  chunkSize?: number
  /**
       * whether get file hash through WebWorker
       *
       * @default false
       */
  worker?: UseSliceUploadWorker
  hashFn?: (file: File) => Awaitable<string>

  uploader?: (chunk: Blob) => void
  immediate?: boolean
}

export function useSliceUpload(file: MaybeRef<File>, options: UseSliceUpload = {}) {
  const {
    // parallel = 5,
    chunkSize = 1000,
    worker = false,
    hashFn,
    immediate = false,
  } = options

  const hash = ref()

  const defaultFileIdentifier = (f: File) => f.name

  const fileIdentifierFn = hashFn ?? defaultFileIdentifier

  const { workerFn } = useWebWorkerFn(fileIdentifierFn, worker || undefined)

  // const requestList: Ref<any[]> = ref([])

  // const chunkList = ref<Array<{
  //   chunk: Blob
  //   index: number
  //   done: boolean
  //   progress: number
  // }>>([])

  // const isFinished = ref(false)
  const slices = ref<Array<{ chunk: Blob; index: number; done: boolean; fetcher?: UseFetchReturn<unknown> & PromiseLike<UseFetchReturn<unknown>> }>>([])

  watch(() => [unref(file)], () => {
    const rawFile = unref(file)
    if (!rawFile)
      return undefined
    const fileChunkList = []
    let currentIndex = 0
    let idx = 0
    while (currentIndex <= rawFile.size) {
      const chunk = rawFile.slice(currentIndex, currentIndex + chunkSize)

      const formData = new FormData()
      formData.append('file', chunk)
      const fetcher = useFetch('http://localhost:20000/upload', {}, {
        immediate: false,
        // afterFetch: (ctx) => {
        //   console.log('CTX')
        // }
      }).post(formData)
      const slice = toReactive({
        chunk,
        index: idx,
        done: false,
        fetcher,
      })
      fetcher.onFetchResponse(() => {
        slice.done = true
      })

      fileChunkList.push(toReactive(slice))
      currentIndex += chunkSize
      idx += 1
    }
    slices.value.splice(0, slices.value.length)
    // for (const fileChunk of fileChunkList) {
    // }
    slices.value = toReactive(fileChunkList)
  })

  const calFilehash = async () => {
    const f = unref(file)
    hash.value = worker ? await workerFn(f) : fileIdentifierFn(f)
  }

  watch(() => unref(file), () => calFilehash())

  tryOnScopeDispose(() => {
    slices.value.forEach(slice => slice.fetcher?.abort())
  })

  const upload = () => {
    for (const slice of unref(slices))
      slice?.fetcher?.execute()
  }
  if (immediate)
    upload()

  return {
    slices,
    hash,
    upload,
  }
}
