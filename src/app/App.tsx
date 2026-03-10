import { RouterProvider } from 'react-router';
import { router } from './routes';
import { StoreToaster } from './components/StoreToaster';

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <StoreToaster />
    </>
  );
}
