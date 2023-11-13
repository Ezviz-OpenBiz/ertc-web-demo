import React from "react";
import { Collapse, Badge, Button, notification } from "antd";
import imgStep_2_1 from "../../assets/imgs/step-2-1.png";
import imgStep_3_1 from "../../assets/imgs/step-3-1.png";
import imgStep_3_2 from "../../assets/imgs/step-3-2.png";

export default (props) => {
  const clickSupport = () => {
    props.rtc.getSupport().then((info) => {
      const webSupport = info.isWebrtcSupport ? (
        <div>
          <p><Badge status="success" text='支持webrtc'></Badge></p>
          <p><Badge status="success" text='当前浏览器是SDK支持的浏览器'></Badge></p>
          <p><Badge status="success" text='当前浏览器支持获取媒体设备及媒体流'></Badge> </p>
          <p><Badge status="success" text='支持屏幕共享'></Badge></p>
        </div>
      ) : (
        <div>
          <p><Badge status="error" text='不支持webrtc'></Badge></p>
          <p><Badge status="error" text='当前浏览器不是SDK支持的浏览器'></Badge></p>
          <p><Badge status="error" text='当前浏览器不支持获取媒体设备及媒体流'></Badge></p>
          <p><Badge status="error" text='不支持屏幕共享'></Badge></p>
        </div>
      );
      const H264Support = info.isH264Support ? (
        <div>
          <p><Badge status="success" text='支持h264编码'></Badge></p>
        </div>
      ) : (
        <div>
          <p><Badge status="error" text='不支持h264编码'></Badge></p>
        </div>
      );

      notification.open({
        message: "浏览器支持情况",
        description: (
          <div>
            {webSupport}
            {H264Support}
          </div>
        ),
      });
    });
  };

  const collapseItems = [
    {
      key: "1",
      label: "步骤1：判断浏览器环境",
      children: (
        <div>
          <BadgeNode
            text={
              <span>
                判断当前浏览器环境是否满足使用 ERTC，
                <a onClick={clickSupport}>点击查看浏览器支持情况</a>
              </span>
            }
          ></BadgeNode>
        </div>
      ),
    },
    {
      key: "2",
      label: "步骤2：登录控制台创建应用",
      children: (
        <div>
          <BadgeNode text={<span>登录 <a target="_blank" href="https://open.ys7.com/console/home.html">萤石云开放平台</a>，点击【云通话】-【实时音视频】</span>}></BadgeNode>
          <BadgeNode text="点击【创建项目】，创建实时音视频项目">
            <img src={imgStep_2_1} style={{ width: 700 }} />
          </BadgeNode>
          <BadgeNode text={<span>你也可以通过接口进行管理与创建，地址是：<a target="_blank" href="https://open.ys7.com/help/1895">https://open.ys7.com/help/1895</a></span>}></BadgeNode>
        </div>
      ),
    },
    {
      key: "3",
      label: "步骤3：获取账号信息和应用信息",
      children: (
        <div>
          <BadgeNode text="点击左侧菜单【云通话】- 【实时音视频】，复制 AppID 填入输入框">
            <img src={imgStep_3_2} style={{ width: 700 }} />
          </BadgeNode>
          <BadgeNode text="点击左侧菜单【账号中心】- 【应用信息】，复制 accessToken 填入输入框">
            <img src={imgStep_3_1} style={{ width: 700 }} />
          </BadgeNode>
          <BadgeNode text="获取 RTCToken 填入输入框">
            <span>由开发者云办法给终端使用，可参考<a target="_blank" href="https://open.ys7.com/help/1873">https://open.ys7.com/help/1873</a> 使用本地JAVA SDK签名生成</span>
          </BadgeNode>
        </div>
      ),
    },
    {
      key: "4",
      label: "步骤4：开启视频通话",
      children: (
        <div>
          <BadgeNode text="输入UserID（开发者自定义）和RoomID（开发者自定义，即房间号/房间ID，字符串格式）"></BadgeNode>
          <BadgeNode text="点击【加入房间】按钮加入房间"></BadgeNode>
          <BadgeNode text="点击【采集麦克风】/ 【采集摄像头】按钮，可采集麦克风或摄像头"></BadgeNode>
          <BadgeNode text="点击【关闭麦克风】/ 【关闭摄像头】按钮，可终止采集麦克风或摄像头"></BadgeNode>
          <BadgeNode text="点击【开启屏幕共享】按钮开启屏幕分享"></BadgeNode>
          <BadgeNode text="点击【关闭屏幕共享】按钮取消屏幕分享"></BadgeNode>
        </div>
      ),
    },
  ];
  function BadgeNode({ text, children }) {
    return (
      <div>
        <Badge
          color="hwb(205 6% 9%)"
          text={text}
        ></Badge>
        <div>{children}</div>
      </div>
    );
  }
  return <Collapse items={collapseItems} defaultActiveKey={["1"]}></Collapse>;
};
