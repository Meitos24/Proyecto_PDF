using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

var builder = WebApplication.CreateBuilder(args);

// Agregar servicios al contenedor
builder.Services.AddControllers(options =>
{
    // Remover formatters que puedan interferir con File results
    options.OutputFormatters.RemoveType<HttpNoContentOutputFormatter>();
});

// Configurar el tamaño máximo para archivos (importante para PDFs grandes)
builder.Services.Configure<FormOptions>(options =>
{
    options.ValueLengthLimit = int.MaxValue;
    options.MultipartBodyLengthLimit = int.MaxValue; // Por defecto son 128 MB
    options.MultipartHeadersLengthLimit = int.MaxValue;
});

// Configurar Kestrel para archivos grandes (si usas Kestrel)
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.MaxRequestBodySize = int.MaxValue; // Sin límite
    // O puedes establecer un límite específico:
    // serverOptions.Limits.MaxRequestBodySize = 104857600; // 100 MB
});

// Agregar Swagger/OpenAPI para documentación (opcional pero recomendado)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title = "API PDFs",
        Version = "v1",
        Description = "API para manipulación de archivos PDF"
    });

    // Configuración para manejar archivos en Swagger
    c.OperationFilter<FileUploadOperationFilter>();
});

// Agregar CORS si necesitas acceso desde frontend (opcional)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

var app = builder.Build();

// Configurar el pipeline de solicitudes HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "API PDFs v1");
        c.RoutePrefix = string.Empty; // Para que Swagger sea la página principal
    });
}

// IMPORTANTE: CORS debe ir ANTES de UseHttpsRedirection
app.UseCors("AllowAll");

app.UseHttpsRedirection();

app.UseAuthorization();

// Mapear los controladores
app.MapControllers();

// Endpoint de salud (opcional)
app.MapGet("/health", () => "API PDFs está funcionando correctamente");

app.Run();

// Clase para configurar Swagger con archivos
public class FileUploadOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var fileUploadMime = "multipart/form-data";

        if (operation.RequestBody == null || !operation.RequestBody.Content.Any(x => x.Key.Equals(fileUploadMime, StringComparison.InvariantCultureIgnoreCase)))
            return;

        var fileParams = context.MethodInfo.GetParameters()
            .Where(p => p.ParameterType == typeof(IFormFile) ||
                       p.ParameterType == typeof(List<IFormFile>));

        operation.RequestBody.Content[fileUploadMime].Schema.Properties =
            fileParams.ToDictionary(k => k.Name, v => new OpenApiSchema()
            {
                Type = v.ParameterType == typeof(IFormFile) ? "string" : "array",
                Format = v.ParameterType == typeof(IFormFile) ? "binary" : null,
                Items = v.ParameterType == typeof(List<IFormFile>) ?
                    new OpenApiSchema() { Type = "string", Format = "binary" } : null
            });
    }
}