import Hero from '../components/portal/Hero.jsx'
import CourseSearch from '../components/portal/CourseSearch.jsx'
import StudyAreas from '../components/portal/StudyAreas.jsx'
import Stats from '../components/portal/Stats.jsx'
import NewsGroup from '../components/portal/NewsGroup.jsx'

export default function Home() {
  return (
    <>
      <Hero />
      <CourseSearch />
      <StudyAreas />
      <Stats />
      <NewsGroup />
    </>
  )
}
