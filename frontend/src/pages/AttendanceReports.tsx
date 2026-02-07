import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAttendance } from '../api';
import { Input, Table, StatusText, Button } from '../components/ui';

function AttendanceReports() {
  // Get current date in IST
  const getISTDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  };

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT'>('ALL');
  const [hasSearched, setHasSearched] = useState(false);

  const { data: attendance, isLoading, error, refetch } = useQuery({
    queryKey: ['attendance', 'reports', startDate, endDate, statusFilter],
    queryFn: () => {
      const params: any = {};
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      return getAttendance(params);
    },
    enabled: false, // Manual fetch
  });

  const handleSearch = () => {
    setHasSearched(true);
    refetch();
  };

  // Auto-refetch when status filter changes after initial search
  useEffect(() => {
    if (hasSearched) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const filteredData = attendance?.filter((record) => {
    if (!startDate && !endDate) return true;
    const recordDate = new Date(record.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && end) {
      return recordDate >= start && recordDate <= end;
    } else if (start) {
      return recordDate >= start;
    } else if (end) {
      return recordDate <= end;
    }
    return true;
  });

  const stats = filteredData
    ? {
        total: filteredData.length,
        present: filteredData.filter((r) => r.status === 'PRESENT').length,
        absent: filteredData.filter((r) => r.status === 'ABSENT').length,
      }
    : { total: 0, present: 0, absent: 0 };

  return (
    <div>
      <h1 className="text-hierarchy-1 mb-8">
        ATTENDANCE REPORTS
      </h1>

      {/* Filters */}
      <div className="container-unibody mb-8">
        <h2 className="text-hierarchy-2 mb-4">FILTERS</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input
            type="date"
            label="FROM DATE"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            max={getISTDate()}
          />
          <Input
            type="date"
            label="TO DATE"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            max={getISTDate()}
          />
          <div>
            <div className="block mb-2 text-hierarchy-4 uppercase">
              STATUS FILTER
            </div>
            <div className="flex flex-wrap gap-2">
              {(['ALL', 'PRESENT', 'ABSENT'] as const).map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'primary' : 'default'}
                  onClick={() => setStatusFilter(status)}
                >
                  [ {status} ]
                </Button>
              ))}
            </div>
          </div>
        </div>
        <Button variant="primary" onClick={handleSearch}>
          [ SEARCH ]
        </Button>
      </div>

      {/* Statistics */}
      {attendance && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="container-unibody">
            <p className="text-hierarchy-5 mb-2">TOTAL RECORDS</p>
            <p className="text-hierarchy-1">{stats.total}</p>
          </div>
          <div className="container-unibody">
            <p className="text-hierarchy-5 mb-2">PRESENT</p>
            <p className="text-hierarchy-1 text-systemGreen">{stats.present}</p>
          </div>
          <div className="container-unibody">
            <p className="text-hierarchy-5 mb-2">ABSENT</p>
            <p className="text-hierarchy-1 text-systemRed">{stats.absent}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <StatusText type="loading" withCursor>LOADING</StatusText>
      ) : error ? (
        <StatusText type="error">
          [ ERROR: FAILED TO LOAD ATTENDANCE RECORDS ]
        </StatusText>
      ) : !attendance ? (
        <StatusText type="info">
          [ SELECT DATE RANGE AND CLICK SEARCH TO VIEW REPORTS ]
        </StatusText>
      ) : filteredData && filteredData.length === 0 ? (
        <StatusText type="info">
          [ NO ATTENDANCE RECORDS FOUND FOR SELECTED CRITERIA ]
        </StatusText>
      ) : (
        <div className="overflow-x-auto border border-border">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>DATE</Table.Head>
              <Table.Head>EMPLOYEE ID</Table.Head>
              <Table.Head>EMPLOYEE NAME</Table.Head>
              <Table.Head>STATUS</Table.Head>
              <Table.Head>MARKED AT</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredData?.map((record) => (
              <Table.Row key={record.id}>
                <Table.Cell>{record.date}</Table.Cell>
                <Table.Cell>{record.employee_id}</Table.Cell>
                <Table.Cell>{record.employee_name}</Table.Cell>
                <Table.Cell>
                  <span
                    className={
                      record.status === 'PRESENT'
                        ? 'text-systemGreen'
                        : 'text-systemRed'
                    }
                  >
                    {record.status}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  {new Date(record.created_at).toLocaleString()}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        </div>
      )}
    </div>
  );
}

export default AttendanceReports;
