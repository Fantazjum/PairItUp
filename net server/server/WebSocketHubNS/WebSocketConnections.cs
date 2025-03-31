using Server.Utils;

namespace Server.WebSocketHubNS
{
    public class WebSocketConnections : IWebSocketConnections
    {
        /// <summary>
        /// Queue for modyfying groups
        /// </summary>
        private readonly MutexQueue _groupQueue = new();

        /// <summary>
        /// Queue for modyfying connections
        /// </summary>
        private readonly MutexQueue _connectionsQueue = new();

        /// <summary>
        /// Lock for reading and writing to group collection
        /// </summary>
        private readonly ReaderWriterLock _groupReadWrite = new();

        
        /// <summary>
        /// Lock for reading and writing to connections collection
        /// </summary>
        private readonly ReaderWriterLock _connectionReadWrite = new();

        /// <summary>
        /// List of connections.
        /// </summary>
        protected readonly Dictionary<string, WebSocketClient> _connections = [];

        /// <summary>
        /// Map of groups for communications
        /// </summary>
        private readonly Dictionary<string, WebSocketGroup> _groups = [];

        public WebSocketGroup Group(string groupId)
        {
            _groupReadWrite.AcquireReaderLock(-1);
            if (!_groups.TryGetValue(groupId, out WebSocketGroup? group))
            {
                _groupReadWrite.ReleaseReaderLock();
                _groupQueue.SyncModifyData(groupId, () => {
                    if (_groups.TryGetValue(groupId, out group))
                    {
                        return;
                    }

                    _groupReadWrite.AcquireWriterLock(-1);
                    group = new(groupId);
                    _groups[groupId] = group;
                    _groupReadWrite.ReleaseWriterLock();
                });

                return group!;
            }

            _groupReadWrite.ReleaseReaderLock();

            return group;
        }

        public void AddToGroup(string connectionId, string groupId)
        {
            _connectionReadWrite.AcquireReaderLock(-1);
            if (_connections.TryGetValue(connectionId, out var client))
            {
                Group(groupId).Add(client);
            }
            _connectionReadWrite.ReleaseReaderLock();
        }

        public void RemoveFromGroup(string connectionId, string groupId)
        {
            _connectionReadWrite.AcquireReaderLock(-1);
            if (_connections.TryGetValue(connectionId, out var client))
            {
                if (!Group(groupId).Remove(client))
                {
                    _groupQueue.SyncModifyData(groupId, () => {
                        _groupReadWrite.AcquireWriterLock(-1);
                        _groups.Remove(groupId);
                        _groupReadWrite.ReleaseWriterLock();
                    });
                }
            }
            _connectionReadWrite.ReleaseReaderLock();
        }

        public void AddConnection(WebSocketClient client)
        {
            _connectionsQueue.SyncModifyData(client.ConnectionId, () => {
                _connectionReadWrite.AcquireWriterLock(-1);
                _connections.Add(client.ConnectionId, client);
                _connectionReadWrite.ReleaseWriterLock();
            });
        }

        public void RemoveConnection(WebSocketClient client)
        {
            _connectionsQueue.SyncModifyData(client.ConnectionId, () => {
                _connectionReadWrite.AcquireWriterLock(-1);
                _connections.Remove(client.ConnectionId);
                _connectionReadWrite.ReleaseWriterLock();

                _groupQueue.SyncModifyData(client.ConnectionId, () => {
                    List<WebSocketGroup> toDelete = [];

                    foreach (var group in client.Groups)
                    {
                        if (!group.Remove(client))
                        {
                          toDelete.Add(group);
                        }
                    }

                    _groupReadWrite.AcquireWriterLock(-1);

                    foreach (var group in toDelete)
                    {
                        _groups.Remove(group.GroupId);
                    }

                    _groupReadWrite.ReleaseWriterLock();
                });
            });
        }


        public bool TryGetClient(string connectionId, out WebSocketClient? client)
        {
            _connectionReadWrite.AcquireReaderLock(-1);
            var tryResult = _connections.TryGetValue(connectionId, out client);
            _connectionReadWrite.ReleaseReaderLock();

            return tryResult;
        }
    }
}
