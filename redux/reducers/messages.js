import { FETCH_MESSAGES, SEND_MESSAGE, CLEAR_DATA } from "../constants";

const initialState = {
  messages: [],
};

export const messages = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_MESSAGES:
      return {
        ...state,
        messages: action.messages,
      };
    case SEND_MESSAGE:
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            ...action.message,
            createdAt: new Date(action.message.createdAt).toISOString(),
          },
        ],
      };
    case CLEAR_DATA:
      return initialState;
    default:
      return state;
  }
};
