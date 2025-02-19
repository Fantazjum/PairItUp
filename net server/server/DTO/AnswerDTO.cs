namespace Server.DTO
{
    #pragma warning disable IDE1006 // Naming convention style
    public class AnswerDTO(string roomId, string playerId, int symbol)
    {
        public string roomId { get; } = roomId;
        public string playerId { get; } = playerId;
        public int symbol { get; } = symbol;
    }
    #pragma warning restore IDE1006 // Naming convention style
}
