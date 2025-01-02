
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using Server.DTO;
using Server.GameObjects;

namespace Server.WebSocket {
    public class WebSocketHub : Hub {

        public async Task SendUpdateCommand(string roomId) {
            await Clients.Group(roomId).SendAsync("Update");
        }

        public override Task OnDisconnectedAsync(Exception? exception) {
            LeaveRoom();

            return base.OnDisconnectedAsync(exception);
        }

        public Task? CreateRoom(string hostData, string gameRulesData, string? roomId) {
            var host = JsonConvert.DeserializeObject<PlayerDTO>(hostData);
            var gameRules = JsonConvert.DeserializeObject<GameRules>(gameRulesData);
            if (host == null || gameRules == null) {
                Clients.Client(Context.ConnectionId)
                .SendAsync("WebSocketResponse", new InvalidDataError());

                return null;
            }

            var id = Server.Instance.CreateRoom(gameRules, Player.FromDTO(host), Context.ConnectionId, roomId);
            if (id == null) {
                Clients.Client(Context.ConnectionId)
                    .SendAsync("WebSocketResponse", new RoomIdInUseError());
                return null;
            }

            Clients.Client(Context.ConnectionId)
                .SendAsync("WebSocketResponse", new RoomCodeResponse(id));
            return Groups.AddToGroupAsync(Context.ConnectionId, id);
        }

        public Task JoinRoom(string playerData, string roomId) {
            try {
                var player = JsonConvert.DeserializeObject<PlayerDTO>(playerData);
                Server.Instance.JoinRoom(Player.FromDTO(player!), roomId, Context.ConnectionId);
            } catch {
                return Clients.Client(Context.ConnectionId)
                    .SendAsync("WebSocketResponse", new InvalidDataError());
            }

            Groups.AddToGroupAsync(Context.ConnectionId, roomId);

            return SendUpdateCommand(roomId);
        }

        public Task UpdatePlayerData(string playerData, string roomId) {
            try { 
                var player = JsonConvert.DeserializeObject<PlayerDTO>(playerData);

                var success = player != null && Server.Instance.UpdatePlayerData(Player.FromDTO(player), roomId);
                if (success) {
                    return SendUpdateCommand(roomId);
                }

                return Clients.Client(Context.ConnectionId)
                    .SendAsync("WebSocketResponse", new NotFoundError());
            } catch {
                return Clients.Client(Context.ConnectionId)
                    .SendAsync("WebSocketResponse", new InvalidDataError());
            }
        }

        public Task? CheckResult(int result, string roomId) {
            var valid = Server.Instance.CheckResults(result, roomId, Context.ConnectionId);

            if (valid == false) {
                return Clients.Client(Context.ConnectionId)
                    .SendAsync("WebSocketResponse", new AnswerResponse("invalid"));
            }

            var validResponse = valid == true ? "valid" : "late";

            if (valid == true) {
                ContinueRound(roomId);
            }

            return Clients.Client(Context.ConnectionId)
                .SendAsync("WebSocketResponse", new AnswerResponse(validResponse));
        }

        public Task ContinueRound(string roomId) {
            var updated = Server.Instance.ContinueRound(roomId);

            if (!updated) {
                Clients.Client(Context.ConnectionId)
                    .SendAsync("WebSocketResponse", new NotFoundError());
            }

            return Clients.Group(roomId).SendAsync("Score");
    }

        public Task? LeaveRoom() {
            var roomId = Server.Instance.Disconnect(Context.ConnectionId);

            if (roomId != null) {
                Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
                return SendUpdateCommand(roomId);
            }

            return null;
        }

        public Task UpdateGameRules(string gameRulesData, string roomId) {
            var gameRules = JsonConvert.DeserializeObject<GameRules>(gameRulesData);
            if (gameRules == null) {
                return Clients.Client(Context.ConnectionId)
                .SendAsync("WebSocketResponse", new InvalidDataError());
            }
            Server.Instance.UpdateGameRules(gameRules, roomId);

            return SendUpdateCommand(roomId);
        }

        public Task StartGame() {
            var roomId = Server.Instance.StartGame(Context.ConnectionId);
            if (roomId == null) {
                return Clients.Client(Context.ConnectionId)
                    .SendAsync("WebSocketResponse", new NotFoundError());
            }

            if (string.IsNullOrEmpty(roomId)) {
                return Clients.Client(Context.ConnectionId)
                    .SendAsync("WebSocketResponse", new GameNotStartedError());
            }

            return SendUpdateCommand(roomId);
        }

        public Task EndGame() {
            var roomId = Server.Instance.EndGame(Context.ConnectionId);
            if (roomId == null) {
                return Clients.Client(Context.ConnectionId)
                    .SendAsync("WebSocketResponse", new NotFoundError());
            }

            if (string.IsNullOrEmpty(roomId)) {
                return Clients.Client(Context.ConnectionId)
                    .SendAsync("WebSocketResponse", new NotAHostError());
            }

            return SendUpdateCommand(roomId);
        }
    }
}
