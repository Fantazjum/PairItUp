using System.Security.Cryptography;
using Server.DTO;
using Server.GameObjects;

namespace Server
{
    public class Room(Player host, string? id, GameRules? gameRules)
    {
        /// <summary>
        /// Id of the room.
        /// </summary>
        public string Id = id ?? GenKey();

        /// <summary>
        /// Rules of the game in the room.
        /// </summary>
        public GameRules GameRules = gameRules ?? new GameRules();

        /// <summary>
        /// Whether the game is in progress or not.
        /// </summary>
        private bool _inProgress = false;

        /// <summary>
        /// Keeps track of progress of current game.
        /// </summary>
        private GameProgress? _progress = null;

        /// <summary>
        /// Current host of the game.
        /// </summary>
        private Player _host = host;

        /// <summary>
        /// List of players curently in, or awaiting a game.
        /// </summary>
        private readonly List<Player> _players = [host];

        /// <summary>
        /// List of current spectators.
        /// </summary>
        private readonly List<Player> _spectators = [];

        /// <summary>
        /// Generates a key for a new room. Keys are not guaranteed to be unique.
        /// </summary>
        /// <param name="length"></param>
        /// <returns>A random key for a newly created room.</returns>
        private static string GenKey(int length = 6)
        {
            string id = "";
            const string letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            for (int i = 0; i < length; i++)
            {
                int idx = RandomNumberGenerator.GetInt32(letters.Length);
                id += letters[idx];
            }

            return id;
        }

        /// <summary>
        /// Removes player from an active game and selects new host if necessary.
        /// </summary>
        /// <param name="player"></param>
        /// <returns>Returns true if room has some players left. Returns false if room is empty.</returns>
        private bool RemovePlayer(Player player) {
            if (_inProgress) {
                player.Connected = false;
            } else if (!_players.Remove(player)) {
                var playerData = _players.Find(player.Equals);
                if (playerData != null) {
                    _players.Remove(playerData);
                }
            }

            if (player.Equals(_host) && (_players.Count + _spectators.Count > 0)) {
                if (_players.Count > 0) {
                    var newHost = _players.Find(player => player.Connected);
                    if (newHost != null || _spectators.Count > 0) {
                        _host = newHost ?? _spectators.First();
                    }
                    if (newHost == null) {
                        GameSummary();
                    }
                } else {
                    _host = _spectators.First();
                }
            }

            if (_spectators.Count > 0 && !_inProgress) {
                MoveSpectators();
            }

            return _players.Count + _spectators.Count > 0;
        }

        /// <summary>
        /// Initializes the game if there are at least two players and it was called by host
        /// </summary>
        /// <param name="playerId"></param>
        /// <returns>True if game started, false if it did not.</returns>
        public bool StartGame(string playerId) {
            if (_players.Count < 2 || _host.id != playerId) {
                return false;
            }

            _inProgress = true;
            _progress = new (GameRules);
            foreach (var player in _players) {
                player.InitGame(_progress.GetNextCard()!);
            }
            _progress.ContinueRound();

            return true;
        }

        /// <summary>
        /// Updates data of a player.
        /// </summary>
        /// <param name="person"></param>
        /// <returns>True if player found, false if not.</returns>
        public bool UpdatePlayerData(Player person) {
            var player= _players.Find(player => player.Equals(person));
            player?.SetPlayerData(person);

            return player != null;
        }

        /// <summary>
        /// Ends game, allowing for reading the game summary.
        /// </summary>
        public void GameSummary() {
            _progress = null;
            _inProgress = false;
        }

        /// <summary>
        /// Ends the game, resetting all players.
        /// </summary>
        public void EndGame() {
            _progress = null;
            _players.RemoveAll(player => !player.Connected);
            foreach (var player in _players) {
                player.Reset();
            }

            MoveSpectators();
        }

        /// <summary>
        /// Moves waiting spectators to the list of players.
        /// </summary>
        public void MoveSpectators() {
            if (_players.Count >= GameRules.maxPlayers) {
                return;
            }

            var selectCount = GameRules.maxPlayers - _players.Count;

            if (selectCount > _spectators.Count) {
                _players.AddRange(_spectators);
                _spectators.Clear();
            } else {
                var subsection = _spectators.GetRange(0, selectCount);
                _spectators.RemoveRange(0, selectCount);
                _players.AddRange(subsection);
            }
            
        }

        /// <summary>
        /// Adds the player to list of players or spectators.
        /// </summary>
        /// <param name="player"></param>
        public void Join(Player player) {
            if (_inProgress) {
                var existing = _players.Find(player.Equals);
                if (existing != null) {
                    existing.Connected = true;
                } else {
                    _spectators.Add(player);
                }

                return;
            }

            if (GameRules.maxPlayers >= _players.Count) {
                _spectators.Add(player);
            } else {
                _players.Add(player);
            }
        }

        /// <summary>
        /// Removes player or spectator from room.
        /// </summary>
        /// <param name="player"></param>
        /// <returns>Returns true if room has some players left. Returns false if room is empty.</returns>
        public bool Leave(Player player) {
            var spectator = _spectators.Find(player.Equals);
            if (spectator == null) {
                return RemovePlayer(player);
            }

            _spectators.Remove(spectator);

            return _players.Count + _spectators.Count > 0;
        }

        /// <summary>
        /// Checks results of a given symbol on a card in play
        /// </summary>
        /// <param name="result"></param>
        /// <param name="connectionId"></param>
        /// <returns>True if symbol exists on a card, false if there is none. Null is returned if another player was first to find the symbol.</returns>
        public bool? CheckResults(int result, string connectionId) {
            if (_progress?.IsCurrentDone != false) {
                return null;
            }

            return _progress.CheckSymbol(result, connectionId);
        }

        /// <summary>
        /// Tries to continue round.
        /// </summary>
        public void ContinueRound() {
            var continued = _progress!.ContinueRound();
            if (!continued) {
                GameSummary();
            };
        }

        /// <summary>
        /// Awards player of given id a point
        /// </summary>
        /// <param name="playerId"></param>
        public void AwardPlayer(string playerId) {
            var player = _players.Find(player => player.id == playerId);
            player!.AwardPoint(_progress!.currentCard!);
        }

        /// <summary>
        /// Transforms object into Data Transfer Object
        /// </summary>
        /// <returns>DTO version of class.</returns>
        public RoomDTO ToDTO() {
            var playersDTO = _players.Select(player => player.ToDTO()).ToList();
            var spectatorsDTO = _spectators.Select(spectator => spectator.ToDTO()).ToList();
            return new RoomDTO(Id, playersDTO, spectatorsDTO, _progress?.currentCard, _inProgress, GameRules, _host.id);
        }
    }
}
