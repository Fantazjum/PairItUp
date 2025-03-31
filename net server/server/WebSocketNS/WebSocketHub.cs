
using Newtonsoft.Json;
using Server.DTO;
using Server.GameObjects;
using Server.WebSocketDTO;
using Server.WebSocketHubNS;
using Server.Room;

namespace Server.WebSocketNS {
  public class WebSocketHub(IWebSocketConnections connection, RoomManager roomManager) : WebSocketHubBase(connection)
    {
        private readonly RoomManager _RoomManager = roomManager;

        public void SendUpdateCommand(string roomId)
        {
            _connections.Group(roomId).SendAsync("Update");
        }

        public override void Disconnect()
        {
            LeaveRoom();
        }

        public void CreateRoom(string hostData, string gameRulesData, string? roomId)
        {
            var host = JsonConvert.DeserializeObject<PlayerDTO>(hostData);
            var gameRules = JsonConvert.DeserializeObject<GameRules>(gameRulesData);
            var exists = _connections.TryGetClient(ConnectionId, out var client);
            if (!exists)
            {
                return;
            }

            if (host == null || gameRules == null)
            {
                client!.SendAsync("WebSocketResponse", [new InvalidDataError()]);

                return;
            }

            var id = _RoomManager.CreateRoom(gameRules, Player.FromDTO(host), ConnectionId, roomId);
            if (id == null)
            {
                client!
                    .SendAsync("WebSocketResponse", [new RoomIdInUseError()]);

                return;
            }

            client!
                .SendAsync("WebSocketResponse", [new RoomCodeResponse(id)]);
            _connections.AddToGroup(ConnectionId, id);
        }

        public void JoinRoom(string playerData, string roomId)
        {
            var exists = _connections.TryGetClient(ConnectionId, out var client);
            if (!exists)
            {
                return;
            }

            var joined = false;

            try
            {
                var player = JsonConvert.DeserializeObject<PlayerDTO>(playerData);
                joined = _RoomManager.JoinRoom(Player.FromDTO(player!), roomId, ConnectionId);
            }
            catch
            {
                client!
                    .SendAsync("WebSocketResponse", [new InvalidDataError()]);

                return;
            }

            _connections.AddToGroup(ConnectionId, roomId);

            if (joined)
            {
                SendUpdateCommand(roomId);
            }
            else
            {
                client!.SendAsync("Update");
            }
        }

        public void UpdatePlayerData(string playerData, string roomId)
        {
            var exists = _connections.TryGetClient(ConnectionId, out var client);
            if (!exists)
            {
                return;
            }

            try
            { 
                var player = JsonConvert.DeserializeObject<PlayerDTO>(playerData);

                var success = player != null
                  && _RoomManager.UpdatePlayerData(Player.FromDTO(player), roomId);

                if (success)
                {
                    SendUpdateCommand(roomId);
                    return;
                }

                client!
                    .SendAsync("WebSocketResponse", [new NotFoundError()]);
            }
            catch
            {
                client!
                    .SendAsync("WebSocketResponse", [new InvalidDataError()]);
            }
        }

        public void CheckResult(int result, string roomId, string playerId)
        {
            var exists = _connections.TryGetClient(ConnectionId, out var client);
            if (!exists)
            {
                return;
            }

            var valid = _RoomManager.CheckResults(result, roomId, playerId);

            if (valid == false)
            {
                client!
                    .SendAsync("WebSocketResponse", [new AnswerResponse("invalid")]);

                return;
            }

            var validResponse = valid == true ? "valid" : "late";

            if (valid == true)
            {
                var group = _connections.Group(roomId);
                group.SendAsync("Suspend");
                group.PrepareContinue(() => {
                    ContinueRound(roomId);
                });
            }

            client!
                .SendAsync("WebSocketResponse", [new AnswerResponse(validResponse)]);
        }

        public void ContinueRound(string roomId)
        {
            _connections.Group(roomId).CancelContinue();
            var exists = _connections.TryGetClient(ConnectionId, out var client);
            if (!exists)
            {
                return;
            }

            var updated = _RoomManager.ContinueRound(roomId);

            if (updated == null)
            {
                client!
                    .SendAsync("WebSocketResponse", [new NotFoundError()]);
                return;
            }
            else if (updated == true)
            {
                _connections.Group(roomId).SendAsync("Score");
            }
            else
            {
                SendUpdateCommand(roomId);
            }
        }

        public void LeaveRoom()
        {
            var roomId = _RoomManager.Disconnect(ConnectionId);

            if (roomId != null)
            {
                _connections.RemoveFromGroup(ConnectionId, roomId);
                SendUpdateCommand(roomId);
            }

            base.Disconnect();
        }

        public void UpdateGameRules(string gameRulesData, string roomId)
        {
            var exists = _connections.TryGetClient(ConnectionId, out var client);
            if (!exists)
            {
                return;
            }

            var gameRules = JsonConvert.DeserializeObject<GameRules>(gameRulesData);
            if (gameRules == null)
            {
                client!
                  .SendAsync("WebSocketResponse", [new InvalidDataError()]);
                return;
            }
            _RoomManager.UpdateGameRules(gameRules, roomId);

            SendUpdateCommand(roomId);
        }

        public void StartGame()
        {
            var exists = _connections.TryGetClient(ConnectionId, out var client);
            if (!exists)
            {
                return;
            }

            var roomId = _RoomManager.StartGame(ConnectionId);
            if (roomId == null)
            {
                client!
                    .SendAsync("WebSocketResponse", [new NotFoundError()]);

                return;
            }

            if (string.IsNullOrEmpty(roomId))
            {
                client!
                    .SendAsync("WebSocketResponse", [new GameNotStartedError()]);

                return;
            }

            _connections.Group(roomId).SendAsync("Started");
        }

        public void EndGame()
        {
            var exists = _connections.TryGetClient(ConnectionId, out var client);
            if (!exists)
            {
                return;
            }

            var roomId = _RoomManager.EndGame(ConnectionId);
            if (roomId == null)
            {
                client!
                    .SendAsync("WebSocketResponse", [new NotFoundError()]);

                return;
            }

            if (string.IsNullOrEmpty(roomId))
            {
                client!
                    .SendAsync("WebSocketResponse", [new NotAHostError()]);

                return;
            }

            SendUpdateCommand(roomId);
        }
    }
}
