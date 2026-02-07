import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../api';
import { StatusText } from '../components/ui';
import { useState, useEffect } from 'react';

function Dashboard() {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format for Indian Standard Time (IST)
      const istTime = now.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setCurrentTime(istTime);
    };

    updateTime(); // Initial call
    const interval = setInterval(updateTime, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup
  }, []);

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardStats,
  });

  if (isLoading) {
    return (
      <div>
        <h1 className="text-hierarchy-1 mb-8">
          DASHBOARD
        </h1>
        <StatusText type="loading" withCursor>LOADING</StatusText>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-hierarchy-1 mb-8">
          DASHBOARD
        </h1>
        <StatusText type="error">
          [ ERROR: FAILED TO LOAD DASHBOARD DATA ]
        </StatusText>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-hierarchy-1 mb-8">
        DASHBOARD
      </h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="container-unibody">
          <p className="text-hierarchy-5 mb-2">TOTAL EMPLOYEES</p>
          <p className="text-hierarchy-1">{stats?.total_employees || 0}</p>
        </div>
        <div className="container-unibody">
          <p className="text-hierarchy-5 mb-2">PRESENT TODAY</p>
          <p className="text-hierarchy-1 text-systemGreen">
            {stats?.today_stats.present || 0}
          </p>
        </div>
        <div className="container-unibody">
          <p className="text-hierarchy-5 mb-2">ABSENT TODAY</p>
          <p className="text-hierarchy-1 text-systemRed">
            {stats?.today_stats.absent || 0}
          </p>
        </div>
        <div className="container-unibody">
          <p className="text-hierarchy-5 mb-2">UNMARKED TODAY</p>
          <p className="text-hierarchy-1 text-systemYellow">
            {stats?.today_stats.unmarked || 0}
          </p>
        </div>
      </div>

      <div className="container-unibody">
        <p className="text-hierarchy-5 mb-2">CURRENT TIME (IST)</p>
        <p className="text-hierarchy-3">{currentTime}</p>
      </div>

      <StatusText type="success" className="mt-8">
        [ STATUS: {error ? 'SYSTEM ERROR' : 'OPERATIONAL'} ]
      </StatusText>
    </div>
  );
}

export default Dashboard;
