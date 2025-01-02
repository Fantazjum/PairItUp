namespace Server.DTO {
    public class AnswerDTO(string roomId, string playerId, int symbol) {
        public string roomId { get; } = roomId;
        public string playerId { get; } = playerId;
        public int symbol { get; } = symbol;
    }
}
