import React from "react";
import { Collapse, Badge, Button, notification } from "antd";
import imgStep_2_1 from "../../assets/imgs/step-2-1.png";
import imgStep_3_1 from "../../assets/imgs/step-3-1.png";
import imgStep_3_2 from "../../assets/imgs/step-3-2.png";

export default (props) => {
  const clickSupport = () => {
    const res = props.rtc.isSupported();
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
      label: "步骤2：获取ERTC appId",
      children: (
        <div>
          <div>方式1：</div>
          <BadgeNode
            text={
              <span>
                <span>
                  登录{" "}
                  <a
                    target="_blank"
                    href="https://open.ys7.com/console/home.html"
                  >
                    萤石云开放平台
                  </a>
                  ，点击【云通话】-【实时音视频】
                </span>
              </span>
            }
          ></BadgeNode>
          <BadgeNode text="点击【创建项目】，创建实时音视频项目">
            <img src={imgStep_2_1} style={{ width: 700, marginBottom: 10 }} />
          </BadgeNode>
          <BadgeNode text="点击左侧菜单【云通话】- 【实时音视频】，复制 AppID 填入输入框">
            <img src={imgStep_3_2} style={{ width: 700 }} />
          </BadgeNode>
          <div style={{ marginTop: 10 }}>方式2：</div>
          <BadgeNode
            text={
              <span>
                你也可以通过接口进行管理与创建，地址是：
                <a target="_blank" href="https://open.ys7.com/help/1895">
                  https://open.ys7.com/help/1895
                </a>
              </span>
            }
          ></BadgeNode>
        </div>
      ),
    },
    {
      key: "3",
      label: "步骤3：获取ERTC资源token",
      children: (
        <div>
          <div>方式1：</div>
          <BadgeNode text="在开放平台控制台生成">
            <span>
              在控制台 - 云通话 - 实时音视频
              菜单下，点击【临时Token生成】，快捷生成Token{' '}
              <a
                target="_blank"
                href="https://open.ys7.com/console/rtc/projectManage.html"
              >
                https://open.ys7.com/console/rtc/projectManage.html
              </a>
            </span>
          </BadgeNode>

          <div style={{ marginTop: 10 }}>方式2：</div>
          <BadgeNode text="通过JAVA SDK获取">
            <span>
              由开发者云颁发给终端使用，使用本地JAVA SDK签名生成，参考
              <a target="_blank" href="https://open.ys7.com/help/1873">
                https://open.ys7.com/help/1873
              </a>{" "}
              章节E7: 颁发资源访问Token
            </span>
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
        <Badge color="hwb(205 6% 9%)" text={text}></Badge>
        <div>{children}</div>
      </div>
    );
  }
  return (
    <Collapse defaultActiveKey={["1", "4"]}>
      {collapseItems.map((item) => {
        return (
          <Collapse.Panel header={item.label} key={item.key}>
            {item.children}
          </Collapse.Panel>
        );
      })}
    </Collapse>
  );
};
