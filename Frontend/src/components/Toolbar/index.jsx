import React, { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import classes from "./index.module.css";
import cx from "classnames";
import {
  FaSlash,
  FaRegCircle,
  FaArrowRight,
  FaPaintBrush,
  FaEraser,
  FaUndoAlt,
  FaRedoAlt,
  FaFont,
  FaDownload,
} from "react-icons/fa";
import { LuRectangleHorizontal } from "react-icons/lu";
import { TOOL_ITEMS } from "../../constants";
import boardContext from "../../store/board-context";
import { renameCanvas } from "../../utils/api";

const Toolbar = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { activeToolItem, changeToolHandler, undo, redo, canvasName, setCanvasName } =
    useContext(boardContext);

  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  const handleDownloadClick = () => {
    const canvas = document.getElementById("canvas");
    const data = canvas.toDataURL("image/png");
    const anchor = document.createElement("a");
    anchor.href = data;
    anchor.download = `${canvasName || "board"}.png`;
    anchor.click();
  };

  const handleNameClick = () => {
    if (!id) return;
    setTempName(canvasName || "Untitled Canvas");
    setEditingName(true);
  };

  const handleNameSave = async () => {
    if (!tempName.trim() || !id) { setEditingName(false); return; }
    setEditingName(false);
    setCanvasName(tempName.trim());
    try {
      await renameCanvas(id, tempName.trim());
    } catch (e) {
      console.error("Rename failed:", e);
    }
  };

  const tools = [
    { item: TOOL_ITEMS.BRUSH,     icon: <FaPaintBrush />,          title: "Brush" },
    { item: TOOL_ITEMS.LINE,      icon: <FaSlash />,               title: "Line" },
    { item: TOOL_ITEMS.RECTANGLE, icon: <LuRectangleHorizontal />, title: "Rectangle" },
    { item: TOOL_ITEMS.CIRCLE,    icon: <FaRegCircle />,           title: "Circle" },
    { item: TOOL_ITEMS.ARROW,     icon: <FaArrowRight />,          title: "Arrow" },
    { item: TOOL_ITEMS.ERASER,    icon: <FaEraser />,              title: "Eraser" },
    { item: TOOL_ITEMS.TEXT,      icon: <FaFont />,                title: "Text" },
  ];

  return (
    <div className={classes.container}>
      {/* Back to dashboard */}
      <button
        className={classes.dashBtn}
        onClick={() => navigate("/dashboard")}
        title="Back to Dashboard"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </button>

      <div className={classes.divider} />

      {/* Drawing tools */}
      {tools.map(({ item, icon, title }) => (
        <div
          key={item}
          className={cx(classes.toolItem, { [classes.active]: activeToolItem === item })}
          onClick={() => changeToolHandler(item)}
          title={title}
        >
          {icon}
        </div>
      ))}

      <div className={classes.divider} />

      {/* Canvas name */}
      {id && (
        <div className={classes.nameWrap}>
          {editingName ? (
            <input
              autoFocus
              className={classes.nameInput}
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleNameSave();
                if (e.key === "Escape") setEditingName(false);
              }}
            />
          ) : (
            <span className={classes.canvasName} onClick={handleNameClick} title="Click to rename">
              {canvasName || "Untitled Canvas"}
            </span>
          )}
        </div>
      )}

      <div className={classes.divider} />

      {/* Actions */}
      <div className={classes.toolItem} onClick={undo} title="Undo (Ctrl+Z)">
        <FaUndoAlt />
      </div>
      <div className={classes.toolItem} onClick={redo} title="Redo (Ctrl+Y)">
        <FaRedoAlt />
      </div>
      <div className={classes.toolItem} onClick={handleDownloadClick} title="Download as PNG">
        <FaDownload />
      </div>
    </div>
  );
};

export default Toolbar;
