using System.Collections.Concurrent;

namespace Server.WebSocketHubNS
{
    public class WebSocketGroup(string groupId)
    {

        public readonly string GroupId = groupId;

        public ConcurrentDictionary<string, WebSocketClient> Clients { get; } = [];

        /// <summary>
        /// Removes a client from the group and gives information needed to decide to delete the group.
        /// </summary>
        /// <param name="client"></param>
        /// <returns>True if group still has clients, else false.</returns>
        internal bool Remove(WebSocketClient client)
        {
            Clients.TryRemove(client.ConnectionId, out var _);
            
            return !Clients.IsEmpty;
        }

        /// <summary>
        /// Adds the client to the group, ensuring it will remove itself from the group on disconnect
        /// </summary>
        /// <param name="client"></param>
        internal void Add(WebSocketClient client)
        {
            Clients.TryAdd(client.ConnectionId, client);
            client.Groups.Add(this);
        }

        /// <summary>
        /// Sends message and optional arguments to the source of websocket
        /// </summary>
        /// <param name="message"></param>
        /// <param name="args"></param>
        public void SendAsync(string message, object?[]? args = null)
        {
            foreach (var client in Clients.Values)
            {
                client.SendAsync(message, args); 
            }
        }
    }
}
