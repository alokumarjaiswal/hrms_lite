import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getEmployees, deleteEmployee } from '../api';
import { Button, Table, StatusText } from '../components/ui';
import { useState } from 'react';

function EmployeeList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: employees, isLoading, error } = useQuery({
    queryKey: ['employees'],
    queryFn: getEmployees,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setDeleteId(null);
    },
  });

  const handleDelete = (id: string) => {
    if (deleteId === id) {
      deleteMutation.mutate(id);
    } else {
      setDeleteId(id);
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-hierarchy-1">EMPLOYEES</h1>
        </div>
        <StatusText type="loading" withCursor>LOADING</StatusText>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-hierarchy-1">EMPLOYEES</h1>
        </div>
        <StatusText type="error">
          [ ERROR: FAILED TO LOAD EMPLOYEES ]
        </StatusText>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-hierarchy-1">EMPLOYEES</h1>
        <Button variant="primary" onClick={() => navigate('/employees/new')}>
          [ + ADD EMPLOYEE ]
        </Button>
      </div>

      {employees && employees.length === 0 ? (
        <StatusText type="info">[ NO EMPLOYEES FOUND ]</StatusText>
      ) : (
        <div className="overflow-x-auto border border-border">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>EMPLOYEE ID</Table.Head>
              <Table.Head>FULL NAME</Table.Head>
              <Table.Head>EMAIL</Table.Head>
              <Table.Head>DEPARTMENT</Table.Head>
              <Table.Head>TOTAL PRESENT DAYS</Table.Head>
              <Table.Head>ACTIONS</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {employees?.map((employee) => (
              <Table.Row key={employee.id}>
                <Table.Cell>{employee.employee_id}</Table.Cell>
                <Table.Cell>{employee.full_name}</Table.Cell>
                <Table.Cell>{employee.email}</Table.Cell>
                <Table.Cell>{employee.department}</Table.Cell>
                <Table.Cell>{employee.total_present_days ?? 0}</Table.Cell>
                <Table.Cell>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => navigate(`/employees/${employee.id}`)}
                      className="text-systemBlue hover:text-[#409cff]! hover:underline transition-colors"
                    >
                      [ VIEW ]
                    </button>
                    <button
                      onClick={() => navigate(`/employees/${employee.id}/edit`)}
                      className="text-text hover:text-systemGray! hover:underline transition-colors"
                    >
                      [ EDIT ]
                    </button>
                    <button
                      onClick={() => handleDelete(employee.id)}
                      className="text-systemRed hover:text-[#ff6961]! hover:underline transition-colors"
                      disabled={deleteMutation.isPending}
                    >
                      {deleteId === employee.id && !deleteMutation.isPending
                        ? '[ CONFIRM DELETE? ]'
                        : deleteMutation.isPending && deleteId === employee.id
                        ? '[ DELETING... ]'
                        : '[ DELETE ]'}
                    </button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        </div>
      )}

      {deleteMutation.isError && (
        <StatusText type="error" className="mt-4">
          [ ERROR: FAILED TO DELETE EMPLOYEE ]
        </StatusText>
      )}
    </div>
  );
}

export default EmployeeList;
