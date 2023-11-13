import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import Header from "./components/Header";
import Core from "./views/core";
import "./App.css";

const { Content } = Layout;
function App() {
  const [count, setCount] = useState(0);

  return (
    <Layout className="app">
      <Header />
      <Content>
        <Routes>
          <Route path="/" element={<Core />} />
          <Route path="/core" element={<Core />} />
          <Route path="*" element={<Core />} />
        </Routes>
      </Content>
    </Layout>
  );
}

export default App;
