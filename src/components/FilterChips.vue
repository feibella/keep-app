<template>
  <div class="filter-wrap">
    <div class="filter-row">
      <button v-for="l in LEVELS"     :key="l" :class="chip('levels', l)"    @click="toggle('levels', l)">{{ l }}</button>
    </div>
    <div class="filter-row">
      <button v-for="t in TYPES"      :key="t" :class="chip('types', t)"     @click="toggle('types', t)">{{ t }}</button>
    </div>
    <div class="filter-row">
      <button v-for="b in BODY_PARTS" :key="b" :class="chip('bodyParts', b)" @click="toggle('bodyParts', b)">{{ b }}</button>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const emit = defineEmits(['change'])

const LEVELS     = ['K1', 'K2', 'K3', 'K4']
const TYPES      = ['HIIT', 'Tabata', '拉伸', '核心', '其他']
const BODY_PARTS = ['全身', '腰腹', '臀腿', '核心', '手臂']

const sel = reactive({ levels: [], types: [], bodyParts: [] })

function chip(dim, val) {
  return ['chip', sel[dim].includes(val) ? 'active' : '']
}
function toggle(dim, val) {
  const arr = sel[dim]
  const i = arr.indexOf(val)
  i === -1 ? arr.push(val) : arr.splice(i, 1)
  emit('change', { levels: [...sel.levels], types: [...sel.types], bodyParts: [...sel.bodyParts] })
}
</script>
