import './App.css';
import { Routes, Route } from 'react-router';
import { Login } from './login';
import { Home } from './home';
import { Overseer } from './components/overseer';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authstore';
import { ProtectedRoute } from './components/protectedroute';

function App() {
    const init = useAuthStore((i) => i.init);

    useEffect(() => {
        init();
    }, [init]);
    return (
        <Routes>
            <Route
                path="/main"
                element={
                    <ProtectedRoute>
                        <Home />
                    </ProtectedRoute>
                }
            />
            <Route path="/loginpage" element={<Login />} />
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Overseer />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

export default App;
