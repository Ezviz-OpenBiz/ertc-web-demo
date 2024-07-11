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
  notification,
} from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import CheckNetwork from "./CheckNetwork";
import ScreenRecord from './ScreenRecord';

import "./index.less";

export default function ApiList() {
  const [searchParams] = useSearchParams();
  const [ertc, setErtc] = useState(null);
  const [roomState, setRoomState] = useState({})

  const clickGetBrowerEnv = () => {
    const res = ertc.isSupported();
    console.log('浏览器环境检查结果：', res)
    const info = res?.data?.detail || {};
    const webSupport = info.isSupportMedia ? (
      <div>
        <p>
          <Badge status="success" text="支持音视频媒体流获取"></Badge>
        </p>
      </div>
    ) : (
      <div>
        <p>
          <Badge status="error" text="不支持音视频媒体流获取"></Badge>
        </p>
      </div>
    );

    const isSupportScreen = info.isSupportScreen ? (
      <div>
        <p>
          <Badge status="success" text="支持屏幕分享"></Badge>
        </p>
      </div>
    ) : (
      <div>
        <p>
          <Badge status="error" text="不支持屏幕分享"></Badge>
        </p>
      </div>
    );

    const H264Support = info.isSupportH264 ? (
      <div>
        <p>
          <Badge status="success" text="支持h264编码"></Badge>
        </p>
      </div>
    ) : (
      <div>
        <p>
          <Badge status="error" text="不支持h264编码"></Badge>
        </p>
      </div>
    );

    const isSupportWebmain = info.isSupportWebmain ? (
      <div>
        <p>
          <Badge status="success" text="支持当前域名"></Badge>
        </p>
      </div>
    ) : (
      <div>
        <p>
          <Badge status="error" text="不支持当前域名"></Badge>
        </p>
      </div>
    );

    notification.open({
      message: "浏览器支持情况",
      description: (
        <div>
          {webSupport}
          {isSupportScreen}
          {H264Support}
          {isSupportWebmain}
        </div>
      ),
    });
  }

  const clickCheckCamera = () => {
    ertc.getCameraPermission().then((res) => {
      console.log('摄像头检测结果：', res);
    });
  }

  const clickCheckMicrophone = () => {
    ertc.getMicrophonePermission().then((res) => {
      console.log('麦克风检测结果：', res);
    });
  }

  const clickGetCamerasList = () => {
    ertc.getCamerasList().then((res) => {
      console.log('摄像头列表：', res);
    });
  };
  const clickGetMicrophonesList = () => {
    ertc.getMicrophonesList().then((res) => {
      console.log('麦克风列表：', res);
    });
  };
  const clickGetSpeakerList = () => {
    ertc.getSpeakerList().then((res) => {
      console.log('扬声器列表：', res);
    });
  };


  useEffect(() => {
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

    const ertc = new ERTC(ertcSettings);
    setErtc(ertc);
  }, []);

  return (
    <div className="page-core">
      <div className="page-section">
        <Form layout="vertical">
          <Form.Item label="浏览器环境检查">
            <Button type="primary" onClick={clickGetBrowerEnv}>
            浏览器环境检查
            </Button>
          </Form.Item>
          <Form.Item label="摄像头可用检测">
            <Button type="primary" onClick={clickCheckCamera}>
            检查摄像头是否正常
            </Button>
          </Form.Item>
          <Form.Item label="麦克风可用检测">
            <Button type="primary" onClick={clickCheckMicrophone}>
            检查麦克风是否正常
            </Button>
          </Form.Item>
          <Form.Item label="获取摄像头列表">
            <Button type="primary" onClick={clickGetCamerasList}>
              获取摄像头列表
            </Button>
          </Form.Item>
          <Form.Item label="获取麦克风列表">
            <Button type="primary" onClick={clickGetMicrophonesList}>
              获取麦克风列表
            </Button>
          </Form.Item>
          <Form.Item label="获取扬声器列表">
            <Button type="primary" onClick={clickGetSpeakerList}>
              获取扬声器列表
            </Button>
          </Form.Item>
          <Form.Item label="通话前网络检测">
            <CheckNetwork />
          </Form.Item>
          <Form.Item label="桌面录屏">
            <ScreenRecord />
          </Form.Item>
        </Form>
      </div>
      <div className="page-section"></div>
    </div>
  );
}
