import './App.css';
import './i18n';
import './styles/animations.css';
import { Routes, Route, useNavigate } from 'react-router';
import { Login } from './components/login';
import { Home } from './home';
import { Fortress } from './components/fortress';
import { useEffect } from 'react';
import { BadConfigError, useAuthStore } from './stores/authstore';
import { ProtectedRoute } from './components/protectedroute';
import { Forbidden } from './components/forbidden';
import { FourOhFour } from './components/404';
import { BadConfig } from './components/badConfig';
import { YAMLError, YAMLParseError } from 'yaml';

function App() {
    const { loadUser, loadConfig } = useAuthStore();
    const navigate = useNavigate();
    useEffect(() => {
        const init = async () => {
            loadUser();

            try {
                await loadConfig();
            } catch (e) {
                console.log('caught error:', e);

                if (
                    e instanceof BadConfigError ||
                    e instanceof YAMLParseError ||
                    e instanceof YAMLError
                ) {
                    navigate('/badconfig');
                }
            }
        };

        init();
    }, [loadConfig, loadUser, navigate]);
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
                <Route path="/badconfig" element={<BadConfig />} />
                <Route path="*" element={<FourOhFour />} />
            </Routes>
        </>
    );
}

export default App;
