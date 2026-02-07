import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEmployee, deleteEmployee, getAttendance } from '../api';
import { Button, Table, StatusText } from '../components/ui';

function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: employee, isLoading: employeeLoading, error: employeeError } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => getEmployee(id!),
  });

  const { data: attendance, isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendance', 'employee', id],
    queryFn: () => getAttendance({ employee: id }),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteEmployee(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      navigate('/employees');
    },
  });

  if (employeeLoading) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-hierarchy-1">EMPLOYEE DETAILS</h1>
        </div>
        <StatusText type="loading" withCursor>LOADING</StatusText>
      </div>
    );
  }

  if (employeeError || !employee) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-hierarchy-1">EMPLOYEE DETAILS</h1>
        </div>
        <StatusText type="error">
          [ ERROR: FAILED TO LOAD EMPLOYEE ]
        </StatusText>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-hierarchy-1">EMPLOYEE DETAILS</h1>
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => navigate('/employees')}>
            [ BACK ]
          </Button>
          <Button onClick={() => navigate(`/employees/${id}/edit`)}>
            [ EDIT ]
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? '[ DELETING... ]' : '[ DELETE ]'}
          </Button>
        </div>
      </div>

      {/* Employee Information */}
      <div className="container-unibody mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-hierarchy-5 mb-1">EMPLOYEE ID</p>
            <p className="text-hierarchy-3">{employee.employee_id}</p>
          </div>
          <div>
            <p className="text-hierarchy-5 mb-1">FULL NAME</p>
            <p className="text-hierarchy-3">{employee.full_name}</p>
          </div>
          <div>
            <p className="text-hierarchy-5 mb-1">EMAIL</p>
            <p className="text-hierarchy-3">{employee.email}</p>
          </div>
          <div>
            <p className="text-hierarchy-5 mb-1">DEPARTMENT</p>
            <p className="text-hierarchy-3">{employee.department}</p>
          </div>
          <div>
            <p className="text-hierarchy-5 mb-1">CREATED AT</p>
            <p className="text-hierarchy-4">
              {new Date(employee.created_at).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-hierarchy-5 mb-1">UPDATED AT</p>
            <p className="text-hierarchy-4">
              {new Date(employee.updated_at).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Attendance History */}
      <div>
        <h2 className="text-hierarchy-2 mb-4">
          ATTENDANCE HISTORY
        </h2>

        {attendanceLoading ? (
          <StatusText type="loading" withCursor>LOADING</StatusText>
        ) : attendance && attendance.length === 0 ? (
          <StatusText type="info">[ NO ATTENDANCE RECORDS FOUND ]</StatusText>
        ) : (
          <div className="overflow-x-auto border border-border">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>DATE</Table.Head>
                <Table.Head>STATUS</Table.Head>
                <Table.Head>MARKED AT</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {attendance?.map((record) => (
                <Table.Row key={record.id}>
                  <Table.Cell>{record.date}</Table.Cell>
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

      {deleteMutation.isError && (
        <StatusText type="error" className="mt-4">
          [ ERROR: FAILED TO DELETE EMPLOYEE ]
        </StatusText>
      )}
    </div>
  );
}

export default EmployeeDetail;
