import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { Members } from '../../pages/members';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/auth/AuthContext';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock auth hook
jest.mock('../../lib/auth/AuthContext', () => ({
  ...jest.requireActual('../../lib/auth/AuthContext'),
  useAuth: jest.fn(),
}));

describe('Authentication Flow', () => {
  const mockRouter = {
    push: jest.fn(),
  };
  
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  it('redirects to sign-in when not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    });

    render(<Members />);
    expect(mockRouter.push).toHaveBeenCalledWith('/sign-in');
  });

  it('shows content when authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '1', email: 'test@example.com' },
      loading: false,
    });

    render(<Members />);
    expect(screen.getByText('Members Area')).toBeInTheDocument();
  });
}); 