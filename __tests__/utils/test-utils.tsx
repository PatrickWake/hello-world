import { render } from '@testing-library/react';
import { AuthProvider } from '../../lib/auth/AuthContext';
import { ReactNode } from 'react';

const AllTheProviders = ({ children }: { children: ReactNode }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};

const customRender = (ui: React.ReactElement, options = {}) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render }; 