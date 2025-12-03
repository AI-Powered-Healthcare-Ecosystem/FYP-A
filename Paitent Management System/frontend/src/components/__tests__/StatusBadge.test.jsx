import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Simple StatusBadge component for testing
const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Improving':
        return 'bg-green-100 text-green-700';
      case 'Worsening':
        return 'bg-red-100 text-red-700';
      case 'Needs Review':
        return 'bg-orange-100 text-orange-700';
      case 'Stable':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <span 
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}
      data-testid="status-badge"
    >
      {status}
    </span>
  );
};

describe('StatusBadge Component', () => {
  describe('Rendering', () => {
    it('should render Improving status with green styling', () => {
      render(<StatusBadge status="Improving" />);
      
      const badge = screen.getByTestId('status-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('Improving');
      expect(badge).toHaveClass('bg-green-100', 'text-green-700');
    });

    it('should render Worsening status with red styling', () => {
      render(<StatusBadge status="Worsening" />);
      
      const badge = screen.getByTestId('status-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('Worsening');
      expect(badge).toHaveClass('bg-red-100', 'text-red-700');
    });

    it('should render Needs Review status with orange styling', () => {
      render(<StatusBadge status="Needs Review" />);
      
      const badge = screen.getByTestId('status-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('Needs Review');
      expect(badge).toHaveClass('bg-orange-100', 'text-orange-700');
    });

    it('should render Stable status with yellow styling', () => {
      render(<StatusBadge status="Stable" />);
      
      const badge = screen.getByTestId('status-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('Stable');
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-700');
    });

    it('should render unknown status with gray styling', () => {
      render(<StatusBadge status="Unknown" />);
      
      const badge = screen.getByTestId('status-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('Unknown');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-700');
    });
  });

  describe('Styling', () => {
    it('should have correct base classes', () => {
      render(<StatusBadge status="Improving" />);
      
      const badge = screen.getByTestId('status-badge');
      expect(badge).toHaveClass('inline-flex', 'items-center', 'px-2', 'py-1', 'rounded-full', 'text-xs', 'font-medium');
    });

    it('should be a span element', () => {
      render(<StatusBadge status="Stable" />);
      
      const badge = screen.getByTestId('status-badge');
      expect(badge.tagName).toBe('SPAN');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string status', () => {
      render(<StatusBadge status="" />);
      
      const badge = screen.getByTestId('status-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-700');
    });

    it('should handle null status', () => {
      render(<StatusBadge status={null} />);
      
      const badge = screen.getByTestId('status-badge');
      expect(badge).toBeInTheDocument();
    });

    it('should handle case-sensitive status', () => {
      render(<StatusBadge status="improving" />);
      
      const badge = screen.getByTestId('status-badge');
      // Should default to gray since it doesn't match exactly
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-700');
    });
  });
});
