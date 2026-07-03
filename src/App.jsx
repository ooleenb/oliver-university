import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, RequireAuth } from './auth.jsx'

import PortalLayout from './components/layout/PortalLayout.jsx'
import Home from './pages/Home.jsx'
import CourseFinder from './pages/Courses.jsx'
import ProgramDetail from './pages/ProgramDetail.jsx'
import About from './pages/About.jsx'
import News from './pages/News.jsx'
import NewsArticle from './pages/NewsArticle.jsx'
import Contact from './pages/Contact.jsx'
import ApplyNow from './pages/ApplyNow.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import EnrolComplete from './pages/EnrolComplete.jsx'

// 学生系统
import SystemLayout from './components/system/SystemLayout.jsx'
import Dashboard from './pages/system/Dashboard.jsx'
import Courses from './pages/system/Courses.jsx'
import Timetable from './pages/system/Timetable.jsx'
import Grades from './pages/system/Grades.jsx'

// 申请人
import ApplyLayout from './pages/apply/ApplyLayout.jsx'
import ApplyHome from './pages/apply/ApplyHome.jsx'
import Programs from './pages/apply/Programs.jsx'
import ApplicationDetail from './pages/apply/ApplicationDetail.jsx'
import Offers from './pages/apply/Offers.jsx'

// 招生办
import AdmissionsLayout from './pages/admissions/AdmissionsLayout.jsx'
import AdmissionsQueue from './pages/admissions/AdmissionsQueue.jsx'
import AdmissionsReview from './pages/admissions/AdmissionsReview.jsx'

// 管理员
import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminUsers from './pages/admin/AdminUsers.jsx'
import AdminPrograms from './pages/admin/AdminPrograms.jsx'
import AdminAudit from './pages/admin/AdminAudit.jsx'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* 公开门户 */}
        <Route element={<PortalLayout />}>
          <Route index element={<Home />} />
          <Route path="courses" element={<CourseFinder />} />
          <Route path="courses/:id" element={<ProgramDetail />} />
          <Route path="about" element={<About />} />
          <Route path="news" element={<News />} />
          <Route path="news/:id" element={<NewsArticle />} />
          <Route path="contact" element={<Contact />} />
          <Route path="apply-now" element={<ApplyNow />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 录取转学生：设置密码后回登录页 */}
        <Route
          path="/enrol"
          element={
            <RequireAuth roles={['student']}>
              <EnrolComplete />
            </RequireAuth>
          }
        />

        {/* 申请人门户 */}
        <Route
          path="/apply"
          element={
            <RequireAuth roles={['applicant', 'student']}>
              <ApplyLayout />
            </RequireAuth>
          }
        >
          <Route index element={<ApplyHome />} />
          <Route path="programs" element={<Programs />} />
          <Route path="offers" element={<Offers />} />
          <Route path="applications/:id" element={<ApplicationDetail />} />
        </Route>

        {/* 学生系统 */}
        <Route
          path="/portal"
          element={
            <RequireAuth roles={['student']}>
              <SystemLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="courses" element={<Courses />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="grades" element={<Grades />} />
        </Route>

        {/* 招生办 */}
        <Route
          path="/admissions"
          element={
            <RequireAuth roles={['admissions', 'admin']}>
              <AdmissionsLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdmissionsQueue />} />
          <Route path=":id" element={<AdmissionsReview />} />
        </Route>

        {/* 管理员 */}
        <Route
          path="/admin"
          element={
            <RequireAuth roles={['admin']}>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="programs" element={<AdminPrograms />} />
          <Route path="audit" element={<AdminAudit />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
