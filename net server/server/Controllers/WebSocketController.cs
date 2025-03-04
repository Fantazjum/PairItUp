using Microsoft.AspNetCore.Mvc;
using Server.WebSocketHubNS;

namespace Server.Controllers;
public class WebSocketController(IWebSocketHub hub) : ControllerBase
{
    [Route("/api/game-connection")]
    public async Task Get()
    {
        if (HttpContext.WebSockets.IsWebSocketRequest)
        {
            using var webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
            await hub.Connect(webSocket);
        }
        else
        {
            HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
        }
    }
}
