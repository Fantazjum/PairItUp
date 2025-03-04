
using Newtonsoft.Json;
using Server.DTO;
using Server.GameObjects;
using Server.WebSocketDTO;
using Server.WebSocketHubNS;

namespace Server.WebSocketNS
{
    public class WebSocketHub(IWebSocketConnections connection, Server server) : WebSocketHubBase(connection)
    {
        private readonly Server _Server = server;

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

            var id = _Server.CreateRoom(gameRules, Player.FromDTO(host), ConnectionId, roomId);
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

            try
            {
                var player = JsonConvert.DeserializeObject<PlayerDTO>(playerData);
                _Server.JoinRoom(Player.FromDTO(player!), roomId, ConnectionId);
            }
            catch
            {
                client!
                    .SendAsync("WebSocketResponse", [new InvalidDataError()]);

                return;
            }

            _connections.AddToGroup(ConnectionId, roomId);

            SendUpdateCommand(roomId);
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
                  && _Server.UpdatePlayerData(Player.FromDTO(player), roomId);

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

            var valid = _Server.CheckResults(result, roomId, playerId);

            if (valid == false)
            {
                client!
                    .SendAsync("WebSocketResponse", [new AnswerResponse("invalid")]);

                return;
            }

            var validResponse = valid == true ? "valid" : "late";

            if (valid == true)
            {
                ContinueRound(roomId);
            }

            client!
                .SendAsync("WebSocketResponse", [new AnswerResponse(validResponse)]);
        }

        public void ContinueRound(string roomId)
        {
            var exists = _connections.TryGetClient(ConnectionId, out var client);
            if (!exists)
            {
                return;
            }

            var updated = _Server.ContinueRound(roomId);

            if (!updated)
            {
                client!
                    .SendAsync("WebSocketResponse", [new NotFoundError()]);
                return;
            }

            _connections.Group(roomId).SendAsync("Score");
    }

        public void LeaveRoom()
        {
            var roomId = _Server.Disconnect(ConnectionId);

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
            _Server.UpdateGameRules(gameRules, roomId);

            SendUpdateCommand(roomId);
        }

        public void StartGame()
        {
            var exists = _connections.TryGetClient(ConnectionId, out var client);
            if (!exists)
            {
                return;
            }

            var roomId = _Server.StartGame(ConnectionId);
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

            SendUpdateCommand(roomId);
        }

        public void EndGame()
        {
            var exists = _connections.TryGetClient(ConnectionId, out var client);
            if (!exists)
            {
                return;
            }

            var roomId = _Server.EndGame(ConnectionId);
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
