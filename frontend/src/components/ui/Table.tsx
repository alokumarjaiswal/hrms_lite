import type { ReactNode } from 'react';

interface TableProps {
  children: ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children: ReactNode;
}

interface TableBodyProps {
  children: ReactNode;
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
}

interface TableHeadProps {
  children: ReactNode;
  className?: string;
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
}

function Table({ children, className = '' }: TableProps) {
  return (
    <table className={`table-terminal ${className}`}>
      {children}
    </table>
  );
}

function TableHeader({ children }: TableHeaderProps) {
  return <thead>{children}</thead>;
}

function TableBody({ children }: TableBodyProps) {
  return <tbody>{children}</tbody>;
}

function TableRow({ children, className = '' }: TableRowProps) {
  return <tr className={className}>{children}</tr>;
}

function TableHead({ children, className = '' }: TableHeadProps) {
  return <th className={className}>{children}</th>;
}

function TableCell({ children, className = '' }: TableCellProps) {
  return <td className={className}>{children}</td>;
}

// Export compound component
Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Head = TableHead;
Table.Cell = TableCell;

export default Table;
