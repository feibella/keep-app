<template>
  <div class="course-card">
    <div class="course-meta">
      <span class="badge badge-level">{{ course.level }}</span>
      <span class="badge badge-type">{{ course.type }}</span>
      <span class="badge badge-body">{{ course.bodyPart }}</span>
      <span class="course-duration">{{ course.durationMin }}分钟</span>
    </div>
    <div class="course-name">{{ course.name }}</div>
    <button class="btn-play" @click="emit('play', course)">开始训练</button>
  </div>
</template>

<script setup>
defineProps({ course: Object })
const emit = defineEmits(['play'])
</script>
