import { render, screen } from '../utils/test-utils';
import Members from '../../pages/members';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/auth/AuthContext';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

// Mock auth context
jest.mock('../../lib/auth/AuthContext', () => ({
  useAuth: jest.fn()
}));

describe('Authentication Flow', () => {
  const mockRouter = {
    push: jest.fn()
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  it('redirects to sign-in when not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    render(<Members />);
    expect(mockRouter.push).toHaveBeenCalledWith('/auth/signin');
  });

  it('shows content when authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '1', email: 'test@example.com', name: 'Test User' }
    });
    render(<Members />);
    expect(screen.getByText(/members area/i)).toBeInTheDocument();
  });
}); 