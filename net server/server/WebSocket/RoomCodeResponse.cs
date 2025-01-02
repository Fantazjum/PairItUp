namespace Server.WebSocket {
  public class RoomCodeResponse(String roomId)
  {
    public String roomId { get; } = roomId;
  }
}
