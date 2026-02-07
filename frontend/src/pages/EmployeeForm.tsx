import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEmployee, createEmployee, updateEmployee } from '../api';
import { Button, Input, StatusText } from '../components/ui';
import { useState, useEffect } from 'react';
import type { EmployeeCreate } from '../types';

function EmployeeForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<EmployeeCreate>({
    employee_id: '',
    full_name: '',
    email: '',
    department: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>('');

  // Fetch employee data if in edit mode
  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => getEmployee(id!),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        employee_id: employee.employee_id,
        full_name: employee.full_name,
        email: employee.email,
        department: employee.department,
      });
    }
  }, [employee]);

  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      navigate('/employees');
    },
    onError: (error: any) => {
      if (error.response?.data) {
        const errorData = error.response.data;
        const parsedErrors: Record<string, string> = {};
        
        // Handle Django error formats (arrays and strings)
        Object.keys(errorData).forEach((key) => {
          const value = errorData[key];
          if (Array.isArray(value)) {
            parsedErrors[key] = value[0]; // Take first error message
          } else if (typeof value === 'string') {
            parsedErrors[key] = value;
          }
        });
        
        // Handle non_field_errors or general errors
        if (parsedErrors.non_field_errors) {
          setGeneralError(parsedErrors.non_field_errors);
          delete parsedErrors.non_field_errors;
        }
        
        setErrors(parsedErrors);
      } else {
        setGeneralError('Failed to create employee');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: EmployeeCreate) => updateEmployee(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
      navigate(`/employees/${id}`);
    },
    onError: (error: any) => {
      if (error.response?.data) {
        const errorData = error.response.data;
        const parsedErrors: Record<string, string> = {};
        
        // Handle Django error formats (arrays and strings)
        Object.keys(errorData).forEach((key) => {
          const value = errorData[key];
          if (Array.isArray(value)) {
            parsedErrors[key] = value[0]; // Take first error message
          } else if (typeof value === 'string') {
            parsedErrors[key] = value;
          }
        });
        
        // Handle non_field_errors or general errors
        if (parsedErrors.non_field_errors) {
          setGeneralError(parsedErrors.non_field_errors);
          delete parsedErrors.non_field_errors;
        }
        
        setErrors(parsedErrors);
      } else {
        setGeneralError('Failed to update employee');
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');

    // Client-side validation and data cleaning
    const newErrors: Record<string, string> = {};
    
    // Trim all fields
    const trimmedData = {
      employee_id: formData.employee_id.trim().toUpperCase(),
      full_name: formData.full_name.trim(),
      email: formData.email.trim().toLowerCase(),
      department: formData.department.trim(),
    };

    // Validate Employee ID format (alphanumeric, hyphens, underscores only)
    if (trimmedData.employee_id && !/^[A-Za-z0-9_-]+$/.test(trimmedData.employee_id)) {
      newErrors.employee_id = 'Can only contain letters, numbers, hyphens, and underscores';
    }

    // Check for empty fields after trimming
    if (!trimmedData.employee_id) {
      newErrors.employee_id = 'Employee ID cannot be empty';
    }
    if (!trimmedData.full_name) {
      newErrors.full_name = 'Full name cannot be empty';
    }
    if (!trimmedData.email) {
      newErrors.email = 'Email cannot be empty';
    }
    if (!trimmedData.department) {
      newErrors.department = 'Department cannot be empty';
    }

    // Check email format
    if (trimmedData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (isEditMode) {
      updateMutation.mutate(trimmedData);
    } else {
      createMutation.mutate(trimmedData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  if (isEditMode && isLoading) {
    return (
      <div>
        <h1 className="text-hierarchy-1 mb-8">
          EDIT EMPLOYEE
        </h1>
        <StatusText type="loading" withCursor>LOADING</StatusText>
      </div>
    );
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <h1 className="text-hierarchy-1 mb-8">
        {isEditMode ? 'EDIT EMPLOYEE' : 'ADD EMPLOYEE'}
      </h1>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="space-y-6">
          <Input
            label="EMPLOYEE ID"
            name="employee_id"
            value={formData.employee_id}
            onChange={handleChange}
            placeholder="EMP-001"
            required
            error={errors.employee_id}
            disabled={isPending}
          />

          <Input
            label="FULL NAME"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="John Doe"
            required
            error={errors.full_name}
            disabled={isPending}
          />

          <Input
            label="EMAIL"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            required
            error={errors.email}
            disabled={isPending}
          />

          <Input
            label="DEPARTMENT"
            name="department"
            value={formData.department}
            onChange={handleChange}
            placeholder="Engineering"
            required
            error={errors.department}
            disabled={isPending}
          />

          <div className="flex gap-4 mt-8">
            <Button
              type="submit"
              variant="primary"
              disabled={isPending}
            >
              {isPending
                ? '[ SAVING... ]'
                : isEditMode
                ? '[ UPDATE EMPLOYEE ]'
                : '[ CREATE EMPLOYEE ]'}
            </Button>
            <Button
              type="button"
              onClick={() => navigate(isEditMode ? `/employees/${id}` : '/employees')}
              disabled={isPending}
            >
              [ CANCEL ]
            </Button>
          </div>

          {generalError && (
            <StatusText type="error">
              [ ERROR: {generalError.toUpperCase()} ]
            </StatusText>
          )}
          
          {(createMutation.isError || updateMutation.isError) && !generalError && Object.keys(errors).length === 0 && (
            <StatusText type="error">
              [ ERROR: FAILED TO {isEditMode ? 'UPDATE' : 'CREATE'} EMPLOYEE ]
            </StatusText>
          )}
        </div>
      </form>
    </div>
  );
}

export default EmployeeForm;
