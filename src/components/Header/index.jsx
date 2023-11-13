import React from "react";
import { Layout } from "antd";

import './index.less'

const { Header } = Layout
const headerStyle = {
  padding: '0 24px',
}
export default () => {
  return (
    <Header className="console-header_bright" style={headerStyle}>
      <div
        className="logo"
      >
        <img
          src="http://resource.eziot.com/group1/M00/00/BD/CtwQE2QBskuAZWHXAACVDuIGZ8w891.svg"
          alt="logo"
        />
        <div className="logo-text">萤石webRTC</div>
      </div>
    </Header>
  );
};
