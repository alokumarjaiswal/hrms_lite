import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEmployees, getAttendance, createAttendance, updateAttendance } from '../api';
import { Button, Input, Table, StatusText } from '../components/ui';
import type { Attendance } from '../types';

function AttendanceMarking() {
  // Get current date in IST
  const getISTDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  };

  const [selectedDate, setSelectedDate] = useState(getISTDate());
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: getEmployees,
  });

  const { data: attendanceRecords, isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendance', selectedDate],
    queryFn: () => getAttendance({ date: selectedDate }),
  });

  const markAttendanceMutation = useMutation({
    mutationFn: createAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', selectedDate] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] }); // Update total_present_days
      setErrorMessage('');
    },
    onError: (error: any) => {
      const errorData = error.response?.data;
      if (errorData) {
        // Extract error message from various Django formats
        if (typeof errorData === 'string') {
          setErrorMessage(errorData);
        } else if (errorData.detail) {
          setErrorMessage(errorData.detail);
        } else if (errorData.non_field_errors) {
          const msg = Array.isArray(errorData.non_field_errors) 
            ? errorData.non_field_errors[0] 
            : errorData.non_field_errors;
          setErrorMessage(msg);
        } else {
          // Get first error from any field
          const firstKey = Object.keys(errorData)[0];
          if (firstKey) {
            const msg = Array.isArray(errorData[firstKey]) 
              ? errorData[firstKey][0] 
              : errorData[firstKey];
            setErrorMessage(msg);
          } else {
            setErrorMessage('Failed to mark attendance');
          }
        }
      } else {
        setErrorMessage('Failed to mark attendance');
      }
    },
  });

  const updateAttendanceMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'PRESENT' | 'ABSENT' }) =>
      updateAttendance(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', selectedDate] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] }); // Update total_present_days
      setErrorMessage('');
    },
    onError: (error: any) => {
      const errorData = error.response?.data;
      if (errorData) {
        if (typeof errorData === 'string') {
          setErrorMessage(errorData);
        } else if (errorData.detail) {
          setErrorMessage(errorData.detail);
        } else {
          const firstKey = Object.keys(errorData)[0];
          if (firstKey) {
            const msg = Array.isArray(errorData[firstKey]) 
              ? errorData[firstKey][0] 
              : errorData[firstKey];
            setErrorMessage(msg);
          } else {
            setErrorMessage('Failed to update attendance');
          }
        }
      } else {
        setErrorMessage('Failed to update attendance');
      }
    },
  });

  const getAttendanceStatus = (employeeId: string): Attendance | undefined => {
    return attendanceRecords?.find((record) => record.employee === employeeId);
  };

  const handleMarkAttendance = (
    employeeId: string,
    status: 'PRESENT' | 'ABSENT'
  ) => {
    const existingRecord = getAttendanceStatus(employeeId);

    if (existingRecord) {
      // Update existing record
      updateAttendanceMutation.mutate({
        id: existingRecord.id,
        status,
      });
    } else {
      // Create new record
      markAttendanceMutation.mutate({
        employee: employeeId,
        date: selectedDate,
        status,
      });
    }
  };

  const isLoading = employeesLoading || attendanceLoading;
  const isMutating =
    markAttendanceMutation.isPending || updateAttendanceMutation.isPending;

  // Check if date is in the future (using IST)
  const isFutureDate = new Date(selectedDate) > new Date(getISTDate());

  if (employeesLoading || attendanceLoading) {
    return (
      <div>
        <h1 className="text-hierarchy-1 mb-8">
          MARK ATTENDANCE
        </h1>
        <StatusText type="loading" withCursor>LOADING</StatusText>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-hierarchy-1 mb-8">
        MARK ATTENDANCE
      </h1>

      <div className="mb-8 max-w-md">
        <Input
          type="date"
          label="SELECT DATE"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={getISTDate()}
        />
        {isFutureDate && (
          <StatusText type="error" className="mt-2">
            [ ERROR: CANNOT SELECT FUTURE DATE ]
          </StatusText>
        )}
      </div>

      {isLoading ? (
        <StatusText type="loading" withCursor>LOADING</StatusText>
      ) : employees && employees.length === 0 ? (
        <StatusText type="info">[ NO EMPLOYEES FOUND ]</StatusText>
      ) : (        <div className="overflow-x-auto border border-border">        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>EMPLOYEE ID</Table.Head>
              <Table.Head>FULL NAME</Table.Head>
              <Table.Head>DEPARTMENT</Table.Head>
              <Table.Head>STATUS</Table.Head>
              <Table.Head>ACTIONS</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {employees?.map((employee) => {
              const attendanceRecord = getAttendanceStatus(employee.id);
              const status = attendanceRecord?.status;

              return (
                <Table.Row key={employee.id}>
                  <Table.Cell>{employee.employee_id}</Table.Cell>
                  <Table.Cell>{employee.full_name}</Table.Cell>
                  <Table.Cell>{employee.department}</Table.Cell>
                  <Table.Cell>
                    {status ? (
                      <span
                        className={
                          status === 'PRESENT'
                            ? 'text-systemGreen'
                            : 'text-systemRed'
                        }
                      >
                        {status}
                      </span>
                    ) : (
                      <span className="text-systemYellow">UNMARKED</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="primary"
                        onClick={() => handleMarkAttendance(employee.id, 'PRESENT')}
                        disabled={isMutating || isFutureDate}
                        className={status === 'PRESENT' ? 'opacity-50' : ''}
                      >
                        [ PRESENT ]
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleMarkAttendance(employee.id, 'ABSENT')}
                        disabled={isMutating || isFutureDate}
                        className={status === 'ABSENT' ? 'opacity-50' : ''}
                      >
                        [ ABSENT ]
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
        </div>
      )}

      {errorMessage && (
        <StatusText type="error" className="mt-4">
          [ ERROR: {errorMessage.toUpperCase()} ]
        </StatusText>
      )}
      
      {(markAttendanceMutation.isError || updateAttendanceMutation.isError) && !errorMessage && (
        <StatusText type="error" className="mt-4">
          [ ERROR: FAILED TO MARK ATTENDANCE ]
        </StatusText>
      )}

      {isMutating && (
        <StatusText type="loading" className="mt-4" withCursor>
          SAVING
        </StatusText>
      )}
    </div>
  );
}

export default AttendanceMarking;
