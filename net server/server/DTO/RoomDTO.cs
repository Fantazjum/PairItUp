using Server.GameObjects;

namespace Server.DTO {
    public class RoomDTO(string id, List<PlayerDTO> players, List<PlayerDTO> spectators, Card? currentCard, bool inProgress, GameRules gameRules, string hostId) {
        public string id { get; } = id;
        public List<PlayerDTO> players { get; } = players;
        public List<PlayerDTO> spectators { get; } = spectators;
        public Card? currentCard { get; } = currentCard;
        public bool inProgress { get; } = inProgress;
        public GameRules gameRules { get; } = gameRules;
        public string hostId { get; } = hostId;
  }
}
