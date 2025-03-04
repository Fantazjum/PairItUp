using FastEndpoints;
using Server.Extensions;

var options = new WebApplicationOptions() {
    Args = args,
    EnvironmentName = "Production"
};

var builder = WebApplication.CreateBuilder(options);
builder.Services.AddControllers();
builder.Services.AddServerDependencies()
  .AddWebSocketDependencies();

var webSocketOptions = new WebSocketOptions {
    KeepAliveInterval = TimeSpan.FromSeconds(10)
};

#if DEBUG
builder.Services.AddCors(options => {
    options.AddPolicy("TestPolicy", builder => {
        builder.AllowAnyOrigin().AllowAnyMethod().DisallowCredentials();
    });
});
#endif

builder.Services.AddFastEndpoints();

var app = builder.Build();
app.UseFastEndpoints()
  .UseDefaultFiles()
  .UseStaticFiles()
  .UseRouting()
  .UseWebSockets(webSocketOptions);

#if DEBUG
app.UseCors("TestPolicy");
#endif

app.MapControllers();

app.Run();
