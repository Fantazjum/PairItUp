using System.Net.WebSockets;

namespace Server.WebSocketHubNS
{
    public interface IWebSocketHub : IDisposable
    {
        abstract public Task Connect(WebSocket socket);

        abstract public void Disconnect();

        abstract public void Invoke(string methodName, object?[]? args);
    }
}
