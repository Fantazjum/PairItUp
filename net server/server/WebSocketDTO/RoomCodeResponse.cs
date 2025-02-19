namespace Server.WebSocketDTO
{
    #pragma warning disable IDE1006 // Naming convention style
    public class RoomCodeResponse(string roomId)
    {
        public string roomId { get; } = roomId;
    }
    #pragma warning restore IDE1006 // Naming convention style
}
