/**
 * 事件发射器 - 基于发布订阅模式
 * 统一前后端涉及到的基于各种事件的处理
 */
export class EventEmitter<T extends string> {
  private events: Map<T, Set<Function>>;

  constructor() {
    this.events = new Map();
  }

  /**
   * 监听事件
   * @param event 事件名称
   * @param listener 事件监听器
   */
  on(event: T, listener: Function) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(listener);
  }

  /**
   * 移除事件监听器
   * @param event 事件名称
   * @param listener 事件监听器
   */
  off(event: T, listener: Function) {
    if (!this.events.has(event)) {
      return;
    }
    this.events.get(event)!.delete(listener);
  }

  /**
   * 监听一次性事件
   * @param event 事件名称
   * @param listener 事件监听器
   */
  once(event: T, listener: Function) {
    const onceListener = (...args: any[]) => {
      listener(...args);
      this.off(event, onceListener);
    };
    this.on(event, onceListener);
  }

  /**
   * 触发事件
   * @param event 事件名称
   * @param args 事件参数
   */
  emit(event: T, ...args: any[]) {
    if (!this.events.has(event)) {
      return;
    }
    // 遍历所有注册到该事件的监听器，并依次调用它们，传递事件参数
    this.events.get(event)!.forEach((listener) => {
      listener(...args);
    });
  }

  /**
   * 移除所有事件监听器
   */
  removeAllListeners() {
    this.events.clear();
  }
}
