import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import Header from "./components/Header";
import Core from "./views/core";
import ApiList from "./views/apiList";
import "./App.css";
import 'antd/dist/antd.css';
import 'core-js/stable';

const { Content } = Layout;
function App() {

  return (
    <Layout className="app">
      <Header />
      <Content>
        <Routes>
          <Route path="/" element={<Core />} />
          <Route path="/core" element={<Core />} />
          <Route path="/apiList" element={<ApiList />} />
          <Route path="*" element={<Core />} />
        </Routes>
      </Content>
    </Layout>
  );
}

export default App;
