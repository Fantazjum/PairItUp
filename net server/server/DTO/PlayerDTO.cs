using Server.GameObjects;

namespace Server.DTO {
    public class PlayerDTO(string id, string username = "", int score = 0, Card? currentCard = null) {
        public string id = id;
        public string username = username;
        public int score = score;
        public Card? currentCard = currentCard;
    }
}
