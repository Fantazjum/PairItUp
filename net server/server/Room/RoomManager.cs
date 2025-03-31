using Server.Extensions;
using Server.GameObjects;
using Server.Utils;
using System.Collections.Concurrent;

namespace Server.Room
{
    public sealed class RoomManager
    {
        /// <summary>
        /// Queue for creating or deleting rooms
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
        /// <returns>True if player joined the room
        /// or false if he was already in the room.</returns>
        public bool JoinRoom(Player player, string roomId, string connectionId)
        {
            var id = roomId.Limit(15);
            return (bool)_roomQueue.SyncModifyData(connectionId, () => {
                var joined = false;
                _roomReadWrite.AcquireReaderLock(-1);
                if (_rooms.Exists(room => room.Id == id))
                {
                    var room = _rooms.Find(room => room.Id == id)!;
                    joined = room.Join(player);
                    _connections.TryAdd(connectionId, id + '/' + player.id);
                }
                else
                {
                    _roomReadWrite.ReleaseReaderLock();
                    _roomReadWrite.AcquireWriterLock(-1);
                    var room = new Room(player, id, null);
                    _connections.TryAdd(connectionId, id + '/' + player.id);
                    _rooms.Add(room);
                    _roomReadWrite.ReleaseWriterLock();

                    return true;
                }

                _roomReadWrite.ReleaseReaderLock();
                return joined;
            })!;
        }

        /// <summary>
        /// Creates game room with optional custom id.
        /// </summary>
        /// <param name="gameRules"></param>
        /// <param name="host"></param>
        /// <param name="roomId"></param>
        /// <returns>Room id or null if creating room failed</returns>
        public string? CreateRoom(
            GameRules gameRules,
            Player host,
            string connectionId,
            string? roomId = null)
        {
            return (string?)_roomQueue.SyncModifyData(connectionId, () => {
                _roomReadWrite.AcquireReaderLock(-1);
                if (roomId != null)
                {
                    var id = roomId.Limit(15);
                    if (_rooms.Exists(room => room.Id == id))
                    {
                        _roomReadWrite.ReleaseReaderLock();
                        return null;
                    }
                }

                _roomReadWrite.ReleaseReaderLock();
                _roomReadWrite.AcquireWriterLock(-1);
                var room = new Room(host, roomId, gameRules);
                if (_connections.TryGetValue(connectionId, out string? oldConnection))
                {
                    var oldRoomId = oldConnection.Split("/")[0];
                    _rooms.RemoveAll(oldRoom => oldRoom.Id == oldRoomId);
                    _connections[connectionId] = room.Id + '/' + host.id;
                }
                else
                {
                    _connections.TryAdd(connectionId, room.Id + '/' + host.id);
                }

                _rooms.Add(room);
                _roomReadWrite.ReleaseWriterLock();
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
            var result = room.UpdatePlayerData(player);
            _roomReadWrite.ReleaseReaderLock();

            return result;
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
            var result = room.UpdateRules(rules);
            _roomReadWrite.ReleaseReaderLock();

            return result;
        }

        /// <summary>
        /// Removes person from active players of the room.
        /// </summary>
        /// <param name="connectionId"></param>
        /// <returns>Id of the room player disconnected from
        /// or null if the room was deleted or no longer exists.</returns>
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
                _roomReadWrite.ReleaseReaderLock();
                return roomId;
            }

            var player = new Player(data[1]);
            if(!room.Leave(player))
            {
                _roomReadWrite.ReleaseReaderLock();

                _roomQueue.SyncModifyData(roomId, () => { 
                    _roomReadWrite.AcquireWriterLock(-1);
                    if (!room.IsValidRoom())
                    {
                        _rooms.Remove(room);
                    }
                    _roomReadWrite.ReleaseWriterLock();
                });

                return null;
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
            var success = room.CheckResults(result, playerId);
            _roomReadWrite.ReleaseReaderLock();

            return success;
        }

        /// <summary>
        /// Tries to continue the round
        /// </summary>
        /// <param name="roomId"></param>
        /// <returns>True if round continues, false if it ends
        /// or null if room was not found.</returns>
        public bool? ContinueRound(string roomId)
        {
            _roomReadWrite.AcquireReaderLock(-1);
            if (!_rooms.Exists(room => room.Id == roomId))
            {
                _roomReadWrite.ReleaseReaderLock();
                return null;
            }

            var room = _rooms.Find(room => room.Id == roomId)!;
            var result = room.ContinueRound();
            _roomReadWrite.ReleaseReaderLock();

            return result;
        }

        /// <summary>
        /// Tries to start the game in the room
        /// </summary>
        /// <param name="connectionId"></param>
        /// <returns>Id of the room if successful, null if room was not found
        /// or empty string if player couldn't start the game.</returns>
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
                _roomReadWrite.ReleaseReaderLock();
                return null;
            }

            var room = _rooms.Find(room => room.Id == roomId)!;
            var result = room.StartGame(playerData[1]);
            _roomReadWrite.ReleaseReaderLock();

            if(result)
            {
                return roomId;
            }

            return "";
        }

        /// <summary>
        /// Tries to end the game in the room
        /// </summary>
        /// <param name="connectionId"></param>
        /// <returns>Id of the room if successful, null if room was not found
        /// or empty string if player couldn't end the game.</returns>
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
                _roomReadWrite.ReleaseReaderLock();
                return null;
            }

            var room = _rooms.Find(room => room.Id == roomId)!;
            var result = room.EndGame(playerData[1]);
            _roomReadWrite.ReleaseReaderLock();

            if (result)
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
            var room = _rooms.Find(room => room.Id == roomId);
            _roomReadWrite.ReleaseReaderLock();

            return room;
        }
    }
}
