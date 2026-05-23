import { useContext, useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import rough from "roughjs";
import boardContext from "../../store/board-context";
import { TOOL_ACTION_TYPES, TOOL_ITEMS } from "../../constants";
import toolboxContext from "../../store/toolbox-context";
import { getSocket, emitSocketEvent, onSocketEvent } from "../../utils/socket";

import classes from "./index.module.css";

import { getSvgPathFromStroke } from "../../utils/element";
import getStroke from "perfect-freehand";
import axios from "axios";

function Board({ id }) {
  const canvasRef = useRef();
  const textAreaRef = useRef();
  const elementsRef = useRef([]);

  const {
    elements,
    toolActionType,
    boardMouseDownHandler,
    boardMouseMoveHandler,
    boardMouseUpHandler,
    textAreaBlurHandler,
    undo,
    redo,
    setCanvasId,
    setCanvasName,
    setElements,
    setHistory,
  } = useContext(boardContext);

  // Keep a ref to elements so socket emits always use the latest value
  useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  const { toolboxState } = useContext(toolboxContext);
  const token = localStorage.getItem("token");

  const [isAuthorized, setIsAuthorized] = useState(true);

  // ─── Load canvas via HTTP ───────────────────────────────────────────────────
  useEffect(() => {
    if (!id || !token) return;

    const fetchCanvasData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/canvas/load/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setCanvasId(id);
        if (response.data.name) setCanvasName(response.data.name);
        setElements(response.data.elements || []);
        setHistory(response.data.elements || []);
      } catch (error) {
        if (error.response?.status === 403 || error.response?.status === 401) {
          setIsAuthorized(false);
          alert("Access Denied");
        }
      }
    };

    fetchCanvasData();
  }, [id, token]);

  // ─── Socket real-time collaboration ─────────────────────────────────────────
  useEffect(() => {
    if (!id || !token) return;

    const currentSocket = getSocket();

    const joinCanvas = () => {
      // ✅ FIX: pass token so server can authenticate the socket user
      emitSocketEvent("joinCanvas", { canvasId: id, token });
    };

    if (currentSocket.connected) {
      joinCanvas();
    } else {
      currentSocket.once("connect", joinCanvas);
    }

    const handleDrawingUpdate = (updatedElements) => {
      setElements(updatedElements);
    };

    const handleLoadCanvas = (initialElements) => {
      // Only use socket load if we don't have elements yet
      // (HTTP load takes priority – already done above)
    };

    const handleUnauthorized = () => {
      setIsAuthorized(false);
    };

    onSocketEvent("drawingUpdate", handleDrawingUpdate);
    onSocketEvent("unauthorized", handleUnauthorized);

    return () => {
      if (currentSocket) {
        currentSocket.off("drawingUpdate", handleDrawingUpdate);
        currentSocket.off("unauthorized", handleUnauthorized);
      }
    };
  }, [id, token]);

  // ─── Canvas resize ───────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ─── Keyboard shortcuts ──────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "z") undo();
      else if ((event.ctrlKey || event.metaKey) && event.key === "y") redo();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  // ─── Render elements ─────────────────────────────────────────────────────────
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    const roughCanvas = rough.canvas(canvas);

    elements.forEach((element) => {
      switch (element.type) {
        case TOOL_ITEMS.LINE:
        case TOOL_ITEMS.RECTANGLE:
        case TOOL_ITEMS.CIRCLE:
        case TOOL_ITEMS.ARROW:
          roughCanvas.draw(element.roughEle);
          break;

        case TOOL_ITEMS.BRUSH: {
          context.save();
          context.fillStyle = element.stroke;
          const path = new Path2D(
            getSvgPathFromStroke(getStroke(element.points))
          );
          context.fill(path);
          context.restore();
          break;
        }

        case TOOL_ITEMS.TEXT:
          context.save();
          context.textBaseline = "top";
          context.font = `${element.size}px Caveat`;
          context.fillStyle = element.stroke;
          context.fillText(element.text, element.x1, element.y1);
          context.restore();
          break;

        default:
          break;
      }
    });
  }, [elements]);

  // ─── Text box focus ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (toolActionType === TOOL_ACTION_TYPES.WRITING) {
      setTimeout(() => textAreaRef.current?.focus(), 0);
    }
  }, [toolActionType]);

  // ─── Mouse handlers ──────────────────────────────────────────────────────────
  const emitUpdate = useCallback(() => {
    if (!id) return;
    // Use the ref to always emit the latest elements
    emitSocketEvent("drawingUpdate", {
      canvasId: id,
      elements: elementsRef.current,
    });
  }, [id]);

  const handleMouseDown = (e) => {
    if (!isAuthorized) return;
    boardMouseDownHandler(e, toolboxState);
  };

  const handleMouseMove = (e) => {
    if (!isAuthorized) return;
    boardMouseMoveHandler(e);

    // Throttle socket emit to 60ms
    if (!handleMouseMove._last || Date.now() - handleMouseMove._last > 60) {
      handleMouseMove._last = Date.now();
      emitUpdate();
    }
  };

  const handleMouseUp = () => {
    if (!isAuthorized) return;
    boardMouseUpHandler();
    // Emit final state after a tick so state has settled
    setTimeout(emitUpdate, 50);
  };

  const handleTextBlur = (text) => {
    if (!isAuthorized) return;
    textAreaBlurHandler(text);
    setTimeout(emitUpdate, 100);
  };

  return (
    <>
      {toolActionType === TOOL_ACTION_TYPES.WRITING && elements.length > 0 && (
        <textarea
          ref={textAreaRef}
          className={classes.textElementBox}
          style={{
            top: elements[elements.length - 1].y1,
            left: elements[elements.length - 1].x1,
            fontSize: `${elements[elements.length - 1]?.size}px`,
            color: elements[elements.length - 1]?.stroke,
          }}
          onBlur={(e) => handleTextBlur(e.target.value)}
        />
      )}

      <canvas
        ref={canvasRef}
        id="canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </>
  );
}

export default Board;