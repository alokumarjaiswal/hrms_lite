import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEmployees, getAttendance, createAttendance } from '../api';
import { Button, Input, StatusText } from '../components/ui';

function BulkAttendance() {
  // Get current date in IST
  const getISTDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  };

  const [selectedDate, setSelectedDate] = useState(getISTDate());
  const [isMarking, setIsMarking] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const queryClient = useQueryClient();

  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: getEmployees,
  });

  const { data: attendanceRecords } = useQuery({
    queryKey: ['attendance', selectedDate],
    queryFn: () => getAttendance({ date: selectedDate }),
  });

  const markAttendanceMutation = useMutation({
    mutationFn: createAttendance,
  });

  const getUnmarkedEmployees = () => {
    if (!employees || !attendanceRecords) return [];
    const markedEmployeeIds = attendanceRecords.map((record) => record.employee);
    return employees.filter((emp) => !markedEmployeeIds.includes(emp.id));
  };

  const handleBulkMark = async (status: 'PRESENT' | 'ABSENT') => {
    const unmarked = getUnmarkedEmployees();
    if (unmarked.length === 0) return;

    setIsMarking(true);
    setProgress({ current: 0, total: unmarked.length });

    for (let i = 0; i < unmarked.length; i++) {
      try {
        await markAttendanceMutation.mutateAsync({
          employee: unmarked[i].id,
          date: selectedDate,
          status,
        });
        setProgress({ current: i + 1, total: unmarked.length });
      } catch (error) {
        console.error('Failed to mark attendance for:', unmarked[i].employee_id);
      }
    }

    setIsMarking(false);
    queryClient.invalidateQueries({ queryKey: ['attendance', selectedDate] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const unmarkedCount = getUnmarkedEmployees().length;
  const markedCount = attendanceRecords?.length || 0;
  const totalCount = employees?.length || 0;
  const isFutureDate = new Date(selectedDate) > new Date(getISTDate());

  if (employeesLoading) {
    return (
      <div>
        <h1 className="text-hierarchy-1 mb-8">
          BULK ATTENDANCE MARKING
        </h1>
        <StatusText type="loading" withCursor>LOADING</StatusText>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-hierarchy-1 mb-8">
        BULK ATTENDANCE MARKING
      </h1>

      <div className="mb-8 max-w-md">
        <Input
          type="date"
          label="SELECT DATE"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={getISTDate()}
          disabled={isMarking}
        />
        {isFutureDate && (
          <StatusText type="error" className="mt-2">
            [ ERROR: CANNOT SELECT FUTURE DATE ]
          </StatusText>
        )}
      </div>

      {employeesLoading ? (
        <StatusText type="loading" withCursor>LOADING</StatusText>
      ) : (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="container-unibody">
              <p className="text-hierarchy-5 mb-2">TOTAL EMPLOYEES</p>
              <p className="text-hierarchy-1">{totalCount}</p>
            </div>
            <div className="container-unibody">
              <p className="text-hierarchy-5 mb-2">MARKED</p>
              <p className="text-hierarchy-1 text-systemGreen">{markedCount}</p>
            </div>
            <div className="container-unibody">
              <p className="text-hierarchy-5 mb-2">UNMARKED</p>
              <p className="text-hierarchy-1 text-systemYellow">{unmarkedCount}</p>
            </div>
          </div>

          {/* Bulk Actions */}
          {unmarkedCount > 0 ? (
            <div className="container-unibody mb-8">
              <h2 className="text-hierarchy-2 mb-4">BULK ACTIONS</h2>
              <p className="text-hierarchy-4 mb-4">
                MARK ALL {unmarkedCount} UNMARKED EMPLOYEES AS:
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="primary"
                  onClick={() => handleBulkMark('PRESENT')}
                  disabled={isMarking || isFutureDate}
                >
                  [ MARK ALL PRESENT ]
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleBulkMark('ABSENT')}
                  disabled={isMarking || isFutureDate}
                >
                  [ MARK ALL ABSENT ]
                </Button>
              </div>
            </div>
          ) : (
            <StatusText type="success" className="mb-8">
              [ ALL EMPLOYEES MARKED FOR {selectedDate} ]
            </StatusText>
          )}

          {/* Progress */}
          {isMarking && (
            <div className="container-unibody">
              <StatusText type="loading" withCursor>
                MARKING: {progress.current}/{progress.total} EMPLOYEES
              </StatusText>
              <div className="mt-4 h-2 bg-border">
                <div
                  className="h-full bg-systemBlue transition-all duration-300"
                  style={{
                    width: `${(progress.current / progress.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {!isMarking && progress.current > 0 && (
            <StatusText type="success" className="mt-4">
              [ BULK MARKING COMPLETE: {progress.current}/{progress.total} ]
            </StatusText>
          )}
        </>
      )}
    </div>
  );
}

export default BulkAttendance;
