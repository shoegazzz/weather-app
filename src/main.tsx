import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "./store/store";
import App from "./App";
import "./index.css";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

const theme = createTheme({
    palette: {
        mode: "light",
    },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <App />
                </ThemeProvider>
            </BrowserRouter>
        </Provider>
    </React.StrictMode>
);
