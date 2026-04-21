<template>
  <div>
    <div class="page">
      <div class="page-header"><h1>课程</h1></div>
    </div>

    <FilterChips @change="filters = $event" />

    <div class="course-list">
      <CourseCard
        v-for="c in filtered"
        :key="c.id"
        :course="c"
        @play="active = c"
      />
      <div v-if="!filtered.length" class="empty">
        {{ courseStore.courses.length ? '没有符合条件的课程' : '请先在「管理」页添加课程' }}
      </div>
    </div>

    <VideoPlayer v-if="active" :course="active" @close="active = null" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCoursesStore } from '../stores/courses'
import { filterCourses } from '../utils/filter'
import FilterChips from '../components/FilterChips.vue'
import CourseCard  from '../components/CourseCard.vue'
import VideoPlayer from '../components/VideoPlayer.vue'

const courseStore = useCoursesStore()
const filters = ref({ levels: [], types: [], bodyParts: [] })
const active  = ref(null)

const filtered = computed(() => filterCourses(courseStore.courses, filters.value))
</script>
