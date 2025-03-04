namespace Server.WebSocketHubNS
{
    public interface IWebSocketConnections
    {
        abstract public WebSocketGroup Group(string groupId);

        abstract public void AddToGroup(string connectionId, string groupId);

        abstract public void RemoveFromGroup(string connectionId, string groupId);

        abstract public void AddConnection(WebSocketClient client);

        abstract public void RemoveConnection(WebSocketClient client);

        abstract public bool TryGetClient(string connectionId, out WebSocketClient? client);
    }
}
