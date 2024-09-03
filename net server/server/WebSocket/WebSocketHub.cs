
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using Server.DTO;
using Server.GameObjects;

namespace Server.WebSocket {
    public class WebSocketHub : Hub {

        public async Task Send(string message, string roomId) {

            await Clients.Group(roomId).SendAsync("ReceiveMessage", message);
        }

        public override Task OnDisconnectedAsync(Exception? exception) {
            LeaveRoom();

            return base.OnDisconnectedAsync(exception);
        }

        public Task? CreateRoom(string hostData, string gameRulesData, string? roomId) {
            try {
                var host = JsonConvert.DeserializeObject<PlayerDTO>(hostData);
                var gameRules = JsonConvert.DeserializeObject<GameRules>(gameRulesData);
                if (host == null || gameRules == null) {
                    throw new Exception("Invalid argument data");
                }

                var id = Server.Instance.CreateRoom(gameRules, Player.FromDTO(host), Context.ConnectionId, roomId);
                if (id == null) {
                    Clients.Client(Context.ConnectionId).SendAsync("{\"error\":\"RoomIdInUse\"}");
                    return null;
                }

                return Groups.AddToGroupAsync(Context.ConnectionId, id);
            } catch {
                return Clients.Client(Context.ConnectionId).SendAsync("{\"error\":\"InvalidData\"}");
            }
        }

        public Task JoinRoom(string playerData, string roomId) {
            try {
                var player = JsonConvert.DeserializeObject<PlayerDTO>(playerData);
                Server.Instance.JoinRoom(Player.FromDTO(player!), roomId, Context.ConnectionId);
            } catch {
                return Clients.Client(Context.ConnectionId).SendAsync("{\"error\":\"InvalidUserData\"}");
            }

            Groups.AddToGroupAsync(Context.ConnectionId, roomId);

            return Send("updated", roomId);
        }

        public Task UpdatePlayerData(string playerData, string roomId) {
            try { 
                var player = JsonConvert.DeserializeObject<PlayerDTO>(playerData);

                var success = player != null && Server.Instance.UpdatePlayerData(Player.FromDTO(player), roomId);
                if (success) {
                    return Send("updated", roomId);
                }

                return Clients.Client(Context.ConnectionId).SendAsync("{\"error\":\"NotFound\"}");
            } catch {
                return Clients.Client(Context.ConnectionId).SendAsync("{\"error\":\"InvalidData\"}");
            }
        }

        public Task? CheckResult(int result, string roomId) {
            var valid = Server.Instance.CheckResults(result, roomId, Context.ConnectionId);

            if (valid == false) {
                return Clients.Client(Context.ConnectionId).SendAsync("{\"answer\":\"invalid\"}");
            }

            return Clients.Client(Context.ConnectionId)
                .SendAsync("{\"answer\":\"" + (valid == true ? "valid" : "late") + "\"}");
        }

        public Task ContinueRound(string roomId) {
            var updated = Server.Instance.ContinueRound(roomId);

            if (!updated) {
                Clients.Client(Context.ConnectionId).SendAsync("{\"error\":\"NotFound\"}");
            }

            return Send("updated", roomId);
        }

        public Task? LeaveRoom() {
            var roomId = Server.Instance.Disconnect(Context.ConnectionId);

            if (roomId != null) {
                Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
                return Send("updated", roomId);
            }

            return null;
        }

        public Task StartGame() {
            var roomId = Server.Instance.StartGame(Context.ConnectionId);
            if (roomId != null) {
                return Send("updated", roomId);
            }

            return Clients.Client(Context.ConnectionId).SendAsync("{\"error\":\"GameNotStarted\"}");
        }
    }
}
