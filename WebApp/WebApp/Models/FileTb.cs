namespace WebApp.Models; 

public class FileTb {
    public int Id { get; set; }
    public string? Filename { get; set; }
    public string? Filepath { get; set; }
    public DateOnly LastDate { get; set; }
}