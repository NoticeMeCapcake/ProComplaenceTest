import React, { Component } from 'react';
import { Route, Routes } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { Layout } from './components/Layout';
import './custom.css';
import {Overseer} from "./components/Overseer";

export default class App extends Component {
  static displayName = App.name;

  render() {
    return (
      <Layout>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
          <script src="/js/main.js"></script>
        <Routes>
          {AppRoutes.map((route, index) => {
            const { element, ...rest } = route;
            return <Route key={index} {...rest} element={element} />;
          })}
            <Route path="*" element={<h1>Not Found</h1>} />
        </Routes>
      </Layout>
    );
  }
}
