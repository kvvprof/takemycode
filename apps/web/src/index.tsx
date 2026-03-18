import { QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import { App } from '@/app/app';
import { queryClient } from '@/configs/query-client';
import '@/styles/index.css';
import 'react-toastify/dist/ReactToastify.css';

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
    <ToastContainer
      autoClose={3000}
      closeOnClick
      newestOnTop
      position='top-right'
    />
  </QueryClientProvider>,
);
