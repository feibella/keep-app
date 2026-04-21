import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loadCourses, saveCourses } from '../utils/storage'

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export const useCoursesStore = defineStore('courses', () => {
  const courses = ref(loadCourses())

  function addCourse(data) {
    const course = { ...data, id: genId() }
    courses.value.push(course)
    saveCourses(courses.value)
  }

  function updateCourse(id, data) {
    const i = courses.value.findIndex(c => c.id === id)
    if (i !== -1) {
      courses.value[i] = { ...courses.value[i], ...data }
      saveCourses(courses.value)
    }
  }

  function deleteCourse(id) {
    courses.value = courses.value.filter(c => c.id !== id)
    saveCourses(courses.value)
  }

  return { courses, addCourse, updateCourse, deleteCourse }
})
