using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.VisualBasic.FileIO;
using System;
using System.Collections;
using MySqlConnector;
using NuGet.Protocol;
using NuGet.Protocol.Plugins;
using WebApp.Models;

namespace WebApp.Controllers {
    [Route("api/[controller]")]
    [ApiController]
    public class FileReadController : ControllerBase {
        private readonly IConfiguration _configuration;
        private readonly MySqlConnection _dbConnection;
        
        public FileReadController(IConfiguration configuration) {
            _configuration = configuration;
            _dbConnection = new MySqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        }
        
        [HttpGet("{id}")]
        public JsonResult Get(int id) {
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
                    return new JsonResult(new {
                        Status = "Failed",
                        Message = "Ошибка, нет такого файла"
                    });
                }
            }
            _dbConnection.Close();
            
            if (filePath == "") {
                return new JsonResult(new {
                    Status = "Failed",
                    Message = "Ошибка, нет такого файла"
                });
            }
            var delimiter = ",";

            string[] headerFields;
            List<string[]> data = new List<string[]>();

            using (var parser = new TextFieldParser(filePath)) {
                parser.TextFieldType = FieldType.Delimited;
                parser.SetDelimiters(delimiter);
                headerFields = parser.ReadFields();
                
                while (!parser.EndOfData) {
                    // берем одну строку
                    string[] fields = parser.ReadFields();
                    data.Add(fields);
                }
            }

            return new JsonResult(new { ExactFile = new { Headers = headerFields, Data = data } });
        }
    }
}