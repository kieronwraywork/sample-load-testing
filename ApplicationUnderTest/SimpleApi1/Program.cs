using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var serviceName = builder.Environment.ApplicationName;

builder.Services.AddOpenTelemetry()
      .ConfigureResource(resource => resource.AddService(serviceName))

      .WithTracing(tracing => tracing
          .AddAspNetCoreInstrumentation()

          //.AddConsoleExporter()
          )
      .WithMetrics(metrics => metrics
          .AddAspNetCoreInstrumentation()
          .AddPrometheusExporter()
          .AddHttpClientInstrumentation()
            .AddEventCountersInstrumentation(c =>
            {
                c.AddEventSources(
                        "Microsoft.AspNetCore.Hosting",
                        "Microsoft-AspNetCore-Server-Kestrel",
                        "System.Net.Http",
                        "System.Net.Sockets");
            })
            .AddMeter("Microsoft.AspNetCore.Hosting", "Microsoft.AspNetCore.Server.Kestrel")
          //.AddConsoleExporter()
          );

// builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options =>
// {
// options.SerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
// });
// builder.Services.Configure<Microsoft.AspNetCore.Mvc.JsonOptions>(options =>
// {
//     options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
// });

builder.Services.ConfigureHttpJsonOptions(options => {
    options.SerializerOptions.WriteIndented = true;
    options.SerializerOptions.IncludeFields = true;
});
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}


// Configure the Prometheus scraping endpoint
app.MapPrometheusScrapingEndpoint();
app.MapGet("/", () => "Simple API 1 - Payment Processor is running");

app.MapPost("initiate", ( InitPayload payload) =>
{
    return Results.StatusCode(payload.ResponseCode);
});
app.MapPost("refund", ( RefundPayload payload) =>
{
    return Results.StatusCode(payload.ResponseCode);
});
app.MapPost("capture", ( CapturePayload payload) =>
{
    return Results.StatusCode(payload.ResponseCode);
});
app.MapPost("error", (BasicPayload payload) =>
{
    return Results.StatusCode(payload.ResponseCode);
});

app.MapPost("showsels", (ShoePayload payload) =>
{
    return Results.StatusCode(payload.ResponseCode);
});


app.Run();

public class ShoePayload
{
    public string CustomerId;
}
public class BasicPayload
{
    public string? CardType;
    public float? Amount;
    public int ResponseCode;
};
public class  RefundPayload : BasicPayload
{

    public string? TransactionId;
}
public class InitPayload : BasicPayload { }
public class CapturePayload : RefundPayload { }

