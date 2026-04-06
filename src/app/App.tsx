import { RouterProvider } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';
import { router } from './routes';
import { StoreToaster } from './components/StoreToaster';
import { ChatWidget } from './components/chat/ChatWidget';

export default function App() {
  return (
    <HelmetProvider>
      <RouterProvider router={router} />
      <StoreToaster />
      <ChatWidget />
    </HelmetProvider>
  );
}
