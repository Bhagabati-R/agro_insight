import { Routes, Route, NavLink } from 'react-router-dom';
import InputPage from './pages/InputPage';
import ResultPage from './pages/ResultPage';
import ScanPage from './pages/ScanPage';

export default function App() {
  return (
    <div className='farm-bg'>
      <nav className='glass sticky top-0 z-50'>
        <div className='max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <span className='text-2xl sm:text-3xl animate-float inline-block'></span>
            <span className='text-white font-black text-base sm:text-xl tracking-wide'>
              Agro<span className='text-green-400'>Insight</span> AI
            </span>
          </div>
          <div className='flex gap-1 sm:gap-2'>
            <NavLink to='/' end className={({ isActive }) => isActive ? 'px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-green-500 text-white shadow-lg shadow-green-500/40' : 'px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-green-300 hover:bg-white/10 hover:text-white transition-all'}> Optimize</NavLink>
            <NavLink to='/scan' className={({ isActive }) => isActive ? 'px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-green-500 text-white shadow-lg shadow-green-500/40' : 'px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-green-300 hover:bg-white/10 hover:text-white transition-all'}> Scan</NavLink>
          </div>
        </div>
      </nav>
      <Routes>
        <Route path='/' element={<InputPage />} />
        <Route path='/results' element={<ResultPage />} />
        <Route path='/scan' element={<ScanPage />} />
      </Routes>
    </div>
  );
}
