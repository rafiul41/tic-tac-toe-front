import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders wait for a while text during the app initiation', () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/Please wait while the app connects with server/i);
  expect(linkElement).toBeInTheDocument();
});
