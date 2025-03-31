using Server.WebSocketDTO;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

namespace Server.WebSocketHubNS
{
    public class WebSocketClient(WebSocket connection, string connectionId)
    {
        internal readonly WebSocket _connection = connection;
        internal List<WebSocketGroup> Groups { get; } = [];
        public string ConnectionId { get; } = connectionId;

        public async void SendAsync(string message, object?[]? args = null) 
        {
            List<WebSocketState> validStates = [WebSocketState.Open, WebSocketState.CloseSent];
            byte[] buffer;
            if (args == null)
            {
                buffer = Encoding.UTF8.GetBytes(message);
            }
            else
            {
                var messageObject = new WebSocketMessage(message, args);
                buffer = JsonSerializer.SerializeToUtf8Bytes(messageObject);
            }

            if (validStates.Contains(_connection.State))
            {
                await _connection.SendAsync(
                    new ArraySegment<byte>(buffer),
                    WebSocketMessageType.Binary,
                    true,
                    CancellationToken.None
                );
            }
        }

        internal async Task Disconnect(CancellationTokenSource? cancelSource = null)
        {
            List<WebSocketState> validStates = [WebSocketState.Open, WebSocketState.CloseSent];
            if (validStates.Contains(_connection.State))
            {
                await _connection.CloseOutputAsync(
                    WebSocketCloseStatus.NormalClosure,
                    "Websocket closed by server",
                    CancellationToken.None);

                if (cancelSource != null)
                {
                    await cancelSource.CancelAsync();
                }
            }

            foreach(var group in Groups)
            {
                group.Remove(this);
            }
        }
    }
}
