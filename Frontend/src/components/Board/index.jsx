import { useContext, useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import rough from "roughjs";
import AIPromptPanel from "../AIPromptPanel"; 
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
      // pass token so server can authenticate the socket user
      emitSocketEvent("joinCanvas", { canvasId: id, token });
    };

    if (currentSocket.connected) {
      joinCanvas();
    } else {
      currentSocket.once("connect", joinCanvas);
    }

    const handleDrawingUpdate = (data) => {
  const els = Array.isArray(data) ? data : data?.elements;
  if (Array.isArray(els)) setElements(els);
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
    
    if (!Array.isArray(elements)) return;

    const roughCanvas = rough.canvas(canvas);

    elements.forEach((element) => {
      switch (element.type) {
        case TOOL_ITEMS.LINE:
        roughCanvas.draw(element.roughEle);
        break; 

          case TOOL_ITEMS.RECTANGLE: {
        roughCanvas.draw(element.roughEle);
        if (element.text) {
          const cx = (element.x1 + element.x2) / 2;
          const cy = (element.y1 + element.y2) / 2;
          context.save();
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.font = "bold 13px sans-serif";
          context.fillStyle = "#1e293b";
          context.fillText(element.text, cx, cy);
          context.restore();
        }
        break;
      }

        case TOOL_ITEMS.CIRCLE: {
        roughCanvas.draw(element.roughEle);
       
        if (element.text) {
          const cx = (element.x1 + element.x2) / 2;
          const cy = (element.y1 + element.y2) / 2;
          context.save();
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.font = "bold 13px sans-serif";
          context.fillStyle = "#1e293b";
          context.fillText(element.text, cx, cy);
          context.restore();
        }
        break;
      }
      
      case TOOL_ITEMS.ARROW: {
      const { x1, y1, x2, y2 } = element;
      const color = element.stroke || "#94a3b8";
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const headLen = 14;

      context.save();
      context.strokeStyle = color;
      context.fillStyle = color;
      context.lineWidth = 2;


      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.stroke();

   
      context.beginPath();
      context.moveTo(x2, y2);
      context.lineTo(
        x2 - headLen * Math.cos(angle - Math.PI / 6),
        y2 - headLen * Math.sin(angle - Math.PI / 6)
      );
      context.lineTo(
        x2 - headLen * Math.cos(angle + Math.PI / 6),
        y2 - headLen * Math.sin(angle + Math.PI / 6)
      );
      context.closePath();
      context.fill();

      context.restore();
      break;
    }

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
  
  // ─── AI Diagram Generator ────────────────────────────────────────────────────
const handleShapesGenerated = (shapes) => {
  // console.log("Raw shapes from AI:", shapes);           
  // console.log("Arrow shapes:", shapes.filter(s => s.type === "arrow")); 

  const generator = rough.generator();
    const currentElements = Array.isArray(elements) ? elements : [];

  const newElements = shapes.map((shape, i) => {
    const id_el= `ai-${Date.now()}-${i}`;

   if (shape.type === "rectangle") {
      const { x, y, width, height, color, strokeColor, text } = shape;
      return {
        id: id_el,
        type: TOOL_ITEMS.RECTANGLE,
        x1: x, y1: y,
        x2: x + width, y2: y + height,
        stroke: strokeColor || "#3b82f6",
        fill: color || "#e8f4fd",
        text: text || "",              // ✅ ADD THIS
        roughEle: generator.rectangle(x, y, width, height, {
          stroke: strokeColor || "#3b82f6",
          fill: color || "#e8f4fd",
          fillStyle: "solid",
          roughness: 1,
        }),
      };
    }

    if (shape.type === "circle") {
          const { x, y, radius = 40, color, strokeColor, text } = shape;
          const cx = x + radius, cy = y + radius;
          return {
            id: id_el,
            type: TOOL_ITEMS.CIRCLE,
            x1: x, y1: y,
            x2: x + radius * 2, y2: y + radius * 2,
            stroke: strokeColor || "#3b82f6",
            fill: color || "#e8f4fd",
            text: text || "",        
            roughEle: generator.ellipse(cx, cy, radius * 2, radius * 2, {
              stroke: strokeColor || "#3b82f6",
              fill: color || "#e8f4fd",
              fillStyle: "solid",
              roughness: 1,
            }),
          };
    }

    if (shape.type === "arrow") {
      const { x1, y1, x2, y2, strokeColor } = shape;
      return {
        id: id_el,
        type: TOOL_ITEMS.ARROW,
        x1, y1, x2, y2,
        stroke: strokeColor || "#94a3b8",
      };
     }


    if (shape.type === "text") {
      return {
        id: id_el,
        type: TOOL_ITEMS.TEXT,
        x1: shape.x,
        y1: shape.y,
        text: shape.text,
        stroke: "#1e293b",           
        size: 14,
      };
    }

    return null;
  }).filter(Boolean);

  // console.log("New elements created:", newElements);   
  // console.log("Arrow elements:", newElements.filter(e => e.type === TOOL_ITEMS.ARROW)); 

   const merged = [...currentElements, ...newElements];
  setElements(merged);

  // Sync to collaborators
  setTimeout(() => {
    emitSocketEvent("drawingUpdate", {
      canvasId: id,
      elements: merged,
    });
  }, 50);
};

  return (
    <>
      <AIPromptPanel onShapesGenerated={handleShapesGenerated} />
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