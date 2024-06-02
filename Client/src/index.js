import React from 'react';
import ReactDOM from "react-dom";
import './index.css';
import Login from './components/login'
import App from './components/App';
import Upload from './components/upload';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />
  },
  {
    path: "/upload",
    element: <Upload />
  },
  {
    path: "/download",
    element: <App />
  },
]);

ReactDOM.render(
  <RouterProvider router={router} />,
  document.getElementById("root")
);