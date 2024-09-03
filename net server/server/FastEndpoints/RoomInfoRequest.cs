namespace Server.FastEndpoints {
    public class RoomInfoRequest(string roomId = "") {
        public string RoomId { get; set; } = roomId;
    }
}
