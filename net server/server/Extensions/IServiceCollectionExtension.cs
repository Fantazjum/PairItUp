using Server.WebSocketHubNS;
using Server.WebSocketNS;

namespace Server.Extensions
{
  public static class IServiceCollectionExtension
  {
    public static IServiceCollection AddServerDependencies(this IServiceCollection services)
    {
      services.AddSingleton(typeof(Server));

      return services;
    }

    public static IServiceCollection AddWebSocketDependencies(this IServiceCollection services)
    {
      services.AddSingleton<IWebSocketConnections, WebSocketConnections>();
      services.AddScoped<IWebSocketHub, WebSocketHub>();

      return services;
    }
  }
}
