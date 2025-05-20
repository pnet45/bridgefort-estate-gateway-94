import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Home from './Home';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirecting to home page without changing URL
    // This keeps the URL at root ("/") but shows home content
  }, []);

  // Simply render Home component directly from Index
  return <Home />;
};

export default Index;
