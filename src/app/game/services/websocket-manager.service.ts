import { Injectable } from '@angular/core';
import { WebSocketMessage } from '../models/web-socket-message.model';

const RETRY_TIMER = 500;

@Injectable({
  providedIn: 'root'
})
export class WebsocketManagerService {
  private socket?: WebSocket;
  private callbacks: Map<string, Function[]> = new Map();
  private connectionUrl: string = '';
  private reconnectTimeout?: NodeJS.Timeout;

  public setUrl(url: string): void {
    if (this.socket) {
      if (this.socket.CLOSED) {
        this.socket.onclose = null;
        this.socket.close(1000, "Closing from client");
      }
    }

    this.connectionUrl = url;
    const socket = new WebSocket(url);
    this.socket = socket;
    this.registerListeners(socket);
  }

  public invoke(methodName: string, ...args: any[]): void {
    const socket = this.socket;
    if (socket) {
      const params: any[] = [methodName].concat(args);
      const messageObject: WebSocketMessage = {
        message: 'invoke',
        args: params,
      };
      const message = JSON.stringify(messageObject);
      if (socket) {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(message);
        } else {
          setTimeout(() => this.invoke(methodName, ...args), RETRY_TIMER / 10);
        }
      }
    } 
    
    if (!socket) {
      this.start();
      setTimeout(() => this.invoke(methodName, ...args), RETRY_TIMER / 5);
    }
  }

  private registerListeners(socket: WebSocket): void {
    socket.onmessage = (message) => {
      const data: Blob = message.data;
      data.text().then((text) => this.onMessage(text));
    };

    socket.onopen = () => {
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = undefined;
      }
    };

    socket.onclose = () => {
      this.socket = undefined;

      if (!this.reconnectTimeout) {
        this.reconnectTimeout = setTimeout(() => {
          this.reconnectTimeout = undefined;
          this.start();
        }, RETRY_TIMER);
      }
    };
  }

  private onMessage(textFromBlob: string): void {
    if (textFromBlob.charAt(0) === '{') {
      const message: WebSocketMessage = JSON.parse(textFromBlob);
      this.callbacks.get(message.message)
        ?.forEach(method => method.call(this, ...(message.args ?? [])));
    } else {
      this.callbacks.get(textFromBlob)?.forEach(method => method.call(this));
    }
  }

  public on(methodName: string, newMethod: (...args: any[]) => any): void {
    let methods: Function[] = [];
    if (this.callbacks.has(methodName)) {
      methods = this.callbacks.get(methodName)!;
    }
    this.callbacks.set(methodName, methods.concat(newMethod));
  }

  public off(methodName: string): void {
    if (this.callbacks.has(methodName)) {
      this.callbacks.delete(methodName);
    }
  }

  public stop(): void {
    if (this.socket) {
      this.socket.onclose = null;
      this.socket.close(1000, "Closing from client");
    }

    this.socket = undefined;
  }

  public start(): void {
    const socket = new WebSocket(this.connectionUrl);
    this.socket = socket;
    this.registerListeners(socket);
  }

  public isAlive(): boolean {
    return (this.socket?.readyState ?? WebSocket.CLOSED) === WebSocket.OPEN;
  }
}
