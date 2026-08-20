import { Routes, Route } from 'react-router-dom';
import MainLayouts from '../layouts/MainLayouts';

import Home from '../pages/Home';
import About from '../pages/About';
import Services from '../pages/Service';
import Contact from '../pages/Contact';
import DashBoard from '../pages/DashBoard';
function AppRoutes(){
    return(
        <Routes>
            <Route element={<MainLayouts/>}>
            <Route path='/' element={<Home/>}/>
            <Route path='nosotros' element={<About/>}/>
            <Route path='servicios' element={<Services/>}/>
            <Route path='contacto' element={<Contact/>}/>
            <Route path='dashboard' element={<DashBoard/>}/>
           </Route>
        </Routes>
    );
}

export default AppRoutes