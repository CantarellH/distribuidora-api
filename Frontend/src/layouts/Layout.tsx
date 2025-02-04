import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex-shrink-0">
        <div className="p-4 font-bold text-xl">Sidebar</div>
        {/* Aquí irán los enlaces del menú */}
      </aside>

      {/* Contenido principal */}
      <div className="flex flex-col flex-grow">
        {/* Header */}
        <header className="bg-gray-700 text-white p-4">Header</header>

        {/* Contenido dinámico */}
        <main className="flex-grow bg-gray-100 p-4">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-gray-700 text-white text-center p-4">
          Footer
        </footer>
      </div>
    </div>
  );
};

export default Layout;
