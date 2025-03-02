import { render, RenderOptions } from '@testing-library/react';
import { AuthProvider } from '../../lib/auth/AuthContext';
import { ReactElement } from 'react';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react';
export { customRender as render }; 