using Server.GameObjects;
using Server.Utils;
using System.Collections.Concurrent;

namespace Server
{
    public sealed class Server
    {
        /// <summary>
        /// Queue for creating rooms
        /// </summary>
        private readonly MutexQueue _roomQueue = new();
        /// <summary>
        /// List of active rooms on the server.
        /// </summary>
        private readonly List<Room> _rooms = [];
        /// <summary>
        /// Map of connections.
        /// </summary>
        private readonly ConcurrentDictionary<string, string> _connections = [];
        /// <summary>
        /// Lock for reading and writing to room list
        /// </summary>
        private readonly ReaderWriterLock _roomReadWrite = new();

        /// <summary>
        /// Joins player to a room with a given id. If room doesn't exist, create one.
        /// </summary>
        /// <param name="player"></param>
        /// <param name="roomId"></param>
        public void JoinRoom(Player player, string roomId, string connectionId)
        {
            _roomQueue.SyncModifyData(connectionId, () => {
                _roomReadWrite.AcquireReaderLock(-1);
                if (_rooms.Exists(room => room.Id == roomId)) {
                    var room = _rooms.Find(room => room.Id == roomId)!;
                    room.Join(player);
                    _connections.TryAdd(connectionId, roomId + '/' + player.id);
                } else {
                    var cookie = _roomReadWrite.UpgradeToWriterLock(-1);
                    var room = new Room(player, roomId, null);
                    _connections.TryAdd(connectionId, roomId + '/' + player.id);
                    _rooms.Add(room);
                    _roomReadWrite.DowngradeFromWriterLock(ref cookie);
                }
                _roomReadWrite.ReleaseReaderLock();
            });
        }

        /// <summary>
        /// Creates game room with optional custom id.
        /// </summary>
        /// <param name="gameRules"></param>
        /// <param name="host"></param>
        /// <param name="roomId"></param>
        /// <returns>Room id or null if creating room failed</returns>
        public string? CreateRoom(GameRules gameRules, Player host, string connectionId, string? roomId = null)
        {
            return (string?)_roomQueue.SyncModifyData(connectionId, () => {
                _roomReadWrite.AcquireReaderLock(-1);
                if (roomId != null) {
                    if (_rooms.Exists(room => room.Id == roomId)) {
                        _roomReadWrite.ReleaseReaderLock();
                        return null;
                    }
                }

                var cookie = _roomReadWrite.UpgradeToWriterLock(-1);
                var room = new Room(host, roomId, gameRules);
                if (_connections.TryGetValue(connectionId, out string? oldConnection)) {
                    var oldRoomId = oldConnection.Split("/")[0];
                    _rooms.RemoveAll(oldRoom => oldRoom.Id == oldRoomId);
                    _connections[connectionId] = room.Id + '/' + host.id;
                } else {
                    _connections.TryAdd(connectionId, room.Id + '/' + host.id);
                }

                _rooms.Add(room);
                _roomReadWrite.DowngradeFromWriterLock(ref cookie);
                _roomReadWrite.ReleaseReaderLock();
                return room.Id;
            });
        }

        /// <summary>
        /// Updates player data.
        /// </summary>
        /// <param name="player"></param>
        /// <param name="roomId"></param>
        /// <returns>False if no player or room was found, true otherwise.</returns>
        public bool UpdatePlayerData(Player player, string roomId)
        {
            _roomReadWrite.AcquireReaderLock(-1);
            if (!_rooms.Exists(room => room.Id == roomId))
            {
                _roomReadWrite.ReleaseReaderLock();
                return false;
            }

            var room = _rooms.Find(room => room.Id == roomId)!;
            _roomReadWrite.ReleaseReaderLock();

            return room.UpdatePlayerData(player);
        }

        /// <summary>
        /// Updates game rules.
        /// </summary>
        /// <param name="player"></param>
        /// <param name="roomId"></param>
        /// <returns>False if no player or room was found, true otherwise.</returns>
        public bool UpdateGameRules(GameRules rules, string roomId)
        {
            _roomReadWrite.AcquireReaderLock(-1);
            if (!_rooms.Exists(room => room.Id == roomId))
            {
                _roomReadWrite.ReleaseReaderLock();
                return false;
            }

            var room = _rooms.Find(room => room.Id == roomId)!;
            _roomReadWrite.ReleaseReaderLock();

            return room.UpdateRules(rules);
        }

        /// <summary>
        /// Removes person from active players of the room.
        /// </summary>
        /// <param name="connectionId"></param>
        /// <returns>Id of the room player disconnected from.</returns>
        public string? Disconnect(string connectionId)
        {
            if (!_connections.TryRemove(connectionId, out var connectionData))
            {
                return null;
            }

            var data = connectionData!.Split('/', 2);
            var roomId = data[0];

            _roomReadWrite.AcquireReaderLock(-1);

            var room = _rooms.Find(room => room.Id == roomId)!;
            if (room == null)
            {
                return roomId;
            }

            var player = new Player(data[1]);
            if(!room.Leave(player))
            {
                var cookie = _roomReadWrite.UpgradeToWriterLock(-1);
                _rooms.Remove(room);
                _roomReadWrite.DowngradeFromWriterLock(ref cookie);
            }

            _roomReadWrite.ReleaseReaderLock();

            return roomId;
        }
        /// <summary>
        /// Checks results of a given symbol on a card in play
        /// </summary>
        /// <param name="result"></param>
        /// <param name="roomId"></param>
        /// <param name="connectionId"></param>
        /// <returns>True if symbol exists on a card,
        /// false if there is none or either player or the room is somehow not found.
        /// Null is returned if another player was first to find the symbol.</returns>
        public bool? CheckResults(int result, string roomId, string playerId)
        {
            _roomReadWrite.AcquireReaderLock(-1);
            if (!_rooms.Exists(room => room.Id == roomId))
            {
                return false;
            }

            var room = _rooms.Find(room => room.Id == roomId)!;
            _roomReadWrite.ReleaseReaderLock();

            var success = room.CheckResults(result, playerId);
            if (success == true)
            {
                room.AwardPlayer(playerId);
            }

            return success;
        }

        /// <summary>
        /// Tries to continue the round
        /// </summary>
        /// <param name="roomId"></param>
        /// <returns>True if room updates, false if room was not found.</returns>
        public bool ContinueRound(string roomId)
        {
            _roomReadWrite.AcquireReaderLock(-1);
            if (!_rooms.Exists(room => room.Id == roomId))
            {
                return false;
            }

            var room = _rooms.Find(room => room.Id == roomId)!;
            _roomReadWrite.ReleaseReaderLock();
            room.ContinueRound();

            return true;
        }

        /// <summary>
        /// Tries to start the game in the room
        /// </summary>
        /// <param name="connectionId"></param>
        /// <returns>Id of the room if successful, null if player couldn't start the game.</returns>
        public string? StartGame(string connectionId)
        {
            if (!_connections.TryGetValue(connectionId, out var connectionData))
            {
                return null;
            }

            var playerData = connectionData.Split('/', 2);
            var roomId = playerData[0];
            _roomReadWrite.AcquireReaderLock(-1);
            if (!_rooms.Exists(room => room.Id == roomId))
            {
                return null;
            }

            var room = _rooms.Find(room => room.Id == roomId)!;
            _roomReadWrite.ReleaseReaderLock();

            if(room.StartGame(playerData[1]))
            {
                return roomId;
            }

            return "";
        }

        /// <summary>
        /// Tries to end the game in the room
        /// </summary>
        /// <param name="connectionId"></param>
        /// <returns>Id of the room if successful, null if player couldn't end the game.</returns>
        public string? EndGame(string connectionId)
        {
            if (!_connections.TryGetValue(connectionId, out var connectionData))
            {
                return null;
            }

            var playerData = connectionData.Split('/', 2);
            var roomId = playerData[0];
            _roomReadWrite.AcquireReaderLock(-1);
            if (!_rooms.Exists(room => room.Id == roomId))
            {
                return null;
            }

            var room = _rooms.Find(room => room.Id == roomId)!;
            _roomReadWrite.ReleaseReaderLock();

            if (room.EndGame(playerData[1]))
            {
                return roomId;
            }

            return "";
        }

        /// <summary>
        /// Tries to get room for getting room info
        /// </summary>
        /// <param name="roomId"></param>
        /// <returns>Returns Room object with specified id or null if not found.</returns>
        public Room? GetRoom(string roomId)
        {
            _roomReadWrite.AcquireReaderLock(-1);
            if (!_rooms.Exists(room => room.Id == roomId))
            {
                return null;
            }

            var room = _rooms.Find(room => room.Id == roomId);
            _roomReadWrite.ReleaseReaderLock();
            return room;
    }
    }
}
