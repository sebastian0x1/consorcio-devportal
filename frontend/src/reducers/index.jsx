import {
    configureStore,
} from "@reduxjs/toolkit";
import logger from 'redux-logger'
import { authReducer } from "./auth";


export const store = configureStore({
    reducer: {
        auth: authReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(
        (process.env.NODE_ENV === "production") ? [] : logger
    ),
});