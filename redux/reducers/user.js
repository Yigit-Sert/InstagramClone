import {
  USER_STATE_CHANGE,
  USER_POSTS_STATE_CHANGE,
  USER_FOLLOWING_STATE_CHANGE,
  CLEAR_DATA,
  FETCH_FOLLOWING_USERS,
} from "../constants/index";

const initialState = {
  currentUser: null,
  posts: [],
  following: [],
  followingUsers: [],
};

export const user = (state = initialState, action) => {
  switch (action.type) {
    case USER_STATE_CHANGE:
      return {
        ...state,
        currentUser: action.currentUser,
      };

    case USER_POSTS_STATE_CHANGE:
      return {
        ...state,
        posts: action.posts,
      };

    case USER_FOLLOWING_STATE_CHANGE:
      return {
        ...state,
        following: action.following,
      };

    case FETCH_FOLLOWING_USERS:
      return {
        ...state,
        followingUsers: action.followingUsers,
      };

    case CLEAR_DATA:
      return initialState;

    default:
      return state;
  }
};
