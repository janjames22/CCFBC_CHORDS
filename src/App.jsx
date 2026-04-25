// filepath: src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import SongLibrary from './pages/SongLibrary';
import AddSong from './pages/AddSong';
import SongDetail from './pages/SongDetail';
import LineupList from './pages/LineupList';
import CreateLineup from './pages/CreateLineup';
import LineupView from './pages/LineupView';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/songs" element={<SongLibrary />} />
          <Route path="/songs/add" element={<AddSong />} />
          <Route path="/songs/edit/:id" element={<AddSong />} />
          <Route path="/songs/:id" element={<SongDetail />} />
          <Route path="/lineup" element={<LineupList />} />
          <Route path="/lineup/create" element={<CreateLineup />} />
          <Route path="/lineup/edit/:id" element={<CreateLineup />} />
          <Route path="/lineup/:id" element={<LineupView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
