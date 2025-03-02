import { render, screen } from '../utils/test-utils';
import Members from '../../pages/members';
import { useRouter } from 'next/router';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

describe('Authentication Flow', () => {
  const mockRouter = {
    push: jest.fn()
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('redirects to sign-in when not authenticated', () => {
    render(<Members />);
    expect(mockRouter.push).toHaveBeenCalledWith('/auth/signin');
  });

  it('shows content when authenticated', () => {
    render(<Members />);
    expect(screen.getByText('Members Area')).toBeInTheDocument();
  });
}); 