import React, { useState, useEffect, useContext } from 'react';
import './index.min.css';
import { useNavigate, useParams } from 'react-router-dom';
import boardContext from '../../store/board-context';
import { getUserCanvases, getSharedCanvases, createCanvas, deleteCanvas, shareCanvas } from '../../utils/api';

const Sidebar = () => {
  const [canvases, setCanvases] = useState([]);
  const [sharedCanvases, setSharedCanvases] = useState([]);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [activeTab, setActiveTab] = useState('my-canvases');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { canvasId, setCanvasId, setElements, setHistory, isUserLoggedIn, setUserLoginStatus } = useContext(boardContext);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (isUserLoggedIn) {
      fetchCanvases();
      fetchSharedCanvases();
    }
  }, [isUserLoggedIn]);

  const fetchCanvases = async () => {
    try {
      const list = await getUserCanvases();
      setCanvases(list);
    } catch (err) {
      if (err?.response?.status === 401) { handleLogout(); }
    }
  };

  const fetchSharedCanvases = async () => {
    try {
      const list = await getSharedCanvases();
      setSharedCanvases(list);
    } catch (err) { /* silent */ }
  };

  const handleCreateCanvas = async () => {
    try {
      const data = await createCanvas();
      const newId = data.canvasId || data._id;
      await fetchCanvases();
      navigate(`/whiteboard/${newId}`);
    } catch (err) {
      if (err?.response?.status === 401) handleLogout();
    }
  };

  const handleDeleteCanvas = async (e, cId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this canvas?')) return;
    try {
      await deleteCanvas(cId);
      const remaining = canvases.filter(c => c._id !== cId);
      setCanvases(remaining);
      if (id === cId) {
        if (remaining.length > 0) navigate(`/whiteboard/${remaining[0]._id}`);
        else navigate('/dashboard');
      }
    } catch { alert('Failed to delete'); }
  };

  const handleShare = async () => {
    if (!email.trim()) { setError('Enter an email address'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) { setError('Enter a valid email'); return; }
    const currentId = id || canvasId;
    if (!currentId) { setError('No canvas selected'); return; }

    try {
      setIsSharing(true);
      setError(''); setSuccess('');
      await shareCanvas(currentId, email.trim());
      setSuccess(`Shared with ${email.trim()}!`);
      setEmail('');
      await fetchSharedCanvases();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) setError('User not found. They must register first.');
      else if (status === 400) setError(err.response?.data?.error || 'Already shared');
      else if (status === 403) setError("You don't own this canvas");
      else if (status === 401) { handleLogout(); }
      else setError('Failed to share. Please try again.');
      setTimeout(() => setError(''), 6000);
    } finally {
      setIsSharing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setUserLoginStatus(false);
    navigate('/');
  };

  const currentId = id || canvasId;

  return (
    <>
      {/* Toggle button */}
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(o => !o)}
        title={sidebarOpen ? "Close panel" : "Open panel"}
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      <div className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar-header">
          <h3 className="sidebar-logo">
            <span>⬜</span> WhiteBoard
          </h3>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        <button
          className="create-button"
          onClick={handleCreateCanvas}
          disabled={!isUserLoggedIn}
        >
          <span>+</span> New Canvas
        </button>

        {/* Tabs */}
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'my-canvases' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-canvases')}
          >
            Mine ({canvases.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'shared' ? 'active' : ''}`}
            onClick={() => setActiveTab('shared')}
          >
            Shared ({sharedCanvases.length})
          </button>
        </div>

        {/* Canvas list */}
        <ul className="canvas-list">
          {activeTab === 'my-canvases' && canvases.map(canvas => (
            <li
              key={canvas._id}
              className={`canvas-item ${canvas._id === currentId ? 'selected' : ''}`}
              onClick={() => navigate(`/whiteboard/${canvas._id}`)}
            >
              <span className="canvas-name">
                {canvas.name || `Canvas ${canvas._id.slice(-6)}`}
                <small className="canvas-date">
                  {canvas.updatedAt
                    ? new Date(canvas.updatedAt).toLocaleDateString()
                    : new Date(canvas.createdAt).toLocaleDateString()}
                </small>
              </span>
              <button
                className="delete-button"
                onClick={(e) => handleDeleteCanvas(e, canvas._id)}
                title="Delete"
              >✕</button>
            </li>
          ))}
          {activeTab === 'shared' && sharedCanvases.map(canvas => (
            <li
              key={canvas._id}
              className={`canvas-item ${canvas._id === currentId ? 'selected' : ''}`}
              onClick={() => navigate(`/whiteboard/${canvas._id}`)}
            >
              <span className="canvas-name">
                {canvas.name || `Canvas ${canvas._id.slice(-6)}`}
                <small className="canvas-date">by {canvas.owner?.email || 'Unknown'}</small>
              </span>
            </li>
          ))}
          {activeTab === 'shared' && sharedCanvases.length === 0 && (
            <li className="no-canvases">No shared canvases yet</li>
          )}
        </ul>

        {/* Share panel */}
        {isUserLoggedIn && currentId && (
          <div className="share-container">
            <h4 className="share-title">Share This Canvas</h4>
            <input
              type="email"
              placeholder="Enter email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSharing}
              onKeyDown={(e) => { if (e.key === 'Enter') handleShare(); }}
            />
            <button
              className="share-button"
              onClick={handleShare}
              disabled={isSharing || !email.trim()}
            >
              {isSharing ? 'Sharing...' : 'Share Canvas'}
            </button>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
          </div>
        )}

        <div className="sidebar-actions">
          <button className="dash-button" onClick={() => navigate('/dashboard')}>
            📊 Dashboard
          </button>
          {isUserLoggedIn ? (
            <button className="auth-button logout-button" onClick={handleLogout}>Logout</button>
          ) : (
            <button className="auth-button login-button" onClick={() => navigate('/login')}>Login</button>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;