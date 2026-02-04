import { getToken } from './auth';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectTimer = null;
    this.heartbeatTimer = null;
    this.heartbeatInterval = 30000; // 30秒心跳
    this.reconnectDelay = 5000; // 5秒重连延迟
    this.isConnecting = false;
    this.isConnected = false;
    this.messageHandlers = [];
    this.wsUrl = 'ws://192.168.31.61:8080/ws/ns/default';
  }

  // 初始化WebSocket连接
  init() {
    if (this.isConnected || this.isConnecting) {
      return;
    }

    const token = getToken();
    if (!token) {
      console.log('WebSocket: 未登录，无法连接');
      return;
    }

    this.isConnecting = true;
    const url = `${this.wsUrl}?token=${token}`;

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('WebSocket: 连接成功');
        this.isConnecting = false;
        this.isConnected = true;
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('WebSocket: 解析消息失败:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket: 连接关闭');
        this.isConnecting = false;
        this.isConnected = false;
        this.stopHeartbeat();
        this.reconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket: 连接错误:', error);
        this.isConnecting = false;
        this.isConnected = false;
      };
    } catch (error) {
      console.error('WebSocket: 创建连接失败:', error);
      this.isConnecting = false;
      this.isConnected = false;
      this.reconnect();
    }
  }

  // 发送心跳
  sendHeartbeat() {
    if (!this.isConnected || !this.ws) {
      return;
    }

    const heartbeatMessage = {
      category: 'heartbeat',
      command: 'ping',
      payload: {}
    };

    try {
      this.ws.send(JSON.stringify(heartbeatMessage));
      console.log('WebSocket: 发送心跳');
    } catch (error) {
      console.error('WebSocket: 发送心跳失败:', error);
      this.isConnected = false;
      this.reconnect();
    }
  }

  // 开始心跳
  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, this.heartbeatInterval);
  }

  // 停止心跳
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // 重连
  reconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      const token = getToken();
      if (token) {
        console.log('WebSocket: 尝试重连');
        this.init();
      } else {
        console.log('WebSocket: 未登录，停止重连');
      }
    }, this.reconnectDelay);
  }

  // 处理消息
  handleMessage(message) {
    // 处理心跳响应
    if (message.category === 'heartbeat' && message.command === 'pong') {
      console.log('WebSocket: 收到心跳响应');
      return;
    }

    // 调用注册的消息处理器
    this.messageHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('WebSocket: 消息处理器执行失败:', error);
      }
    });
  }

  // 发送消息
  send(message) {
    if (!this.isConnected || !this.ws) {
      console.error('WebSocket: 未连接，无法发送消息');
      return false;
    }

    try {
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('WebSocket: 发送消息失败:', error);
      return false;
    }
  }

  // 注册消息处理器
  onMessage(handler) {
    if (typeof handler === 'function' && !this.messageHandlers.includes(handler)) {
      this.messageHandlers.push(handler);
    }
  }

  // 移除消息处理器
  offMessage(handler) {
    const index = this.messageHandlers.indexOf(handler);
    if (index > -1) {
      this.messageHandlers.splice(index, 1);
    }
  }

  // 断开连接
  disconnect() {
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnecting = false;
    this.isConnected = false;
    this.messageHandlers = [];
    console.log('WebSocket: 主动断开连接');
  }

  // 检查连接状态
  getStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting
    };
  }
}

// 导出单例
const wsService = new WebSocketService();
export default wsService;