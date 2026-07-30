import './App.css';
import './i18n';
import './styles/animations.css';
import { Routes, Route } from 'react-router';
import { Login } from './components/login';
import { Home } from './home';
import { Fortress } from './components/fortress';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authstore';
import { ProtectedRoute } from './components/protectedroute';
import { Forbidden } from './components/forbidden';
import { FourOhFour } from './components/404';

function App() {
    const { loadUser, loadConfig } = useAuthStore();

    useEffect(() => {
        loadUser();
        loadConfig();
    }, [loadConfig, loadUser]);
    return (
        <>
            <title>Fortress</title>
            <Routes>
                <Route
                    path="/main"
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    }
                />
                <Route path="/forbidden" element={<Forbidden />} />
                <Route path="/loginpage" element={<Login />} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Fortress />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<FourOhFour />} />
            </Routes>
        </>
    );
}

export default App;
