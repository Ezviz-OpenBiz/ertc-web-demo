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
} from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";

import "./index.less";

export default function CheckNetwork() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState(false);
  const [roomState, setRoomState] = useState({
    accessToken1: "",
    appId1: "",
    roomId1: "",
    userId1: "",
    accessToken2: "",
    appId2: "",
    roomId2: "",
    userId2: "",
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

  const clickCheckNetwork = async () => {
    let uplinkERTC = null; // 用于检测上行网络质量
    let downlinkERTC = null; // 用于检测下行网络质量
    let testResult = {
      // 记录上行网络质量数据
      uplinkNetworkQualities: [],
      // 记录下行网络质量数据
      downlinkNetworkQualities: [],
      average: {
        uplinkNetworkQuality: 0,
        downlinkNetworkQuality: 0,
      },
    };

    // 1. 检测上行网络质量
    async function testUplinkNetworkQuality() {
      return new Promise((resolve, reject) => {
        uplinkERTC = new ERTC(ertcSettings);
        uplinkERTC
          .enterRoom({
            accessToken: roomState["accessToken1"],
            appId: roomState["appId1"],
            roomId: roomState["roomId1"],
            userId: roomState["userId1"],
          })
          .then((res) => {
            if (res.code === 0) {
              uplinkERTC
                .startLocalVideo()
                .then((res2) => {
                  if (res2.code === 0) resolve(res2);
                  else reject(res2);
                })
                .catch(reject);
            } else {
              reject(res);
            }
          })
          .catch(reject);
        uplinkERTC.on(ERTC.EVENT.REPORT_NETWORK_QUALITY, (event) => {
          const { uplink } = event;
          testResult.uplinkNetworkQualities.push(event.uplink);
        });
      });
    }
    // 2. 检测下行网络质量
    async function testDownlinkNetworkQuality() {
      return new Promise((resolve, reject) => {
        downlinkERTC = new ERTC(ertcSettings);
        downlinkERTC
          .enterRoom({
            accessToken: roomState["accessToken2"],
            appId: roomState["appId2"],
            roomId: roomState["roomId2"],
            userId: roomState["userId2"],
          })
          .then((res) => {
            if (res.code === 0) {
              downlinkERTC
                .subscribeStream({
                  userId: roomState["userId1"],
                  type: ERTC.STREAM_TYPE.VIDEO_ONLY,
                })
                .then((res2) => {
                  if (res2.code === 0) resolve(res2);
                  else reject(res2);
                })
                .catch(reject);
            } else {
              reject(res);
            }
          })
          .catch(reject);
        downlinkERTC.on(ERTC.EVENT.REPORT_NETWORK_QUALITY, (event) => {
          const { downlink } = event;
          testResult.downlinkNetworkQualities.push(downlink);
        });
      });
    }
    // 3. 开始检测,先上行发布视频，避免下行在上行未加入房间前进行订阅
    try {
      await testUplinkNetworkQuality();
      await testDownlinkNetworkQuality();
    } catch (error) {
      console.error(error);
      return;
    }
    // 4. 30s 后停止检测，计算平均网络质量

    setStatus(true);
    setTimeout(() => {
      setStatus(false);
      // 计算上行平均网络质量
      if (testResult.uplinkNetworkQualities.length > 0) {
        testResult.average.uplinkNetworkQuality = Math.round(
          testResult.uplinkNetworkQualities.reduce(
            (value, current) => value + current.quality,
            0
          ) / testResult.uplinkNetworkQualities.length
        );
      }
      if (testResult.downlinkNetworkQualities.length > 0) {
        // 计算下行平均网络质量
        testResult.average.downlinkNetworkQuality = Math.round(
          testResult.downlinkNetworkQualities.reduce(
            (value, current) => value + current.quality,
            0
          ) / testResult.downlinkNetworkQualities.length
        );
      }
      console.log("网络检测结果：", testResult);
      // 检测结束，清理相关状态。
      uplinkERTC.leaveRoom();
      downlinkERTC.leaveRoom();
    }, 30 * 1000);
  };

  return (
    <>
      <Row gutter={[16, 8]}>
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
      <Row gutter={[16, 8]} style={{ marginTop: 10, marginBottom: 10 }}>
        <Col span={2}>用户2：</Col>
        <Col span={5}>
          <Input
            addonBefore="资源token"
            value={roomState["accessToken2"]}
            onChange={(e) => changeRoomState("accessToken2", e.target.value)}
          />
        </Col>
        <Col span={5}>
          <Input
            addonBefore="appId"
            value={roomState["appId2"]}
            onChange={(e) => changeRoomState("appId2", e.target.value)}
          />
        </Col>
        <Col span={5}>
          <Input
            addonBefore="roomId"
            value={roomState["roomId2"]}
            onChange={(e) => changeRoomState("roomId2", e.target.value)}
          />
        </Col>
        <Col span={5}>
          <Input
            addonBefore="userId"
            value={roomState["userId2"]}
            onChange={(e) => changeRoomState("userId2", e.target.value)}
          />
        </Col>
      </Row>
      <Button type="primary" loading={status} onClick={clickCheckNetwork}>
        {status ? "检测中..." : "网络检测"}
      </Button>
    </>
  );
}
