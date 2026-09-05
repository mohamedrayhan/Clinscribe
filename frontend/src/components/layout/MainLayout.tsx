import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout = () => {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-8 py-8 lg:px-12 lg:py-10">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
