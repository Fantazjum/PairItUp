using Server.GameObjects;

namespace Server.DTO {
    public class RoomDTO(string id, List<PlayerDTO> players, List<PlayerDTO> spectators, Card? currentCard, bool inProgress, GameRules gameRules, string hostId) {
        public string id = id;
        public List<PlayerDTO> players = players;
        public List<PlayerDTO> spectators = spectators;
        public Card? currentCard = currentCard;
        public bool inProgress = inProgress;
        public GameRules gameRules = gameRules;
        public string hostId = hostId;
    }
}
