import React, { useCallback, useReducer, useRef, useState } from "react";
import boardContext from "./board-context";
import { BOARD_ACTIONS, TOOL_ACTION_TYPES, TOOL_ITEMS } from "../constants";
import { createElement, isPointNearElement } from "../utils/element";
import { updateCanvas } from "../utils/api";

const boardReducer = (state, action) => {
  switch (action.type) {
    case BOARD_ACTIONS.CHANGE_TOOL:
      return { ...state, activeToolItem: action.payload.tool };

    case BOARD_ACTIONS.CHANGE_ACTION_TYPE:
      return { ...state, toolActionType: action.payload.actionType };

    case BOARD_ACTIONS.DRAW_DOWN: {
      const { clientX, clientY, stroke, fill, size } = action.payload;

      const newElement = createElement(
        state.elements.length,
        clientX,
        clientY,
        clientX,
        clientY,
        { type: state.activeToolItem, stroke, fill, size }
      );

      return {
        ...state,
        toolActionType:
          state.activeToolItem === TOOL_ITEMS.TEXT
            ? TOOL_ACTION_TYPES.WRITING
            : TOOL_ACTION_TYPES.DRAWING,
        elements: [...state.elements, newElement],
      };
    }

    case BOARD_ACTIONS.DRAW_MOVE: {
      const { clientX, clientY } = action.payload;
      const newElements = [...state.elements];
      const index = newElements.length - 1;
      const el = newElements[index];

      switch (el.type) {
        case TOOL_ITEMS.LINE:
        case TOOL_ITEMS.RECTANGLE:
        case TOOL_ITEMS.CIRCLE:
        case TOOL_ITEMS.ARROW: {
          const updated = createElement(
            index,
            el.x1,
            el.y1,
            clientX,
            clientY,
            {
              type: el.type,
              stroke: el.stroke,
              fill: el.fill,
              size: el.size,
            }
          );
          newElements[index] = updated;
          return { ...state, elements: newElements };
        }

        case TOOL_ITEMS.BRUSH:
          newElements[index].points = [
            ...newElements[index].points,
            { x: clientX, y: clientY },
          ];
          return { ...state, elements: newElements };

        default:
          return state;
      }
    }

    case BOARD_ACTIONS.DRAW_UP: {
      const elementsCopy = JSON.parse(JSON.stringify(state.elements));
      const newHistory = state.history.slice(0, state.index + 1);
      newHistory.push(elementsCopy);

      if (state.isUserLoggedIn && state.canvasId) {
        updateCanvas(state.canvasId, elementsCopy).catch(() => {});
      }

      return {
        ...state,
        history: newHistory,
        index: state.index + 1,
      };
    }

    case BOARD_ACTIONS.ERASE: {
      const { clientX, clientY } = action.payload;

      const newElements = state.elements.filter(
        (el) => !isPointNearElement(el, clientX, clientY)
      );

      const newHistory = state.history.slice(0, state.index + 1);
      newHistory.push(newElements);

      if (state.isUserLoggedIn && state.canvasId) {
        updateCanvas(state.canvasId, newElements).catch(() => {});
      }

      return {
        ...state,
        elements: newElements,
        history: newHistory,
        index: state.index + 1,
      };
    }

    case BOARD_ACTIONS.CHANGE_TEXT: {
      const newElements = [...state.elements];
      const index = newElements.length - 1;
      newElements[index].text = action.payload.text;

      const newHistory = state.history.slice(0, state.index + 1);
      newHistory.push(newElements);

      return {
        ...state,
        toolActionType: TOOL_ACTION_TYPES.NONE,
        elements: newElements,
        history: newHistory,
        index: state.index + 1,
      };
    }

    case BOARD_ACTIONS.UNDO: {
      if (state.index <= 0) return state;
      const prevElements = state.history[state.index - 1];
      if (state.isUserLoggedIn && state.canvasId) {
        updateCanvas(state.canvasId, prevElements).catch(() => {});
      }
      return {
        ...state,
        elements: prevElements,
        index: state.index - 1,
      };
    }

    case BOARD_ACTIONS.REDO: {
      if (state.index >= state.history.length - 1) return state;
      const nextElements = state.history[state.index + 1];
      if (state.isUserLoggedIn && state.canvasId) {
        updateCanvas(state.canvasId, nextElements).catch(() => {});
      }
      return {
        ...state,
        elements: nextElements,
        index: state.index + 1,
      };
    }

    case BOARD_ACTIONS.SET_CANVAS_ID:
      return { ...state, canvasId: action.payload.canvasId };

    case BOARD_ACTIONS.SET_CANVAS_NAME:
      return { ...state, canvasName: action.payload.canvasName };

    case BOARD_ACTIONS.SET_CANVAS_ELEMENTS:
      return {
        ...state,
        elements: action.payload.elements,
        history: [action.payload.elements],
        index: 0,
      };

    case BOARD_ACTIONS.SET_HISTORY:
      return {
        ...state,
        history: [action.payload.elements],
        index: 0,
      };

    case BOARD_ACTIONS.SET_USER_LOGIN_STATUS:
      return {
        ...state,
        isUserLoggedIn: action.payload.isUserLoggedIn,
      };

    default:
      return state;
  }
};

const initialBoardState = {
  activeToolItem: TOOL_ITEMS.BRUSH,
  toolActionType: TOOL_ACTION_TYPES.NONE,
  elements: [],
  history: [[]],
  index: 0,
  canvasId: "",
  canvasName: "Untitled Canvas",
  isUserLoggedIn: !!localStorage.getItem("token"),
};

const BoardProvider = ({ children }) => {
  const [boardState, dispatch] = useReducer(boardReducer, initialBoardState);
  

    const [showAIPanel, setShowAIPanel] = useState(false);


  const changeToolHandler = (tool) =>
    dispatch({ type: BOARD_ACTIONS.CHANGE_TOOL, payload: { tool } });

  const boardMouseDownHandler = (e, toolbox) => {
    const { clientX, clientY } = e;

    if (boardState.activeToolItem === TOOL_ITEMS.ERASER) {
      dispatch({
        type: BOARD_ACTIONS.CHANGE_ACTION_TYPE,
        payload: { actionType: TOOL_ACTION_TYPES.ERASING },
      });
      // Erase immediately on click
      dispatch({
        type: BOARD_ACTIONS.ERASE,
        payload: { clientX, clientY },
      });
      return;
    }

    dispatch({
      type: BOARD_ACTIONS.DRAW_DOWN,
      payload: {
        clientX,
        clientY,
        ...toolbox[boardState.activeToolItem],
      },
    });
  };

  const boardMouseMoveHandler = (e) => {
    const { clientX, clientY } = e;

    if (boardState.toolActionType === TOOL_ACTION_TYPES.ERASING) {
      // ✅ FIX: dispatch ERASE while moving with eraser held down
      dispatch({
        type: BOARD_ACTIONS.ERASE,
        payload: { clientX, clientY },
      });
      return;
    }

    if (boardState.toolActionType === TOOL_ACTION_TYPES.DRAWING) {
      dispatch({
        type: BOARD_ACTIONS.DRAW_MOVE,
        payload: { clientX, clientY },
      });
    }
  };

  const boardMouseUpHandler = () => {
    if (boardState.toolActionType === TOOL_ACTION_TYPES.ERASING) {
      dispatch({
        type: BOARD_ACTIONS.CHANGE_ACTION_TYPE,
        payload: { actionType: TOOL_ACTION_TYPES.NONE },
      });
      return;
    }
    dispatch({ type: BOARD_ACTIONS.DRAW_UP });
    dispatch({
      type: BOARD_ACTIONS.CHANGE_ACTION_TYPE,
      payload: { actionType: TOOL_ACTION_TYPES.NONE },
    });
  };

  const value = {
    ...boardState,
    changeToolHandler,
    boardMouseDownHandler,
    boardMouseMoveHandler,
    boardMouseUpHandler,
     showAIPanel,    
       setShowAIPanel,
    textAreaBlurHandler: (text) =>
      dispatch({ type: BOARD_ACTIONS.CHANGE_TEXT, payload: { text } }),
    undo: () => dispatch({ type: BOARD_ACTIONS.UNDO }),
    redo: () => dispatch({ type: BOARD_ACTIONS.REDO }),
    setCanvasId: (id) =>
      dispatch({ type: BOARD_ACTIONS.SET_CANVAS_ID, payload: { canvasId: id } }),
    setCanvasName: (name) =>
      dispatch({ type: BOARD_ACTIONS.SET_CANVAS_NAME, payload: { canvasName: name } }),
    setElements: (el) =>
      dispatch({ type: BOARD_ACTIONS.SET_CANVAS_ELEMENTS, payload: { elements: el } }),
    setHistory: (el) =>
      dispatch({ type: BOARD_ACTIONS.SET_HISTORY, payload: { elements: el } }),
    setUserLoginStatus: (status) =>
      dispatch({ type: BOARD_ACTIONS.SET_USER_LOGIN_STATUS, payload: { isUserLoggedIn: status } }),
  };

  return <boardContext.Provider value={value}>{children}</boardContext.Provider>;
};

export default BoardProvider;