using System.Net.WebSockets;
using System.Text.Json;
using Server.Extensions;
using Server.WebSocketDTO;

namespace Server.WebSocketHubNS
{
  public class WebSocketHubBase(IWebSocketConnections connection) : IWebSocketHub
  {
        private readonly CancellationTokenSource cancellationSource = new();
        protected readonly IWebSocketConnections _connections = connection;
        protected string ConnectionId = Guid.Empty.ToString();

        public void Invoke(string methodName, object?[]? args)
        {
            var method = GetType().GetMethodByParams(methodName, args);
            if (method != null)
            {
                var types = method.GetParameters().Select(param => param.ParameterType);
                var parameters = args?.CastJsonElementsToTypes(types).ToArray();
                method.Invoke(this, parameters);
            }
        }

        public async Task Connect(WebSocket socket)
        {
            ConnectionId = Guid.NewGuid().ToString();
            var client = new WebSocketClient(socket, ConnectionId);
            _connections.AddConnection(client);
            await Listen(socket);
        }

        public virtual async void Disconnect()
        {
            if (_connections.TryGetClient(ConnectionId, out var socket))
            {
                await socket!.Disconnect(cancellationSource);
                _connections.RemoveConnection(socket!);
            }
        }

        protected async Task Listen(WebSocket webSocket)
        {
            List<WebSocketState> validStates = [WebSocketState.Open, WebSocketState.CloseSent];
            var buffer = new ArraySegment<byte>(new byte[1024 * 100]);
            WebSocketReceiveResult? receiveResult = null;

            while (!(receiveResult?.CloseStatus.HasValue ?? false))
            {
                using var socketStream = new MemoryStream();
                if (!validStates.Contains(webSocket.State))
                {
                    return;
                }
                
                do
                {
                    if (!validStates.Contains(webSocket.State))
                    {
                        return;
                    }

                    try
                    {
                        receiveResult = await webSocket
                            .ReceiveAsync(buffer, cancellationSource.Token);
                        socketStream.Write(buffer.Array!, buffer.Offset, receiveResult.Count);
                    }
                    catch (OperationCanceledException)
                    {
                        return;
                    }
                    catch (WebSocketException e)
                    {
                        if(e.ErrorCode != 0) { 
                            Console.WriteLine(e.Message);
                        }

                        return;
                    }
                }
                while (!receiveResult.EndOfMessage);

                socketStream.Seek(0, SeekOrigin.Begin);

                ProcessResult(socketStream, receiveResult.MessageType);                
            }

            if (validStates.Contains(webSocket.State))
            {
                await webSocket.CloseOutputAsync(
                        receiveResult?.CloseStatus!.Value
                            ?? WebSocketCloseStatus.Empty,
                        receiveResult?.CloseStatusDescription ?? null,
                        CancellationToken.None);
            }
        }

        protected void ProcessResult(MemoryStream resultStream, WebSocketMessageType messageType)
        {
            // do not process other message types
            if (messageType == WebSocketMessageType.Text)
            {
                var message = JsonSerializer.Deserialize<WebSocketMessage>(resultStream);
                if (message != null)
                {
                    if (message.message == "invoke")
                    {
                        var parameters = message.args!.Skip(1).ToArray();
                        Invoke(((JsonElement)message.args!.ElementAt(0)!).GetString()!, parameters);
                    }
                }
            }
        }

        public void Dispose() {
            Disconnect();
            GC.SuppressFinalize(this);
        }
    }
}
