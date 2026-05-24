import { createContext } from "react";



const boardContext = createContext({
  isUserLoggedIn: false,
  activeToolItem: "",
  toolActionType: "",
  elements: [],
  history: [[]],
  showAIPanel: false, 
  index: 0,
  canvasId: "",
  canvasName: "Untitled Canvas",
  setElements: () => {},
  boardMouseDownHandler: () => {},
  setCanvasId: () => {},
  setCanvasName: () => {},
  changeToolHandler: () => {},
  boardMouseMoveHandler: () => {},
  boardMouseUpHandler: () => {},
  textAreaBlurHandler: () => {},
  setUserLoginStatus: () => {},
  setHistory: () => {},
  undo: () => {},
  redo: () => {},
   setShowAIPanel: () => {}, 
});

export default boardContext;