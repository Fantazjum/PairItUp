using Server.GameObjects;

namespace Server {
    public sealed class Server {
        private static Server? instance = null;
        private static readonly object padlock = new();

        private readonly List<Room> _rooms = [];
        private readonly Dictionary<string, string> _connections = [];

        Server() { }

        /// <summary>
        /// Get the instance of singleton Server class.
        /// </summary>
        public static Server Instance {
            get {
                lock (padlock) {
                    instance ??= new Server();
                    
                    return instance;
                }
            }
        }

        /// <summary>
        /// Joins player to a room with a given id. If room doesn't exist, create one.
        /// </summary>
        /// <param name="player"></param>
        /// <param name="roomId"></param>
        public void JoinRoom(Player player, string roomId, string connectionId) {
            var room = _rooms.Find(room => room.Id == roomId);

            if (room != null) {
                room.Join(player);
                _connections.Add(connectionId, roomId + '/' + player.id);
            } else {
                room = new Room(player, roomId, null);
                _connections.Add(connectionId, roomId + '/' + player.id);
                _rooms.Add(room);
            }
        }

        /// <summary>
        /// Creates game room with optional custom id.
        /// </summary>
        /// <param name="gameRules"></param>
        /// <param name="host"></param>
        /// <param name="roomId"></param>
        /// <returns>Room id or null if creating room failed</returns>
        public string? CreateRoom(GameRules gameRules, Player host, string connectionId, string? roomId = null) {
            if (roomId != null) {
                if (_rooms.Find(room => room.Id == roomId) != null) {
                    return null;
                }
            }
            var room = new Room(host, roomId, gameRules);
            _connections.Add(connectionId, roomId + '/' + host.id);

            _rooms.Add(room);

            return room.Id;
        }

        /// <summary>
        /// Updates player data.
        /// </summary>
        /// <param name="player"></param>
        /// <param name="roomId"></param>
        /// <returns>False if no player or room was found, true otherwise.</returns>
        public bool UpdatePlayerData(Player player, string roomId) {
            var room = _rooms.Find(room => room.Id == roomId);
            if (room == null) {
                return false;
            }

            return room.UpdatePlayerData(player);
        }

        /// <summary>
        /// Removes person from active players of the room.
        /// </summary>
        /// <param name="connectionId"></param>
        /// <returns>Id of the room player disconnected from.</returns>
        public string? Disconnect(string connectionId) {
            var connectionData = _connections[connectionId];
            if (connectionData == null) {
                return null;
            }

            _connections.Remove(connectionId);

            var data = connectionData.Split('/', 2);
            var roomId = data[0];

            var room = _rooms.Find(room => room.Id != roomId)!;
            var player = new Player(data[1]);
            if(!room.Leave(player)) {
                _rooms.Remove(room);
            }

            return roomId;
        }
        /// <summary>
        /// Checks results of a given symbol on a card in play
        /// </summary>
        /// <param name="result"></param>
        /// <param name="roomId"></param>
        /// <param name="connectionId"></param>
        /// <returns>True if symbol exists on a card, false if there is none or either player or the room is somehow not found. Null is returned if another player was first to find the symbol.</returns>
        public bool? CheckResults(int result, string roomId, string connectionId) {
            // we ensure player is in play, checking the value of dictionary should be fast enough so as to not affect order
            if (!_connections.TryGetValue(connectionId, out var connectionData)) {
                return false;
            }

            var room = _rooms.Find(room => room.Id == roomId);
            if (room == null) {
                return false;
            }

            var success = room.CheckResults(result, connectionId);
            if (success == true) {
                var playerId = connectionData.Split('/', 2)[1];
                room.AwardPlayer(playerId);
            }

            return success;
        }

        /// <summary>
        /// Tries to continue the round
        /// </summary>
        /// <param name="roomId"></param>
        /// <returns>True if room updates, false if room was not found.</returns>
        public bool ContinueRound(string roomId) {
            var room = _rooms.Find(room => room.Id == roomId);

            if (room == null) {
                return false;
            }

            room.ContinueRound();

            return true;
        }

        /// <summary>
        /// Tries to start the game in the room
        /// </summary>
        /// <param name="connectionId"></param>
        /// <returns>Id of the room if successful, null if player couldn't start the game.</returns>
        public string? StartGame(string connectionId) {
            if (!_connections.TryGetValue(connectionId, out var connectionData)) {
                return null;
            }

            var playerData = connectionData.Split('/', 2);
            var roomId = playerData[0];
            var room = _rooms.Find(room => room.Id == roomId);

            if (room == null) {
                return null;
            }

            if(room.StartGame(playerData[1])) {
                return roomId;
            }

            return null;
        }

        /// <summary>
        /// Tries to get room for getting room info
        /// </summary>
        /// <param name="roomId"></param>
        /// <returns>Returns Room object with specified id or null if not found.</returns>
        public Room? GetRoom(string roomId) {
            return _rooms.Find(room => room.Id == roomId);
        }
    }
}
