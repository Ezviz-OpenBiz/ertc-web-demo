import React, { useState, useEffect, useRef } from "react";
import ERTC from "ertc-web";
import {
  Input,
  InputNumber,
  Select,
  Switch,
  Space,
  Radio,
  Row,
  Col,
  Button,
  Badge,
  message,
  Tooltip,
  Form,
  Modal
} from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";

import "./index.less";

export default function ScreenRecord() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState(false);
  const [ertc, setErtc] = useState(null);
  const [roomState, setRoomState] = useState({
    accessToken1: "",
    appId1: "",
    roomId1: "",
    userId1: "",
  });

  const env = searchParams.get("env"); // 从url中获取env参数，用于项目中切换环境，开发者接入可以忽略
  const domain = searchParams.get("domain"); // url中获取domain参数，用于项目中切换域名，开发者接入可以忽略
  const exportLogs = searchParams.get("exportLogs"); // url中获取export参数，用于项目中切换日志导出，开发者接入可以忽略
  const ertcSettings = {
    debug: true,
    exportLogs: exportLogs === "0" ? false : true,
    domain: domain
      ? decodeURIComponent(domain)
      : env === "dev"
      ? "https://test12open.ys7.com"
      : null, // 从url中获取env参数，用于项目中切换环境，开发者接入可以忽略
  };

  const changeRoomState = (key, value) => {
    setRoomState({
      ...roomState,
      [key]: value,
    });
  };

  const clickScreenRecord = () => {
    let uplinkERTC = null;

    uplinkERTC = new ERTC(ertcSettings);
    setErtc(uplinkERTC);
    uplinkERTC
      .screenRecorderStart({
        accessToken: roomState["accessToken1"],
        appId: roomState["appId1"],
        roomId: roomState["roomId1"],
        userId: roomState["userId1"],
        onSafari: (next) => {
          // 如果是safari会进入此逻辑,需要和用户交互后，再执行next方法
          Modal.confirm({
            title: "提示",
            content: "请点击确定按钮，开始录屏",
            onOk() {
              next();
            },
          })
        }
      })
      .then((res) => {
        if (res?.code === 0) {
          setStatus(true);
        }
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
        setStatus(false);
      });

    uplinkERTC.on(ERTC.EVENT.ERROR, (event) => {
      console.log(event);
      setStatus(false);
    });
    uplinkERTC.on("unpublishlocalstreamack", (event) => {
      console.log(event);
      setStatus(false);
    });
  };

  const clickScreenRecordStop = () => {
    ertc?.screenRecorderStop();
  }

  return (
    <>
      <Row gutter={[16, 8]} style={{ marginTop: 10, marginBottom: 10 }}>
        <Col span={2}>用户1：</Col>
        <Col span={5}>
          <Input
            addonBefore="资源token"
            value={roomState["accessToken1"]}
            onChange={(e) => changeRoomState("accessToken1", e.target.value)}
          />
        </Col>
        <Col span={5}>
          <Input
            addonBefore="appId"
            value={roomState["appId1"]}
            onChange={(e) => changeRoomState("appId1", e.target.value)}
          />
        </Col>
        <Col span={5}>
          <Input
            addonBefore="roomId"
            value={roomState["roomId1"]}
            onChange={(e) => changeRoomState("roomId1", e.target.value)}
          />
        </Col>
        <Col span={5}>
          <Input
            addonBefore="userId"
            value={roomState["userId1"]}
            onChange={(e) => changeRoomState("userId1", e.target.value)}
          />
        </Col>
      </Row>
      <Button type="primary" loading={status} onClick={clickScreenRecord}>
        {status ? "录屏中..." : "桌面录屏"}
      </Button>
      {status && <Button type="primary" style={{ marginLeft: 10 }} onClick={clickScreenRecordStop}>停止录屏</Button>}
    </>
  );
}
