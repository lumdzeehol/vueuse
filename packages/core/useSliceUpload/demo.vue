<script setup lang="ts">
import { computed, ref } from 'vue-demi'
import { isClient } from '@vueuse/shared'
import { useSliceUpload } from '@vueuse/core'

const file = ref()
const { slices, hash, upload } = useSliceUpload(file, {
  chunkSize: 20000,
  worker: {
    dependencies: [
      'https://cdn.jsdelivr.net/npm/spark-md5@3.0.2/spark-md5.min.js',
      // "https://cdn-adn-https.rayjump.com/cdn-adn/v2/portal/21/12/07/16/19/61af192bbe115.js",
    ],
  },
  hashFn: (file) => {
    return new Promise((resolve, reject) => {
      const spark = new SparkMD5.ArrayBuffer()
      const fileReader = new FileReader()

      fileReader.onloadend = function (e) {
        spark.append(e.target?.result)

        resolve(spark.end())
      }

      fileReader.onerror = function (e) {
        reject(e)
      }

      fileReader.readAsArrayBuffer(file)
    })
  },
})
const fileinput = ref<HTMLInputElement>()
const submit = () => {
  console.log(fileinput.value?.files?.[0])
  file.value = fileinput.value?.files?.[0]
}
const uploadLocal = () => {
  upload()
}
// const len = computed(() => {
//   return slices
// });
</script>

<template>
  <div>
    <input ref="fileinput" type="file" accept="*">
    <br>
    {{ hash }}
    <br>
    <p v-for="(item, index) in slices" :key="index">
      {{ `${item.index}` }}: {{ item.done }}
    </p>
    <button @click="submit">
      Submit
    </button>
    <button @click="uploadLocal">
      Upload
    </button>
  </div>
</template>
