const initialState = {
  xIsNext: true,
  stepNumber: 0,
  history: [
    {squares: Array(9).fill(null)}
  ],
  handshake: false,
  logs: [],
  isLogUpdating: false
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'JUMP_TO':
      return {
        ...state,
        stepNumber: action.payload.step,
        xIsNext: (action.payload.step % 2) === 0
      };
    case 'HANDSHAKE':
      return {
        ...state,
        handshake: true
      };
    case 'UPDATE_LOG':
      return {
        ...state,
        logs: action.payload.data,
        isLogUpdating: false
      };
    case 'UPDATE_STATUS':
      return {
        ...state,
        isLogUpdating: true
      };
    case 'UPDATE_HISTORY':
      return {
        ...state,
        history: action.payload.history,
        xIsNext: !state.xIsNext,
        stepNumber: action.payload.stepNumber
      };
    default:
      return state;
  }
};

export default reducer;
