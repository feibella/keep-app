export function filterCourses(courses, { levels, types, bodyParts }) {
  return courses.filter(c => {
    const levelOk  = levels.length    === 0 || levels.includes(c.level)
    const typeOk   = types.length     === 0 || types.includes(c.type)
    const bodyOk   = bodyParts.length === 0 || bodyParts.includes(c.bodyPart)
    return levelOk && typeOk && bodyOk
  })
}
