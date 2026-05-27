import React, { useReducer } from "react";
import toolboxContext from "./toolbox-context";
import { COLORS, TOOLBOX_ACTIONS, TOOL_ITEMS } from "../constants";

function reducer(state, action) {
  switch (action.type) {
    case TOOLBOX_ACTIONS.CHANGE_STROKE:
      return {
        ...state,
        [action.payload.tool]: {
          ...state[action.payload.tool],
          stroke: action.payload.stroke,
        },
      };


    case TOOLBOX_ACTIONS.CHANGE_FILL:
      return {
        ...state,
        [action.payload.tool]: {
          ...state[action.payload.tool],
          fill: action.payload.fill,
        },
      };

      
    case TOOLBOX_ACTIONS.CHANGE_SIZE:
      return {
        ...state,
        [action.payload.tool]: {
          ...state[action.payload.tool],
          size: action.payload.size,
        },
      };

    default:
      return state;
  }
}

const initialState = {
  [TOOL_ITEMS.BRUSH]: { stroke: COLORS.BLACK },
  [TOOL_ITEMS.LINE]: { stroke: COLORS.BLACK, size: 1 },
  [TOOL_ITEMS.RECTANGLE]: { stroke: COLORS.BLACK, fill: null, size: 1 },
  [TOOL_ITEMS.CIRCLE]: { stroke: COLORS.BLACK, fill: null, size: 1 },
  [TOOL_ITEMS.ARROW]: { stroke: COLORS.BLACK, size: 1 },
  [TOOL_ITEMS.TEXT]: { stroke: COLORS.BLACK, size: 32 },
};

const ToolboxProvider = ({ children }) => {
  const [toolboxState, dispatch] = useReducer(reducer, initialState);

  return (
    <toolboxContext.Provider
      value={{
        toolboxState,
        changeStroke: (tool, stroke) =>
          dispatch({ type: TOOLBOX_ACTIONS.CHANGE_STROKE, payload: { tool, stroke } }),
        changeFill: (tool, fill) =>
          dispatch({ type: TOOLBOX_ACTIONS.CHANGE_FILL, payload: { tool, fill } }),
        changeSize: (tool, size) =>
          dispatch({ type: TOOLBOX_ACTIONS.CHANGE_SIZE, payload: { tool, size } }),
      }}
    >
      {children}
    </toolboxContext.Provider>
  );
};

export default ToolboxProvider;