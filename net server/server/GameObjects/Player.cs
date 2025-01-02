using Server.DTO;

namespace Server.GameObjects
{
    public class Player(string id)
    {
        /// <summary>
        /// Identifier of the player.
        /// </summary>
        public readonly string id = id;
        private int _score = 0;
        /// <summary>
        /// Current score of the player. Can't be set outside of resetting or awarding points.
        /// </summary>
        public int Score { get { return _score; } }
        /// <summary>
        /// The username the player goes by.
        /// </summary>
        public string username = "";
        public Card? CurrentCard { get; private set; }
        /// <summary>
        /// Information whether the player is connected to the game. Allows player to reconnect.
        /// Doesn't matter for spectators.
        /// </summary>
        public bool Connected { get; set; }

        /// <summary>
        /// Checks if players are supposed to refer to the same player by comparing their ids.
        /// </summary>
        /// <param name="other"></param>
        /// <returns></returns>
        public bool Equals(Player other) {
            return id == other.id;
        }

        /// <summary>
        /// Prepare player for game by giving them a card to start with.
        /// </summary>
        /// <param name="initCard"></param>
        public void InitGame(Card initCard) {
            CurrentCard = initCard;
        }

        /// <summary>
        /// Awards a point to the player whose card matches the symbol on main card in play.
        /// Requires passing the main card to replace the one currently held by the player.
        /// </summary>
        /// <param name="newCard"></param>
        public void AwardPoint(Card newCard) {
            CurrentCard = newCard;
            _score++;
        }

        /// <summary>
        /// Resets player score and card. Call after showing the summary of the game.
        /// </summary>
        public void Reset() {
            _score = 0;
            CurrentCard = null;
        }

        /// <summary>
        /// Sets updated data of the player.
        /// </summary>
        /// <param name="other"></param>
        public void SetPlayerData(Player other) {
            if (!Equals(other)) {
                return;
            }

            username = other.username;
        }

        /// <summary>
        /// Converts player object to PlayerDTO.
        /// </summary>
        /// <returns>Player Data Transfer Object</returns>
        public PlayerDTO ToDTO() {
            return new PlayerDTO(id, username, _score, CurrentCard);
        }

        /// <summary>
        /// Creates player given the DTO. Only used to update player data.
        /// </summary>
        /// <param name="playerDTO"></param>
        /// <returns>Player object with updated data.</returns>
        public static Player FromDTO(PlayerDTO playerDTO) {
            var player = new Player(playerDTO.id) {
                username = playerDTO.username
            };

            return player;
        }
    }
}
