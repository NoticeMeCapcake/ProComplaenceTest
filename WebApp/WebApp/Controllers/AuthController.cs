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
using Message = Microsoft.DotNet.Scaffolding.Shared.Messaging.Message;

namespace WebApp.Controllers {
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase {
        private readonly IConfiguration _configuration;
        private readonly MySqlConnection _dbConnection;
        private string selectQuery = @"select id from usertable where username = @username";
        
        public AuthController(IConfiguration configuration) {
            _configuration = configuration;
            _dbConnection = new MySqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        }

        [HttpPost("{username}")]
        public JsonResult Post(string username) {
            var query = @"insert into usertable (username) values (@username)";
            _dbConnection.Open();
            using (var command = new MySqlCommand(query, _dbConnection)) {
                command.Parameters.AddWithValue("@username", username);
                try {
                    command.Prepare();
                    command.ExecuteNonQuery();
                }
                catch (MySqlException e) {
                    if (!e.Message.Contains("Duplicate")) {
                        _dbConnection.Close();

                        return new JsonResult(new {
                            Status = "Failed",
                            Message = "Ошибка при создании пользователя"
                        });
                    }
                }
            }
            using (var command = new MySqlCommand(selectQuery, _dbConnection)) {
                command.Parameters.AddWithValue("@username", username);
                try {
                    command.Prepare();
                    var result = command.ExecuteScalar();
                    var id = Convert.ToInt32(result);
                    _dbConnection.Close();
                    return new JsonResult(new {
                        Status = "Ok",
                        Message = "Добро пожаловать",
                        Id = id
                    });
                }
                catch (MySqlException e) {
                    _dbConnection.Close();
                    return new JsonResult(new {
                        Status = "Failed",
                        Message = "Ошибка при создании пользователя"
                    });
                }
            }
        }
        
    }
}