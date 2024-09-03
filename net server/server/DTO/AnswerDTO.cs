namespace Server.DTO {
    public class AnswerDTO(string roomId, string playerId, int symbol) {
        public readonly string roomId = roomId;
        public readonly string playerId = playerId;
        public readonly int symbol = symbol;
    }
}
