using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using iText.Kernel.Pdf;
using iText.Kernel.Utils;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.AspNetCore.Http.HttpResults;

namespace API_PDFs.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UnirPDFController : ControllerBase
    {
        [HttpPost("unir-mejorado")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UnirDosArchivosMejorado(
    IFormFile archivo1,
    IFormFile archivo2)
        {
            // Validar que se recibieron ambos archivos
            if (archivo1 == null || archivo2 == null)
            {
                return BadRequest(new { error = "Se requieren dos archivos PDF" });
            }

            // Validar que ambos archivos sean PDFs
            if (!EsPDF(archivo1) || !EsPDF(archivo2))
            {
                return BadRequest(new { error = "Ambos archivos deben ser PDFs válidos" });
            }

            try
            {
                // Crear una carpeta temporal para trabajar con los archivos
                var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
                Directory.CreateDirectory(tempDir);

                try
                {
                    // Guardar los archivos temporalmente
                    var tempFile1 = Path.Combine(tempDir, $"archivo1_{Guid.NewGuid()}.pdf");
                    var tempFile2 = Path.Combine(tempDir, $"archivo2_{Guid.NewGuid()}.pdf");
                    var outputFile = Path.Combine(tempDir, $"resultado_{Guid.NewGuid()}.pdf");

                    using (var stream = new FileStream(tempFile1, FileMode.Create))
                    {
                        await archivo1.CopyToAsync(stream);
                    }

                    using (var stream = new FileStream(tempFile2, FileMode.Create))
                    {
                        await archivo2.CopyToAsync(stream);
                    }

                    // Trabajar con archivos físicos puede evitar algunos problemas
                    using (var writer = new PdfWriter(outputFile))
                    {
                        // Configurar propiedades del escritor
                        writer.SetSmartMode(true); // Modo inteligente para optimizar el PDF

                        using (var pdfDocument = new PdfDocument(writer))
                        {
                            // Intentar configurar para mayor compatibilidad
                            pdfDocument.SetDefaultPageSize(iText.Kernel.Geom.PageSize.A4);

                            var merger = new PdfMerger(pdfDocument);

                            // Procesar el primer archivo con manejo de errores más detallado
                            try
                            {
                          

                                using (var pdfReader1 = new PdfReader(tempFile1))
                                {
                                    pdfReader1.SetUnethicalReading(true);
                                    using (var pdfDoc1 = new PdfDocument(pdfReader1))
                                    {
                                        // Verificar que el documento tenga páginas
                                        if (pdfDoc1.GetNumberOfPages() > 0)
                                        {
                                            merger.Merge(pdfDoc1, 1, pdfDoc1.GetNumberOfPages());
                                        }
                                        else
                                        {
                                            return BadRequest(new { error = "El primer archivo PDF no contiene páginas" });
                                        }
                                    }
                                }
                            }
                            catch (Exception ex1)
                            {
                                return BadRequest(new
                                {
                                    error = $"Error al procesar el primer archivo PDF: {ex1.Message}",
                                    detalles = ex1.ToString()
                                });
                            }

                            // Procesar el segundo archivo
                            try
                            {
                           

                                using (var pdfReader2 = new PdfReader(tempFile2))
                                {
                                    pdfReader2.SetUnethicalReading(true);
                                    using (var pdfDoc2 = new PdfDocument(pdfReader2))
                                    {
                                        // Verificar que el documento tenga páginas
                                        if (pdfDoc2.GetNumberOfPages() > 0)
                                        {
                                            merger.Merge(pdfDoc2, 1, pdfDoc2.GetNumberOfPages());
                                        }
                                        else
                                        {
                                            return BadRequest(new { error = "El segundo archivo PDF no contiene páginas" });
                                        }
                                    }
                                }
                            }
                            catch (Exception ex2)
                            {
                                return BadRequest(new
                                {
                                    error = $"Error al procesar el segundo archivo PDF: {ex2.Message}",
                                    detalles = ex2.ToString()
                                });
                            }
                        }
                    }

                    // Leer el archivo resultante
                    byte[] pdfBytes = System.IO.File.ReadAllBytes(outputFile);

                    // Generar nombre para el archivo unido
                    var nombreArchivo = $"pdf_unido_{DateTime.Now:yyyyMMdd_HHmmss}.pdf";

                    // Devolver el archivo PDF
                    //return File(pdfBytes, "application/pdf", nombreArchivo);
                    var f = File(pdfBytes, "application/pdf", nombreArchivo);
                    return Ok(new
                    {
                        message = "pdf creado",
                        pdfCreado = f
                    });
                }
                finally
                {
                    // Limpiar archivos temporales
                    try
                    {
                        if (Directory.Exists(tempDir))
                        {
                            Directory.Delete(tempDir, true);
                        }
                    }
                    catch
                    {
                        // Ignorar errores al limpiar
                    }
                }
            }
            catch (iText.Kernel.Exceptions.PdfException pdfEx)
            {
                return StatusCode(500, new
                {
                    error = $"Error específico de PDF: {pdfEx.Message}",
                    tipo = pdfEx.GetType().Name,
                    detalles = pdfEx.ToString(),
                    innerException = pdfEx.InnerException?.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    error = $"Error al procesar los PDFs: {ex.Message}",
                    tipo = ex.GetType().Name,
                    detalles = ex.ToString(),
                    innerException = ex.InnerException?.Message
                });
            }
        }
        /// <summary>
        /// Une múltiples archivos PDF en uno solo
        /// </summary>
        /// <param name="archivos">Lista de archivos PDF a unir</param>
        /// <returns>Un archivo PDF que contiene todos los PDFs unidos</returns>
        [HttpPost("unir-multiples")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UnirMultiplesArchivos(List<IFormFile> archivos)
        {
            // Validar que se recibieron archivos
            if (archivos == null || archivos.Count < 2)
            {
                return BadRequest(new { error = "Se requieren al menos dos archivos PDF" });
            }

            // Validar que todos los archivos sean PDFs
            foreach (var archivo in archivos)
            {
                if (!EsPDF(archivo))
                {
                    return BadRequest(new { error = $"El archivo '{archivo.FileName}' no es un PDF válido" });
                }
            }

            try
            {
                using (var memoryStream = new MemoryStream())
                {
                    // Crear el PDF de salida con configuración más robusta
                    var writerProperties = new WriterProperties();
                    writerProperties.SetPdfVersion(PdfVersion.PDF_1_7);

                    using (var pdfWriter = new PdfWriter(memoryStream, writerProperties))
                    {
                        pdfWriter.SetCloseStream(false);

                        using (var pdfDocument = new PdfDocument(pdfWriter))
                        {
                            var merger = new PdfMerger(pdfDocument);

                            // Procesar cada archivo
                            for (int i = 0; i < archivos.Count; i++)
                            {
                                var archivo = archivos[i];
                                using (var stream = archivo.OpenReadStream())
                                {
                                    try
                                    {
                                        var readerProperties = new ReaderProperties();
                                        using (var pdfReader = new PdfReader(stream, readerProperties))
                                        {
                                            pdfReader.SetUnethicalReading(true);
                                            using (var pdfDoc = new PdfDocument(pdfReader))
                                            {
                                                merger.Merge(pdfDoc, 1, pdfDoc.GetNumberOfPages());
                                            }
                                        }
                                    }
                                    catch (Exception ex)
                                    {
                                        return BadRequest(new
                                        {
                                            error = $"Error al leer el archivo '{archivo.FileName}' (archivo #{i + 1}): {ex.Message}"
                                        });
                                    }
                                }
                            }

                            pdfDocument.Close();
                        }
                    }

                    // Preparar el archivo para devolver
                    memoryStream.Position = 0;

                    // Generar nombre para el archivo unido
                    var nombreArchivo = $"pdfs_unidos_{DateTime.Now:yyyyMMdd_HHmmss}.pdf";

                    // Devolver el archivo PDF
                    return File(memoryStream.ToArray(), "application/pdf", nombreArchivo);
                }
            }
            catch (iText.Kernel.Exceptions.PdfException pdfEx)
            {
                return StatusCode(500, new
                {
                    error = $"Error específico de PDF: {pdfEx.Message}",
                    tipo = pdfEx.GetType().Name
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    error = $"Error al procesar los PDFs: {ex.Message}",
                    tipo = ex.GetType().Name
                });
            }
        }

        /// <summary>
        /// Valida si un archivo es un PDF
        /// </summary>
        private bool EsPDF(IFormFile archivo)
        {
            if (archivo == null || archivo.Length == 0)
                return false;

            // Verificar por extensión
            var extension = Path.GetExtension(archivo.FileName).ToLowerInvariant();
            if (extension != ".pdf")
                return false;

            // Verificar por content type
            var contentType = archivo.ContentType.ToLowerInvariant();
            return contentType == "application/pdf" || contentType == "application/x-pdf";
        }

        /// <summary>
        /// Método alternativo para unir PDFs página por página
        /// </summary>
        [HttpPost("unir-alternativo")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UnirDosArchivosAlternativo(IFormFile archivo1, IFormFile archivo2)
        {
            if (archivo1 == null || archivo2 == null)
            {
                return BadRequest(new { error = "Se requieren dos archivos PDF" });
            }

            if (!EsPDF(archivo1) || !EsPDF(archivo2))
            {
                return BadRequest(new { error = "Ambos archivos deben ser PDFs válidos" });
            }

            try
            {
                using (var outputStream = new MemoryStream())
                {
                    using (var writer = new PdfWriter(outputStream))
                    {
                        writer.SetCloseStream(false);

                        using (var pdfOutput = new PdfDocument(writer))
                        {
                            // Procesar primer archivo
                            using (var stream1 = archivo1.OpenReadStream())
                            using (var reader1 = new PdfReader(stream1))
                            {
                                reader1.SetUnethicalReading(true);
                                using (var pdfInput1 = new PdfDocument(reader1))
                                {
                                    int numberOfPages = pdfInput1.GetNumberOfPages();
                                    for (int i = 1; i <= numberOfPages; i++)
                                    {
                                        var page = pdfInput1.GetPage(i);
                                        var copiedPage = page.CopyTo(pdfOutput);
                                        pdfOutput.AddPage(copiedPage);
                                    }
                                }
                            }

                            // Procesar segundo archivo
                            using (var stream2 = archivo2.OpenReadStream())
                            using (var reader2 = new PdfReader(stream2))
                            {
                                reader2.SetUnethicalReading(true);
                                using (var pdfInput2 = new PdfDocument(reader2))
                                {
                                    int numberOfPages = pdfInput2.GetNumberOfPages();
                                    for (int i = 1; i <= numberOfPages; i++)
                                    {
                                        var page = pdfInput2.GetPage(i);
                                        var copiedPage = page.CopyTo(pdfOutput);
                                        pdfOutput.AddPage(copiedPage);
                                    }
                                }
                            }
                        }
                    }

                    outputStream.Position = 0;
                    var nombreArchivo = $"pdf_unido_{DateTime.Now:yyyyMMdd_HHmmss}.pdf";
                    return Ok("ok");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    error = "Error al procesar los PDFs",
                    mensaje = ex.Message,
                    tipo = ex.GetType().Name
                });
            }
        }
    }
}