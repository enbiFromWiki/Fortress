import './App.css';
import { Routes, Route } from 'react-router';
import { Login } from './login';
import { Home } from './home';
import { Overseer } from './components/overseer';

function App() {
    return (
        <Routes>
            <Route path="/main" element={<Home />} />
            <Route path="/loginpage" element={<Login />} />
            <Route path="/" element={<Overseer />} />
        </Routes>
    );
}

export default App;
