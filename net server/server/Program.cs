using FastEndpoints;
using Server.WebSocket;


var builder = WebApplication.CreateBuilder();
builder.Services.AddCors(options => {
  string[] corsUrls = ["0.0.0.0:7171", "0.0.0.0:4200"];

  options.AddPolicy("AllowSpecificOrigins",
      builder => {
        builder.WithOrigins(corsUrls)
              .AllowAnyHeader()
              .WithMethods("GET", "POST")
              .SetIsOriginAllowed((host) => true)
              .AllowCredentials();
      });
});
builder.Services
  .AddSignalR(options => { options.EnableDetailedErrors = true; })
  .AddJsonProtocol(options => { options.PayloadSerializerOptions.PropertyNamingPolicy = null; });
builder.Services.AddFastEndpoints();

var webSocketOptions = new WebSocketOptions {
    KeepAliveInterval = TimeSpan.FromSeconds(10)
};

var app = builder.Build();
app.UseFastEndpoints()
  .UseHttpsRedirection()
  .UseCors("AllowSpecificOrigins")
  .UseWebSockets(webSocketOptions);
app.MapHub<WebSocketHub>("/api/game-connection");

app.Run();
