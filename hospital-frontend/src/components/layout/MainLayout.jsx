import { Outlet } from 'react-router-dom';

export const MainLayout = () => {
    return (
        <div className="flex bg-gray-50 min-h-screen">
            {/* Sidebar Placeholder */}
            <div className="w-64 bg-white border-r">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold text-primary-600">Hospital Portal</h2>
                </div>
            </div>
            
            <div className="flex-1 flex flex-col">
                {/* Navbar Placeholder */}
                <header className="bg-white border-b h-16 flex items-center px-6">
                    <div className="flex-1"></div>
                    <div>User Info Placeholder</div>
                </header>

                <main className="p-6 flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
