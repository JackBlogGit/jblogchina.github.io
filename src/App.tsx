import { HashRouter, Routes, Route } from 'react-router-dom';
import GlassBackground from './components/GlassBackground';
import GlassShatter from './components/GlassShatter';
import Navbar from './components/Navbar';
import FloatingToolbar from './components/FloatingToolbar';
import PageTransition from './components/PageTransition';
import WelcomeModal from './components/WelcomeModal';
import Home from './pages/Home';
import Journal from './pages/Journal';
import TechStack from './pages/TechStack';
import Message from './pages/Message';
import ResourcesPage from './pages/ResourcesPage';
import Exhibition from './pages/Exhibition';
import ArticleDetail from './pages/ArticleDetail';
import TechArticleDetail from './pages/TechArticleDetail';
import About from './pages/About';
import Topics from './pages/Topics';
import Resources from './pages/Resources';
import Gallery from './pages/Gallery';
import SiteInfo from './pages/SiteInfo';
import Announcements from './pages/Announcements';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ArticleList from './pages/admin/ArticleList';
import ArticleEditor from './pages/admin/ArticleEditor';
import MediaLibrary from './pages/admin/MediaLibrary';
import Settings from './pages/admin/Settings';
import MessageManager from './pages/admin/MessageManager';
import AnnouncementManager from './pages/admin/AnnouncementManager';
import GalleryManager from './pages/admin/GalleryManager';
import ResourceManager from './pages/admin/ResourceManager';
import TechManager from './pages/admin/TechManager';
import { AppProvider } from './context/AppContext';
import './App.css';

function App() {
  return (
    <AppProvider>
      <HashRouter>
        <GlassBackground />
        <GlassShatter />
        <WelcomeModal />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Navbar />
          <FloatingToolbar />

          <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <PageTransition>
              <div style={{ height: '100%', overflow: 'auto' }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/journal" element={<Journal />} />
                  <Route path="/tech" element={<TechStack />} />
                  <Route path="/exhibition" element={<Exhibition />} />
                  <Route path="/resources" element={<ResourcesPage />} />
                  <Route path="/message" element={<Message />} />
                  <Route path="/article/:slug" element={<ArticleDetail />} />
                  <Route path="/tech/:slug" element={<TechArticleDetail />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/site-info" element={<SiteInfo />} />
                  <Route path="/announcements" element={<Announcements />} />
                  {/* hidden routes kept for direct links */}
                  <Route path="/topics" element={<Topics />} />
                  <Route path="/archive" element={<Resources />} />
                  <Route path="/gallery" element={<Gallery />} />
                  {/* Admin routes */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="articles" element={<ArticleList />} />
                    <Route path="articles/new" element={<ArticleEditor />} />
                    <Route path="articles/edit/:id" element={<ArticleEditor />} />
                    <Route path="messages" element={<MessageManager />} />
                    <Route path="announcements" element={<AnnouncementManager />} />
                    <Route path="gallery" element={<GalleryManager />} />
                    <Route path="resources" element={<ResourceManager />} />
                    <Route path="tech" element={<TechManager />} />
                    <Route path="media" element={<MediaLibrary />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                  <Route path="*" element={<Home />} />
                </Routes>
              </div>
            </PageTransition>
          </main>
        </div>
      </HashRouter>
    </AppProvider>
  );
}

export default App;
