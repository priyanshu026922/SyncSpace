import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import boardContext from "../../store/board-context";
import {
  getUserCanvases,
  getSharedCanvases,
  createCanvas,
  deleteCanvas,
  renameCanvas,
} from "../../utils/api";
import { reconnectSocket } from "../../utils/socket";
import styles from "./index.module.css";

const CanvasPreview = ({ canvas }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, 200, 120);

    // Show thumbnail if available
    if (canvas.thumbnail) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 200, 120);
      };
      img.src = canvas.thumbnail;
    } else if (canvas.elements && canvas.elements.length > 0) {
      // Draw simple dots to indicate content
      ctx.fillStyle = "#6366f1";
      ctx.font = "11px Inter, sans-serif";
      ctx.fillStyle = "rgba(99,102,241,0.6)";
      ctx.fillText(`${canvas.elements.length} element${canvas.elements.length !== 1 ? "s" : ""}`, 10, 60);
      ctx.fillRect(10, 70, Math.min(canvas.elements.length * 8, 180), 4);
    } else {
      // Empty canvas placeholder
      ctx.strokeStyle = "rgba(148,163,184,0.3)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(10, 10, 180, 100);
      ctx.fillStyle = "rgba(148,163,184,0.5)";
      ctx.font = "11px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Empty Canvas", 100, 60);
    }
  }, [canvas]);

  return <canvas ref={canvasRef} width={200} height={120} className={styles.previewCanvas} />;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { isUserLoggedIn, setUserLoginStatus, setCanvasId, setCanvasName } = useContext(boardContext);

  const [myCanvases, setMyCanvases] = useState([]);
  const [sharedCanvases, setSharedCanvases] = useState([]);
  const [activeTab, setActiveTab] = useState("mine");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    const email = localStorage.getItem("userEmail") || "";
    setUserEmail(email);
    fetchAllCanvases();
  }, []);

  const fetchAllCanvases = async () => {
    setLoading(true);
    try {
      const [mine, shared] = await Promise.all([
        getUserCanvases(),
        getSharedCanvases(),
      ]);
      // Separate owned vs shared from getUserCanvases result
      const userId = localStorage.getItem("userId");
      const ownedCanvases = mine.filter(c => {
        const ownerId = c.owner?._id || c.owner;
        return ownerId?.toString() !== undefined;
      });
      setMyCanvases(mine);
      setSharedCanvases(shared);
    } catch (err) {
      console.error("Failed to fetch canvases:", err);
      if (err?.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCanvas = async () => {
    setCreating(true);
    try {
      const data = await createCanvas("Untitled Canvas");
      const newId = data.canvasId || data._id;
      await fetchAllCanvases();
      navigate(`/whiteboard/${newId}`);
    } catch (err) {
      console.error("Failed to create canvas:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleOpenCanvas = (canvasId) => {
    navigate(`/whiteboard/${canvasId}`);
  };

  const handleDeleteCanvas = async (e, canvasId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this canvas? This cannot be undone.")) return;
    try {
      await deleteCanvas(canvasId);
      setMyCanvases(prev => prev.filter(c => c._id !== canvasId));
    } catch (err) {
      alert("Failed to delete canvas.");
    }
  };

  const handleStartRename = (e, canvas) => {
    e.stopPropagation();
    setEditingId(canvas._id);
    setEditingName(canvas.name || "Untitled Canvas");
  };

  const handleRename = async (canvasId) => {
    if (!editingName.trim()) return;
    try {
      await renameCanvas(canvasId, editingName.trim());
      setMyCanvases(prev =>
        prev.map(c => c._id === canvasId ? { ...c, name: editingName.trim() } : c)
      );
    } catch (err) {
      console.error("Rename failed:", err);
    }
    setEditingId(null);
    setEditingName("");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    setUserLoginStatus(false);
    navigate("/");
  };

  const filteredCanvases = (activeTab === "mine" ? myCanvases : sharedCanvases).filter(c =>
    (c.name || "Untitled Canvas").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getInitial = (email) => email ? email[0].toUpperCase() : "?";

  return (
    <div className={styles.dashboard}>
      {/* Sidebar Nav */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>⬜</span>
          <span className={styles.logoText}>SyncSpace</span>
        </div>

        <nav className={styles.nav}>
          <button
            className={`${styles.navItem} ${activeTab === "mine" ? styles.navActive : ""}`}
            onClick={() => setActiveTab("mine")}
          >
            <span className={styles.navIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </span>
            My Canvases
            <span className={styles.badge}>{myCanvases.length}</span>
          </button>
          <button
            className={`${styles.navItem} ${activeTab === "shared" ? styles.navActive : ""}`}
            onClick={() => setActiveTab("shared")}
          >
            <span className={styles.navIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
            Shared with Me
            <span className={styles.badge}>{sharedCanvases.length}</span>
          </button>
        </nav>

        <div className={styles.sidebarBottom}>
          <div className={styles.userCard}>
            <div className={styles.avatar}>{getInitial(userEmail)}</div>
            <div className={styles.userInfo}>
              <span className={styles.userEmail}>{userEmail || "User"}</span>
              <span className={styles.userRole}>Account</span>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>
              {activeTab === "mine" ? "My Canvases" : "Shared with Me"}
            </h1>
            <p className={styles.pageSubtitle}>
              {activeTab === "mine"
                ? `${myCanvases.length} canvas${myCanvases.length !== 1 ? "es" : ""}`
                : `${sharedCanvases.length} shared canvas${sharedCanvases.length !== 1 ? "es" : ""}`}
            </p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.searchBox}>
              <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search canvases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            {activeTab === "mine" && (
              <button
                className={styles.createBtn}
                onClick={handleCreateCanvas}
                disabled={creating}
              >
                {creating ? (
                  <span className={styles.spinner} />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                )}
                {creating ? "Creating..." : "New Canvas"}
              </button>
            )}
          </div>
        </header>

        {/* Canvas Grid */}
        <div className={styles.content}>
          {loading ? (
            <div className={styles.loadingState}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skeletonPreview} />
                  <div className={styles.skeletonText} />
                  <div className={styles.skeletonTextSm} />
                </div>
              ))}
            </div>
          ) : filteredCanvases.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                {activeTab === "mine" ? (
                  <svg viewBox="0 0 80 80" fill="none">
                    <rect x="10" y="20" width="60" height="45" rx="4" stroke="currentColor" strokeWidth="2" strokeDasharray="5 3" />
                    <path d="M40 35 L40 50M33 42 L40 35 L47 42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 80 80" fill="none">
                    <circle cx="30" cy="30" r="14" stroke="currentColor" strokeWidth="2" strokeDasharray="5 3" />
                    <circle cx="52" cy="30" r="14" stroke="currentColor" strokeWidth="2" strokeDasharray="5 3" />
                    <circle cx="40" cy="52" r="14" stroke="currentColor" strokeWidth="2" strokeDasharray="5 3" />
                  </svg>
                )}
              </div>
              <h3 className={styles.emptyTitle}>
                {searchQuery
                  ? "No canvases match your search"
                  : activeTab === "mine"
                    ? "No canvases yet"
                    : "Nothing shared with you yet"}
              </h3>
              <p className={styles.emptyDesc}>
                {searchQuery
                  ? "Try a different search term"
                  : activeTab === "mine"
                    ? "Create your first canvas to get started"
                    : "When someone shares a canvas with you, it'll appear here"}
              </p>
              {activeTab === "mine" && !searchQuery && (
                <button className={styles.createBtn} onClick={handleCreateCanvas}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Create First Canvas
                </button>
              )}
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredCanvases.map(canvas => {
                const isOwner = !canvas.owner?._id || canvas.owner?._id === localStorage.getItem("userId");
                return (
                  <div
                    key={canvas._id}
                    className={styles.card}
                    onClick={() => handleOpenCanvas(canvas._id)}
                  >
                    <div className={styles.cardPreview}>
                      <CanvasPreview canvas={canvas} />
                      <div className={styles.cardOverlay}>
                        <button className={styles.openBtn}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          </svg>
                          Open
                        </button>
                      </div>
                    </div>

                    <div className={styles.cardBody}>
                      <div className={styles.cardNameRow}>
                        {editingId === canvas._id ? (
                          <input
                            autoFocus
                            className={styles.renameInput}
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onBlur={() => handleRename(canvas._id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleRename(canvas._id);
                              if (e.key === "Escape") { setEditingId(null); setEditingName(""); }
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <h3 className={styles.cardName}>{canvas.name || "Untitled Canvas"}</h3>
                        )}

                        <div className={styles.cardActions}>
                          {activeTab === "mine" && (
                            <>
                              <button
                                className={styles.iconBtn}
                                onClick={(e) => handleStartRename(e, canvas)}
                                title="Rename"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                              <button
                                className={`${styles.iconBtn} ${styles.deleteIconBtn}`}
                                onClick={(e) => handleDeleteCanvas(e, canvas._id)}
                                title="Delete"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                  <path d="M10 11v6M14 11v6" />
                                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className={styles.cardMeta}>
                        <span className={styles.cardDate}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          {formatDate(canvas.updatedAt || canvas.createdAt)}
                        </span>
                        {activeTab === "shared" && canvas.owner?.email && (
                          <span className={styles.sharedBadge}>
                            by {canvas.owner.email}
                          </span>
                        )}
                        {canvas.shared && canvas.shared.length > 0 && activeTab === "mine" && (
                          <span className={styles.collaboratorsBadge}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            {canvas.shared.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
