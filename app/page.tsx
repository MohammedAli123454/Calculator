import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import SurfaceAreaCalculation from './SurfaceAreaCalculation/page';
export default function Home() {
  return (
    <div className="p-4">
      <SurfaceAreaCalculation/>
    </div>
  );
}