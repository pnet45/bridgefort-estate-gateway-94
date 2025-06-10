
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProfileForm from '@/components/profile/ProfileForm';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-28 pb-12">
        <ProfileForm />
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
