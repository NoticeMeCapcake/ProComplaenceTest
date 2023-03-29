using System;
using System.IO;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using NuGet.Protocol;
using NuGet.Protocol.Plugins;
using WebApp.Models;

namespace WebApp.Controllers {
    [Route("api/[controller]")]
    [ApiController]
    public class FileUploadController : ControllerBase {
        private readonly IConfiguration _configuration;
        private readonly MySqlConnection _dbConnection;
        private readonly IHostEnvironment _hostingEnvironment;

        private static readonly string _selectQuery = $@"select
            id as {nameof(FileTb.Id)},
            filename as {nameof(FileTb.Filename)},
            filepath as {nameof(FileTb.Filepath)},
            lastdate as {nameof(FileTb.LastDate)}
            from filetb
            where userid = @userid;";

        public FileUploadController(IHostEnvironment hosingEnvironment, IConfiguration configuration) {
            _configuration = configuration;
            _hostingEnvironment = hosingEnvironment;
            _dbConnection = new MySqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        }

        [HttpPost("{id}")]
        public IActionResult Post(int id) {
            
            foreach (var file in Request.Form.Files)
            {
                // получаем имя файла
                    var fileName = System.IO.Path.GetFileName(file.FileName);
                    // сохраняем файл в папку в проекте
                    var filePath = "./userFiles/" + id;
                    if (!Directory.Exists(filePath)) {
                        Directory.CreateDirectory(filePath);
                    }
                     filePath += "/" + fileName;
                    using (Stream fileStream = new FileStream(filePath, FileMode.Create, FileAccess.Write)) {
                        file.CopyTo(fileStream);
                    }
                    var query = @"INSERT INTO filetb (Filename, Filepath, lastdate, userid) VALUES (@Filename, @Filepath, curdate(), @userid)";
                    _dbConnection.Open();
                    using (var command = new MySqlCommand(query, _dbConnection)) {
                        command.Parameters.AddWithValue("@Filename", fileName);
                        command.Parameters.AddWithValue("@Filepath", filePath);
                        command.Parameters.AddWithValue("@userid", (Object) id);
                        try {
                            command.Prepare();
                            command.ExecuteNonQuery();
                        }
                        catch (MySqlException e) {
                            if (e.Message.Contains("Duplicate")) {
                                query = @"UPDATE filetb SET lastdate = curdate() WHERE filename = @Filename and userid = @userid";
                                using (var UPDcommand = new MySqlCommand(query, _dbConnection)) {
                                    UPDcommand.Parameters.AddWithValue("@Filename", fileName);
                                    UPDcommand.Parameters.AddWithValue("@userid", (Object) id);
                                    try {
                                        UPDcommand.Prepare();
                                        UPDcommand.ExecuteNonQuery();
                                    }
                                    catch (MySqlException er) {
                                        _dbConnection.Close();
                                        return BadRequest(new {
                                            Message = "При обновлении файла произошла ошибка"
                                        });
                                    }
                                }
                                    
                                _dbConnection.Close();
                                return Ok(new {
                                    Status = "Success",
                                });
                            }
                            _dbConnection.Close();
                            return BadRequest(new {
                                Status = "Failed",
                                Message = "При создании файла произошла ошибка"
                            });
                        }
                    }
                    _dbConnection.Close();
            }
            return Ok();

        }

        [HttpGet("{id}")]
        public JsonResult Get(int id) {
            var query = _selectQuery;
            var result = new List<FileTb>();
                _dbConnection.Open();
                using (var command = new MySqlCommand(query, _dbConnection)) {
                    command.Parameters.AddWithValue("@userid", (Object) id);
                    using (var reader = command.ExecuteReader()) {
                        while (reader.Read()) {
                            result.Add(new FileTb {
                                Id = reader.GetInt32(0),
                                Filename = reader.GetString(1),
                                Filepath = reader.GetString(2),
                                LastDate = reader.GetDateOnly(3)
                            });
                        }
                    }
                }

                _dbConnection.Close();

            return new JsonResult(result);

        }
        
        [HttpDelete("{id}")]
        public IActionResult Delete(int id) {
            var getQuery = @"select filepath from filetb where id = @id";
            String filePath = "";
            _dbConnection.Open();
            using (var getCommand = new MySqlCommand(getQuery, _dbConnection)) {
                getCommand.Parameters.AddWithValue("@id", (Object) id);
                try {
                    getCommand.Prepare();
                    var result = getCommand.ExecuteScalar();
                    filePath = result.ToString();
                    Console.WriteLine(filePath);

                }
                catch (MySqlException e) {
                    _dbConnection.Close();
                    return BadRequest(new {
                        Status = "Failed",
                        Message = "Ошибка, нет такого файла"
                    });
                }
            }
            _dbConnection.Close();
            
            if (filePath == "") {
                return BadRequest(new {
                    Status = "Failed",
                    Message = "Ошибка, нет такого файла"
                });
            }
            
            //delete file
            if (System.IO.File.Exists(filePath)) {
                System.IO.File.Delete(filePath);
            }
            
            var query = @"delete from filetb where id = @id";
            _dbConnection.Open();
            using (var command = new MySqlCommand(query, _dbConnection)) {
                command.Parameters.AddWithValue("@id", (Object) id);
                try {
                    command.Prepare();
                    command.ExecuteNonQuery();
                }
                catch (MySqlException e) {
                    _dbConnection.Close();
                    return BadRequest(new {
                        Status = "Failed",
                        Message = "При удалении файла произошла ошибка"
                    });
                }
            }
            _dbConnection.Close();
            return Ok();
        }
    }
}

