## Configuración del Proyecto

### Instalación

1. **Clonar el repositorio y configurar el entorno:**

```bash
git clone <url-del-repositorio>
cd repositorio/BACKEND/
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En macOS/Linux:
source venv/bin/activate
```

2. **Instalar dependencias:**

```bash
pip install -r requirements.txt
```

3. **Configurar la base de datos:**

```bash
python manage.py makemigrations
python manage.py migrate
```

4. **Crear superusuario (opcional):**

```bash
python manage.py createsuperuser
```

5. **Ejecutar el servidor:**

```bash
python manage.py runserver 8007
```

El servidor estará disponible en: `http://localhost:8007`

## Estructura del Proyecto

```
BACKEND/
├── ilovepdf_backend/          # Configuración principal de Django
├── file_manager/              # Gestión de archivos temporales
├── pdf_operations/            # Operaciones con PDFs
├── media/                     # Archivos subidos
├── requirements.txt
└── manage.py
```

## APIs Disponibles

### Gestión de Archivos (`/api/files/`)

#### 1. Subir Archivo

- **URL:** `POST /api/files/upload/`
- **Descripción:** Sube un archivo al servidor
- **Formatos soportados:** PDF, Word (.doc, .docx), Excel (.xls, .xlsx), PowerPoint (.ppt, .pptx), Imágenes (JPG, PNG, GIF, BMP, TIFF)
- **Límite de tamaño:** 50MB

**Ejemplo con cURL:**

```bash
curl -X POST \
  -F "file=@documento.pdf" \
  http://localhost:8007/api/files/upload/
```

**Respuesta exitosa:**

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "file": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "original_filename": "documento.pdf",
    "file_size": 1024000,
    "mime_type": "application/pdf",
    "uploaded_at": "2025-01-15T10:30:00Z",
    "expires_at": "2025-01-15T11:30:00Z",
    "is_expired": false,
    "file_exists": true,
    "file_url": "http://localhost:8007/api/files/download/550e8400-e29b-41d4-a716-446655440000/"
  }
}
```

#### 2. Descargar Archivo

- **URL:** `GET /api/files/download/<uuid>/`
- **Descripción:** Descarga un archivo por su ID
- **Importante:** El parametro -o tiene que ser del tipo del archivo a descargar. (.pdf, .xlsx, etc.) Si no
  lo haces correctametne te va a dar error al abrirlo. Puedes obtener el UUID llamando primero a el endpoint
  /files/list/ tomar de ahi el tipo de archivo y UUID del archivo a descargar. Esto solo es en caso de hacer
  pruebas manuales con curl.

```bash
curl -o archivo_descargado.pdf http://localhost:8007/api/files/download/550e8400-e29b-41d4-a716-446655440000/
```

#### 3. Información del Archivo

- **URL:** `GET /api/files/info/<uuid>/`
- **Descripción:** Obtiene información detallada de un archivo

```bash
curl http://localhost:8007/api/files/info/550e8400-e29b-41d4-a716-446655440000/
```

#### 4. Eliminar Archivo

- **URL:** `DELETE /api/files/delete/<uuid>/`
- **Descripción:** Elimina un archivo específico

```bash
curl -X DELETE http://localhost:8007/api/files/delete/550e8400-e29b-41d4-a716-446655440000/
```

#### 5. Listar Archivos

- **URL:** `GET /api/files/list/`
- **Descripción:** Lista todos los archivos activos

```bash
curl http://localhost:8007/api/files/stats/
```

#### 6. Estadísticas de Almacenamiento

- **URL:** `GET /api/files/stats/`
- **Descripción:** Muestra estadísticas del almacenamiento

```bash
curl http://localhost:8007/api/files/stats/
```

#### 7. Limpiar Archivos Expirados

- **URL:** `POST /api/files/cleanup/`
- **Descripción:** Elimina archivos que han expirado

```bash
curl -X POST http://localhost:8007/api/files/cleanup/
```

### Operaciones PDF (`/api/pdf/`)

#### Estado Actual

- **URL:** `GET /api/pdf/`
- **Descripción:** Información sobre las operaciones PDF disponibles (próximamente)

```bash
curl http://localhost:8007/api/pdf/
```

### Pruebas Manuales

1. **Probar subida de diferentes tipos de archivo:**

```bash
# PDF
curl -X POST -F "file=@documento.pdf" http://localhost:8007/api/files/upload/

# Word
curl -X POST -F "file=@documento.docx" http://localhost:8007/api/files/upload/

# PowerPoint
curl -X POST -F "file=@presentacion.pptx" http://localhost:8007/api/files/upload/

# Excel
curl -X POST -F "file=@hoja_calculo.xlsx" http://localhost:8007/api/files/upload/

# Imagen
curl -X POST -F "file=@imagen.jpg" http://localhost:8007/api/files/upload/
```

2. **Verificar estadísticas:**

```bash
curl http://localhost:8007/api/files/stats/
```

3. **Descargar archivo (usar el UUID de la respuesta de subida):**

```bash
curl -o archivo_descargado.pdf http://localhost:8007/api/files/download/[UUID-AQUI]/
```

## Comandos de Gestión

### Limpiar archivos expirados manualmente

```bash
python manage.py cleanup_files
```

### Limpiar todos los archivos

```bash
python manage.py cleanup_files --force
```

### Ver qué se eliminaría sin hacerlo (modo dry-run)

```bash
python manage.py cleanup_files --dry-run
```

## Configuración de Seguridad

- **Límite de tamaño:** 200MB por archivo. Esto se puede cambiar en settings.py
- **Tipos de archivo permitidos:** PDF, Word, Excel, PowerPoint, Imágenes
- **Expiración automática:** Los archivos se eliminan después de 1 hora
- **Almacenamiento temporal:** No se requiere autenticación de usuario

## Base de Datos

El proyecto usa SQLite por defecto. Los archivos se almacenan en:

- **Metadatos:** Base de datos SQLite (`db.sqlite3`)
- **Archivos físicos:** Directorio `media/uploads/`

## Panel de Administración

Accede al panel de administración de Django:

1. Ve a `http://localhost:8007/admin/`
2. Inicia sesión con tu superusuario
3. Gestiona archivos temporales en `file_manager > Temporary files`

## Próximamente

- [ ] Unir PDFs
- [ ] Dividir PDFs
- [ ] Comprimir PDFs
- [ ] Convertir PDF a imagen
- [ ] Convertir imagen a PDF
- [ ] Convertir documentos Office a PDF
- [ ] Rotar PDFs
- [ ] Proteger PDFs con contraseña
- [ ] Extraer texto de PDFs (OCR)

## Notas de Desarrollo

- Los archivos se organizan por fecha: `media/uploads/YYYY/MM/DD/`
- Cada archivo tiene un UUID único como identificador

## Resolución de Problemas

### Error: "File type not supported"

- Verifica que el archivo sea de un tipo permitido
- Algunos archivos Office pueden detectarse como `application/octet-stream`

### Error: "File has expired"

- Los archivos se eliminan automáticamente después de 1 hora
- Sube el archivo nuevamente

### Error: "File not found on storage"

- El archivo físico fue eliminado pero el registro permanece
- Ejecuta `python manage.py cleanup_files` para limpiar registros huérfanos
