namespace Server.WebSocketDTO {
  internal class WebSocketMessage(string message, object?[]? args) {
#pragma warning disable IDE1006 // Naming convention style
    public string message { get; } = message;
    public object?[]? args { get; private set; } = args;
#pragma warning restore IDE1006 // Naming convention style
  }
}
