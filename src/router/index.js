import { createRouter, createWebHashHistory } from 'vue-router'
import CourseList     from '../views/CourseList.vue'
import TrainingRecord from '../views/TrainingRecord.vue'
import CourseManage   from '../views/CourseManage.vue'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/',         redirect: '/courses' },
    { path: '/courses',  component: CourseList },
    { path: '/records',  component: TrainingRecord },
    { path: '/manage',   component: CourseManage },
  ]
})
