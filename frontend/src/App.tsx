import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard.tsx';
import EmployeeList from './pages/EmployeeList.tsx';
import EmployeeForm from './pages/EmployeeForm.tsx';
import EmployeeDetail from './pages/EmployeeDetail.tsx';
import AttendanceMarking from './pages/AttendanceMarking.tsx';
import BulkAttendance from './pages/BulkAttendance.tsx';
import AttendanceReports from './pages/AttendanceReports.tsx';
import NotFound from './pages/NotFound.tsx';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/employees" element={<EmployeeList />} />
          <Route path="/employees/new" element={<EmployeeForm />} />
          <Route path="/employees/:id" element={<EmployeeDetail />} />
          <Route path="/employees/:id/edit" element={<EmployeeForm />} />
          <Route path="/attendance" element={<AttendanceMarking />} />
          <Route path="/attendance/bulk" element={<BulkAttendance />} />
          <Route path="/attendance/reports" element={<AttendanceReports />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
