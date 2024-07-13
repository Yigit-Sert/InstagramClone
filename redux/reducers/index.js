import { combineReducers } from "redux";
import { user } from "./user";
import { users } from './users'
import { messages } from './messages';

const Reducers = combineReducers({
    userState: user,
    usersState: users,
    messagesState: messages
});

export default Reducers;