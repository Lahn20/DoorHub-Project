import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import '@/assets/styles/globals.css';
import AuthProvider from '@/components/AuthProvider';

export const metadata = {
    title: 'DoorPulse | Find the Perfect Rental',
    description: 'Find your dream rental property',
    keywords: 'rental, find rentals, find properties',
};

const MainLayout = ({ children }) => {
  return (
    <AuthProvider>
    <html lang='en'>
      <body>
        <Navbar></Navbar>
        <main>{children}</main>
        <Footer/>
      </body>
    </html>
    </AuthProvider>
  );
};

export default MainLayout