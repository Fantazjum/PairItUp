using Server.WebSocketHubNS;
using Server.WebSocketNS;
using Server.Room;

namespace Server.Extensions {
  public static class IServiceCollectionExtension
    {
        /// <summary>
        /// Configures dependencies for server
        /// </summary>
        /// <param name="services"></param>
        /// <returns>A reference to this instance after the operation has completed</returns>
        public static IServiceCollection AddServerDependencies(this IServiceCollection services)
        {
            services.AddSingleton(typeof(RoomManager));

            return services;
        }

        /// <summary>
        /// Configures dependencies for websockets
        /// </summary>
        /// <param name="services"></param>
        /// <returns>A reference to this instance after the operation has completed</returns>
        public static IServiceCollection AddWebSocketDependencies(this IServiceCollection services)
        {
            services.AddSingleton<IWebSocketConnections, WebSocketConnections>();
            services.AddScoped<IWebSocketHub, WebSocketHub>();

            return services;
        }

        /// <summary>
        /// Configures dependencies for single page application
        /// </summary>
        /// <param name="services"></param>
        /// <returns>A reference to this instance after the operation has completed</returns>
        public static IServiceCollection AddSpaDependencies(this IServiceCollection services)
        {
            services.AddSpaStaticFiles(configuration => {
              configuration.RootPath = "wwwroot/browser";
            });

            return services;
        }
    }
}
