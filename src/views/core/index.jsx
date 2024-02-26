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
} from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import CollapseC from "./CollapseC";

import "./index.less";

export default function Core() {
  const [messageApi, contextHolder] = message.useMessage();
  const [searchParams] = useSearchParams();
  const [ezrtc, setEzrtc] = useState(null); // EzRTC 实例
  const [logs, setLogs] = useState([]);
  const [hasMediaPermission, setHasMediaPermission] = useState(false);
  const [showLocalVideo, setShowLocalVideo] = useState(false);
  const [loadingEnterRoom, setLoadingEnterRoom] = useState(false);
  const [roomState, setRoomState] = useState({
    accessToken: "",
    appId: "",
    roomId: "",
    userId: "",
    rtctoken: "",
  });
  const [camerasList, setCamerasList] = useState([]);
  const [microphonesList, setMicrophonesList] = useState([]);
  const [profile, setProfile] = useState({}); // 视频参数
  const [remoteUsers, setRemoteUsers] = useState([]); // 远端用户
  const [localStream, setLocalStream] = useState(null); // 本地流
  const [volumeList, setVolumeList] = useState([]); // 音量列表
  const [qualityMap, setQualityMap] = useState({}); // 网络质量列表

  const remoteUsersRef = useRef(null);
  remoteUsersRef.current = remoteUsers; // 远端用户(ref)，避免闭包逻辑中的remoteUsers不是最新的

  // 获取媒体权限，页面加载时调用
  const getMediaPermission = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
        setHasMediaPermission(true);
      })
      .catch((err) => {
        console.log("err", err);
        messageApi.open({
          type: "error",
          content: `获取媒体权限失败，请检查摄像头、麦克风是否被占用: ${err}`,
        });
      });
  };
  // 添加日志
  const addLog = (log) => {
    log.date = new Date().toLocaleString(); // 记录当前时间
    setLogs((pre) => [...pre, log]);
  };
  // 清除日志
  const clearLogs = () => {
    setLogs([]);
  };
  // 格式化日志
  const json = (arg) => {
    // 判断是否为对象
    return arg instanceof Object &&
      !(arg instanceof Error) &&
      !(arg instanceof MediaStream)
      ? JSON.stringify(arg)
      : arg;
  };

  // 改变房间参数
  const changeRoomState = (target, value) => {
    setRoomState({
      ...roomState,
      [target]: value,
    });
  };
  // 改变视频参数
  const changeProfile = (target, value) => {
    setProfile({
      ...profile,
      [target]: value,
    });
  };
  // 改变远端用户属性
  const changeRemoteUsersProp = (userId, prop, value) => {
    const remoteUsersCopy = [...remoteUsersRef.current];
    remoteUsersCopy.forEach((item) => {
      if (item.userId === userId) {
        if (value) {
          item[prop] = value;
        } else {
          item[prop] = !item[prop];
        }
        // 大小流
        if (prop === "small") {
          ezrtc
            .subscribeStream({
              userId: item.userId,
              type:
                item.small === true
                  ? ERTC.STREAM_TYPE.VIDEO_SIMULCAST_LITTLE
                  : ERTC.STREAM_TYPE.VIDEO_ONLY,
            })
            .then((res) => {
              addLog({
                type: "success",
                label: `切换到${item[prop] ? "小" : "大"}流成功：${json(res)}`,
              });
            })
            .catch((err) => {
              addLog({ type: "error", label: `切换流失败：${json(err)}` });
            });
        }
      }
    });
    setRemoteUsers(remoteUsersCopy);
  };
  // 获取摄像头列表
  const getCamerasList = () => {
    ezrtc.getCamerasList().then((list) => {
      console.log("摄像头列表", list);
      setCamerasList(list || []);
    });
  };
  // 获取麦克风列表
  const getMicrophonesList = () => {
    ezrtc.getMicrophonesList().then((list) => {
      console.log("麦克风列表", list);

      const listFilter = list.reduce((acc, current) => {
        const x = acc.find((item) => item.groupId === current.groupId);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);
      setMicrophonesList(listFilter || []);
    });
  };

  /**
   * api
   *  */
  // 加入房间
  const enterRoom = () => {
    setLoadingEnterRoom(true);
    ezrtc
      .enterRoom({
        accessToken: roomState["accessToken"],
        appId: roomState["appId"],
        roomId: roomState["roomId"],
        userId: roomState["userId"],
        rtctoken: roomState["rtctoken"],
      })
      .then((res) => {
        addLog({ type: "success", label: `加入房间成功：${res}` });
      })
      .catch((err) => {
        addLog({ type: "error", label: `加入房间失败：${json(err)}` });
      })
      .finally(() => {
        setLoadingEnterRoom(false);
      });
  };
  // 离开房间
  const leaveRoom = () => {
    ezrtc
      .leaveRoom()
      .then((res) => {
        addLog({ type: "success", label: `离开房间成功：${json(res)}` });
      })
      .catch((err) => {
        addLog({ type: "error", label: `离开房间失败：${json(err)}` });
      });
  };
  // 采集摄像头
  const startLocalVideo = () => {
    ezrtc
      .startLocalVideo()
      .then((res) => {
        addLog({ type: "success", label: `采集摄像头成功：${json(res)}` });
      })
      .catch((err) => {
        addLog({ type: "error", label: `采集摄像头失败：${json(err)}` });
      });
  };
  // 关闭摄像头
  const stopLocalVideo = () => {
    ezrtc
      .stopLocalVideo()
      .then((res) => {
        addLog({ type: "success", label: `关闭摄像头成功：${json(res)}` });
      })
      .catch((err) => {
        addLog({ type: "error", label: `关闭摄像头失败：${json(err)}` });
      });
  };
  // 暂停摄像头
  const pauseLocalVideo = () => {
    ezrtc
      .pauseLocalVideo()
      .then((res) => {
        addLog({ type: "success", label: `暂停摄像头成功：${json(res)}` });
      })
      .catch((err) => {
        addLog({ type: "error", label: `暂停摄像头失败：${json(err)}` });
      });
  };
  // 恢复摄像头
  const resumeLocalVideo = () => {
    ezrtc
      .resumeLocalVideo()
      .then((res) => {
        addLog({ type: "success", label: `恢复摄像头成功：${json(res)}` });
      })
      .catch((err) => {
        addLog({ type: "error", label: `恢复摄像头失败：${json(err)}` });
      });
  };

  // 采集麦克风
  const startLocalAudio = () => {
    ezrtc
      .startLocalAudio()
      .then((res) => {
        addLog({ type: "success", label: `采集麦克风成功：${json(res)}` });
      })
      .catch((err) => {
        addLog({ type: "error", label: `采集麦克风失败：${json(err)}` });
      });
  };
  // 关闭麦克风
  const stopLocalAudio = () => {
    ezrtc
      .stopLocalAudio()
      .then((res) => {
        addLog({ type: "success", label: `关闭麦克风成功：${json(res)}` });
      })
      .catch((err) => {
        addLog({ type: "error", label: `关闭麦克风失败：${json(err)}` });
      });
  };
  // 暂停麦克风
  const pauseLocalAudio = () => {
    ezrtc
      .pauseLocalAudio()
      .then((res) => {
        addLog({ type: "success", label: `暂停麦克风成功：${json(res)}` });
      })
      .catch((err) => {
        addLog({ type: "error", label: `暂停麦克风失败：${json(err)}` });
      });
  };
  // 恢复麦克风
  const resumeLocalAudio = () => {
    ezrtc
      .resumeLocalAudio()
      .then((res) => {
        addLog({ type: "success", label: `恢复麦克风成功：${json(res)}` });
      })
      .catch((err) => {
        addLog({ type: "error", label: `恢复麦克风失败：${json(err)}` });
      });
  };

  // 开启屏幕共享
  const startScreenShare = () => {
    ezrtc
      .startScreenShare()
      .then((res) => {
        addLog({ type: "success", label: `开启屏幕共享成功：${json(res)}` });
      })
      .catch((err) => {
        addLog({ type: "error", label: `开启屏幕共享失败：${json(err)}` });
      });
  };
  // 关闭屏幕共享
  const stopScreenShare = () => {
    ezrtc
      .stopScreenShare()
      .then((res) => {
        addLog({ type: "success", label: `关闭屏幕共享成功：${json(res)}` });
      })
      .catch((err) => {
        addLog({ type: "error", label: `关闭屏幕共享失败：${json(err)}` });
      });
  };

  // 设置配置信息
  const setProfile2 = () => {
    ezrtc?.setProfile(profile);
  };

  /**
   * bindEvents
   * */
  const bindEvents = (rtc) => {
    Object.entries(ERTC.EVENT).forEach(([key, value]) => {
      let fn = (msg) => {
        addLog({ type: "default", label: json(msg) });
      };
      const fnLog = fn;

      if ([ERTC.EVENT.USERS_CHANGE].includes(value)) {
        // 过滤掉一些事件,避免打印过多日志
        return;
      }
      // 房间所有成员音量统计
      if (value === ERTC.EVENT.AUDIOLEVEL) {
        fn = (msg) => {
          setVolumeList(msg.clientList);
        };
      }
      // 房间其他成员网络质量统计
      if (value === ERTC.EVENT.NETWORKQUALITY) {
        fn = (msg) => {
          setQualityMap((pre) => ({ ...pre, [msg.customId]: msg }));
          // changeRemoteUsersProp(msg.customId, "quality", { upquality: msg['upquality'], downquality: msg['downquality'] })
        };
      }
      // 视频旋转
      if (value === ERTC.EVENT.VIDEO_ROTATION) {
        fn = (msg) => {
          fnLog(msg);
          if (msg && msg.customId) {
            const deg = msg.rotate;
            let domVideo = document.getElementById(msg.customId);
            domVideo.style.transform = `rotate(${deg}deg)`;
            setRemoteUsers((pre) => {
              const remoteUsersCopy = [...pre];
              const index = remoteUsersCopy.findIndex(
                (item) => item.userId === msg.customId
              );
              if (index > -1) {
                remoteUsersCopy[index]["rotate"] = deg;
              }
              return remoteUsersCopy;
            });
          }
        };
      }

      // 监听错误
      if (value === ERTC.EVENT.ERROR) {
        fn = (msg) => {
          addLog({ type: "error", label: json(msg) });
        };
      }

      // 网络质量上报
      if (value === ERTC.EVENT.REPORT_NETWORK_QUALITY) {
        fn = ({ uplink, downlink }) => {
          addLog({
            type: "default",
            label: `上行网络质量：${uplink.quality}，上行丢包率：${uplink.packageLost}，上行抖动：${uplink.jitter} ms，上行延时：${uplink.rtt} ms`,
          });
          addLog({
            type: "default",
            label: `下行网络质量：${downlink.quality}，下行丢包率：${downlink.packageLost}，下行抖动：${downlink.jitter} ms，下行延时：${downlink.rtt} ms`,
          });
        };
      }

      // 远端用户加入房间
      if (value === ERTC.EVENT.CLIENTJOIN) {
        fn = (msg) => {
          fnLog(msg);
          const userId = msg.customId;
          setRemoteUsers((pre) => [...pre, { userId }]);
        };
      }
      // 远端用户离开房间
      if (value === ERTC.EVENT.CLIENTLEAVE) {
        fn = (msg) => {
          fnLog(msg);
          const userId = msg.customId;
          setRemoteUsers((pre) => pre.filter((item) => item.userId !== userId));
        };
      }

      // 远端流添加
      if (value === ERTC.EVENT.STREAM_ADDED) {
        fn = (msg) => {
          fnLog(msg);
          const remoteUser =
            remoteUsersRef.current.find(
              (item) => item.userId === msg.customId
            ) || {};

          // 视频小流处理
          if (msg.streamtype === ERTC.STREAM_TYPE.VIDEO_SIMULCAST_LITTLE) {
            if (!remoteUser.small) {
              // 如果之前没订阅过，则默认不订阅
              return;
            }
          }
          // 视频大流处理
          if (
            msg.streamType === ERTC.STREAM_TYPE.VIDEO_ONLY &&
            remoteUser.small
          ) {
            // 如果之前订阅的小流，则不订阅大流（对端重连自动发布）
            return;
          }
          // 自动订阅音频流、屏幕共享流、（视频大小流）
          rtc
            .subscribeStream({ userId: msg.customId, type: msg.streamtype })
            .then((res) => {
              addLog({
                type: "success",
                label: `自动订阅成功，用户：${msg.customId}，流类型：${msg.streamtype}`,
              });
              // setRemoteUsers((pre) => {
              //   const remoteUsersCopy = [...pre];
              //   const index = remoteUsersCopy.findIndex(
              //     (item) => item.userId === msg.customId
              //   );
              //   if (index > -1) {
              //     remoteUsersCopy[index][msg.streamtype] = true;
              //   }
              //   return remoteUsersCopy;
              // })
            })
            .catch((err) => {
              addLog({
                type: "error",
                label: `自动订阅失败，用户：${msg.customId}，流类型：${
                  msg.streamtype
                }，原因：${json(err)}`,
              });
            });
        };
      }
      // 远端流删除
      if (value === ERTC.EVENT.STREAM_REMOVED) {
        // ...
        fn = (msg) => {
          fnLog(msg);
          // 视频小流直接跳过，取消订阅大流默认会取消小流
          if (msg.streamtype === ERTC.STREAM_TYPE.VIDEO_SIMULCAST_LITTLE) {
            return;
          }
          // 取消订阅音频流、视频大流、屏幕共享流
          rtc
            .unsubscribe({ userId: msg.customId, type: msg.streamtype })
            .then((res) => {
              addLog({
                type: "success",
                label: `取消订阅成功，用户：${msg.customId}，流类型：${msg.streamtype}`,
              });
            })
            .catch((err) => {
              addLog({
                type: "error",
                label: `取消订阅失败，用户：${msg.customId}，流类型：${
                  msg.streamtype
                }，原因：${json(err)}`,
              });
            });
        };
      }

      // 获取到本地流
      if (value === ERTC.EVENT.LOCAL_STREAM_AVAILABLE) {
        fn = ({ stream, streamType }) => {
          const videoStream =
            streamType === ERTC.STREAM_TYPE.SCREEN ? null : stream;

          videoStream &&
            setLocalStream((pre) => ({ stream, refresh: !pre?.refresh })); // 由于react，useEffect不会检测到stream中音视频轨道数量的变化，所以需要加一个refresh字段
          addLog({ type: "default", label: "获取到本地流" });
        };
      }

      // 获取到远端流
      if (value === ERTC.EVENT.REMOTE_STREAM_AVAILABLE) {
        fn = (msg) => {
          if (msg.stream) {
            if (msg.streamType === ERTC.STREAM_TYPE.SCREEN) {
              rtc
                .playStream({ domId: "remote-screen", stream: msg.stream })
                .then((info) => {
                  addLog({
                    type: "default",
                    label: `获取到${msg.userId}的远端屏幕共享流`,
                  });
                });
            } else {
              rtc
                .playStream({ domId: msg.userId, stream: msg.stream })
                .then((info) => {
                  addLog({
                    type: "default",
                    label: `获取到${msg.userId}的远端音视频流`,
                  });
                });
            }
          }
        };
      }

      // 监听websocket连接状态变更
      if (value === ERTC.EVENT.CONNECT_STATE_CHANGE) {
        fn = (msg) => {
          if (msg.code === 0) {
            addLog({ type: "default", label: "websocket连接成功" });
            // 每次连接成功后，清空远端用户列表
            setRemoteUsers([]);
          } else if (msg.message === "reconnecting now") {
            addLog({ type: "default", label: "websocket正在重连中" });
          } else if (msg.message === "reconnect failed") {
            addLog({ type: "error", label: "websocket重连失败" });
          } else if (msg.message === "janus destroyed") {
            addLog({ type: "default", label: "websocket连接断开" });
            // 每次连接断开后，清空远端用户列表
            setRemoteUsers([]);
          }
        };
      }

      rtc.on(value, fn);
    });
  };

  /**
   * hooks
   * */
  useEffect(() => {
    const env = searchParams.get("env"); // 从url中获取env参数，用于项目中切换环境，开发者接入可以忽略
    const domain = searchParams.get("domain"); // url中获取domain参数，用于项目中切换域名，开发者接入可以忽略
    const ertcSettings = {
      debug: true,
      domain: domain
        ? decodeURIComponent(domain)
        : env === "dev"
        ? "https://test12open.ys7.com"
        : null, // 从url中获取env参数，用于项目中切换环境，开发者接入可以忽略
    };
    const rtc = new ERTC(ertcSettings);
    window.ertc = rtc; // 赋值到全局，方便console中查看
    setEzrtc(rtc);

    bindEvents(rtc);
    getMediaPermission();
  }, []);
  useEffect(() => {
    if (hasMediaPermission && ezrtc) {
      getCamerasList();
      getMicrophonesList();
    }
  }, [ezrtc, hasMediaPermission]);
  useEffect(() => {
    setProfile2();
  }, [profile]);
  // 播放本地视频
  useEffect(() => {
    if (localStream?.stream && showLocalVideo) {
      ezrtc.playStream({ domId: "local-video", stream: localStream.stream });
    }
  }, [localStream, showLocalVideo]);

  const gutter = [16, 8];
  return (
    <div className="page-core">
      {contextHolder}
      <div className="page-section">
        <CollapseC rtc={ezrtc} />
      </div>
      <div className="page-section">
        <Row gutter={gutter} style={{ marginBottom: 10 }}>
          <Col span={24}>房间参数：</Col>
        </Row>
        <Row gutter={gutter}>
          <Col span={12}>
            <Input
              addonBefore="accessToken"
              value={roomState["accessToken"]}
              onChange={(e) => changeRoomState("accessToken", e.target.value)}
            />
          </Col>
          <Col span={12}>
            <Input
              addonBefore="appId"
              value={roomState["appId"]}
              onChange={(e) => changeRoomState("appId", e.target.value)}
            />
          </Col>
          <Col span={12}>
            <Input
              addonBefore="roomId"
              value={roomState["roomId"]}
              onChange={(e) => changeRoomState("roomId", e.target.value)}
            />
          </Col>
          <Col span={12}>
            <Input
              addonBefore="userId"
              value={roomState["userId"]}
              onChange={(e) => changeRoomState("userId", e.target.value)}
            />
          </Col>
          <Col span={12}>
            <Input
              addonBefore="rtctoken"
              value={roomState["rtctoken"]}
              onChange={(e) => changeRoomState("rtctoken", e.target.value)}
            />
          </Col>
        </Row>
      </div>
      <div className="page-section">
        <Row gutter={gutter} style={{ marginBottom: 10 }}>
          <Col span={24}>
            媒体
            <Tooltip title="参数更改后，要重新加入房间才会生效">
              <QuestionCircleOutlined
                style={{ color: "#fa8c16", marginLeft: 5 }}
              />
            </Tooltip>
            ：
          </Col>
        </Row>
        <Row gutter={gutter}>
          <Col span={12}>
            <Space.Compact style={{ display: "flex" }}>
              <Radio.Button>摄像头</Radio.Button>
              <Select
                style={{ flex: 1 }}
                options={camerasList.map((item) => ({
                  label: item.label || item.deviceId,
                  value: item.deviceId,
                }))}
                onChange={(value) => changeProfile("cameraId", value)}
              />
            </Space.Compact>
          </Col>
          <Col span={12}>
            <Space.Compact style={{ display: "flex" }}>
              <Radio.Button>麦克风</Radio.Button>
              <Select
                style={{ flex: 1 }}
                options={microphonesList.map((item) => ({
                  label: item.label || item.deviceId,
                  value: item.deviceId,
                }))}
                onChange={(value) => changeProfile("microphoneId", value)}
              />
            </Space.Compact>
          </Col>
        </Row>
      </div>
      <div className="page-section">
        <Row gutter={gutter} style={{ marginBottom: 10 }}>
          <Col span={24}>
            <span>视频设置</span>
            <Tooltip title="参数更改后，要重新加入房间才会生效">
              <QuestionCircleOutlined
                style={{ color: "#fa8c16", marginLeft: 5 }}
              />
            </Tooltip>
            ：
          </Col>
        </Row>
        <Row gutter={gutter}>
          <Col span={4}>
            <InputNumber
              addonBefore="宽度"
              style={{ width: "100%" }}
              value={profile["width"]}
              onChange={(value) => changeProfile("width", value)}
            ></InputNumber>
          </Col>
          <Col span={4}>
            <InputNumber
              addonBefore="高度"
              style={{ width: "100%" }}
              value={profile["height"]}
              onChange={(value) => changeProfile("height", value)}
            ></InputNumber>
          </Col>
          <Col span={4}>
            <InputNumber
              addonBefore="帧率"
              style={{ width: "100%" }}
              value={profile["frameRate"]}
              onChange={(value) => changeProfile("frameRate", value)}
            ></InputNumber>
          </Col>
          <Col span={6}>
            <InputNumber
              addonBefore="传输码率"
              style={{ width: "100%" }}
              value={profile["bitrate"]}
              addonAfter="kbs"
              onChange={(value) => changeProfile("bitrate", value)}
            ></InputNumber>
          </Col>
          <Col span={4}>
            <Switch
              checkedChildren="大小流开启"
              unCheckedChildren="大小流关闭"
              checked={profile["simulcast"]}
              onChange={(value) => changeProfile("simulcast", value)}
            />
          </Col>
        </Row>
      </div>

      {/* 操作 */}
      <div className="page-section">
        <Row gutter={gutter} style={{ marginBottom: 10 }}>
          <Col span={24}>操作：</Col>
        </Row>
        <Row gutter={gutter} style={{ marginBottom: 10 }}>
          <Space gap="small" wrap="wrap">
            <Button
              type="primary"
              loading={loadingEnterRoom}
              onClick={enterRoom}
            >
              加入房间
            </Button>
            <Button type="primary" onClick={leaveRoom}>
              离开房间
            </Button>
          </Space>
        </Row>
        <Row gutter={gutter} style={{ marginBottom: 10 }}>
          <Space gap="small" wrap="wrap">
            <Button type="primary" onClick={startLocalVideo}>
              采集摄像头
            </Button>
            <Button type="primary" onClick={stopLocalVideo}>
              关闭摄像头
            </Button>
            <Button type="primary" onClick={pauseLocalVideo}>
              暂停
            </Button>
            <Button type="primary" onClick={resumeLocalVideo}>
              恢复
            </Button>
          </Space>
        </Row>
        <Row gutter={gutter} style={{ marginBottom: 10 }}>
          <Space>
            <Button type="primary" onClick={startLocalAudio}>
              采集麦克风
            </Button>
            <Button type="primary" onClick={stopLocalAudio}>
              关闭麦克风
            </Button>
            <Button type="primary" onClick={pauseLocalAudio}>
              暂停
            </Button>
            <Button type="primary" onClick={resumeLocalAudio}>
              恢复
            </Button>
          </Space>
        </Row>
        <Row gutter={gutter} style={{ marginBottom: 10 }}>
          <Space gap="small" wrap="wrap">
            <Button type="primary" onClick={startScreenShare}>
              开启屏幕共享
            </Button>
            <Button type="primary" onClick={stopScreenShare}>
              关闭屏幕共享
            </Button>
          </Space>
        </Row>
      </div>

      {/* 日志 */}
      <div className="page-section">
        <Row gutter={gutter} style={{ marginBottom: 10 }}>
          <Row style={{ width: "100%" }} justify="space-between">
            <div>日志：</div>
            <Button onClick={clearLogs}>清除日志</Button>
          </Row>
          <div className="logs">
            {logs.map((log, index) => (
              <div key={index}>
                <Badge
                  status={log.type}
                  text={`【${log.date}】 ${log.label}`}
                />
              </div>
            ))}
          </div>
        </Row>
      </div>

      {/* 播放窗口 */}
      <div className="page-section">
        <Row gutter={gutter} style={{ marginBottom: 10 }}>
          <Col span={24}>
            播放窗口：
            <Switch
              checkedChildren="本地流显示"
              unCheckedChildren="本地流隐藏"
              onChange={(value) => {
                setShowLocalVideo(!!value);
              }}
            />
          </Col>
        </Row>
        <Row gutter={gutter} style={{ marginBottom: 10 }}>
          <Col span={24} lg={12}>
            <div className="user-play">
              <div>用户：</div>
              <Row gutter={gutter} style={{ marginBottom: 10 }}>
                {showLocalVideo && (
                  <Col>
                    <div>本地用户（{roomState.userId}）：</div>
                    <div>
                      音量：
                      {volumeList?.find(
                        (volume) => volume.customId === roomState.userId
                      )?.audioleve || null}
                    </div>
                    <video
                      id="local-video"
                      controls
                      style={{ width: 300, height: 200 }}
                    ></video>
                  </Col>
                )}
                {remoteUsers.map((item, index) => {
                  return (
                    <Col key={item.userId}>
                      <div>
                        <div>{item.userId}：</div>
                        <div style={{ display: "flex" }}>
                          <div style={{ flex: 1 }}>
                            音量：
                            {volumeList?.find(
                              (volume) => volume.customId === item.userId
                            )?.audioleve || null}
                          </div>
                          <div>
                            网络：上行=
                            {qualityMap[item.userId]?.upquality || 0}
                            ，下行=
                            {qualityMap[item.userId]?.downquality || 0}
                          </div>
                        </div>
                        <video
                          id={item.userId}
                          controls
                          style={{
                            width: 300,
                            height: 200,
                            transform: `rotate(${item.rotate || 0}deg)`,
                          }}
                        ></video>
                        <div>
                          <Button
                            type="primary"
                            style={{ marginRight: 10 }}
                            onClick={() =>
                              changeRemoteUsersProp(item.userId, "small")
                            }
                          >
                            切换到{item.small === true ? "大流" : "小流"}
                          </Button>
                          {/* <Button
                        type="primary"
                        style={{ marginRight: 10 }}
                        onClick={() =>
                          changeRemoteUsersProp(item.userId, "video")
                        }
                      >
                        {item.video === true ? "取消" : "订阅"}视频
                      </Button>
                      <Button
                        type="primary"
                        onClick={() =>
                          changeRemoteUsersProp(item.userId, "audio")
                        }
                      >
                        {item.audio === true ? "取消" : "订阅"}音频
                      </Button> */}
                        </div>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </div>
          </Col>
          <Col span={24} lg={12}>
            <div className="screen-play">
              <div>屏幕：</div>
              {remoteUsers?.length > 0 && (
                <video
                  id="remote-screen"
                  style={{ width: 800, height: 600 }}
                ></video>
              )}
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
