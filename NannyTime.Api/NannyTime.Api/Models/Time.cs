using System;

namespace NannyTime.Api.Models
{
    public class Time
    {
        public DateTime Date { get; set; }
        public int StartTime { get; set; }
        public int StopTime { get; set; }
        public string Comment { get; set; }
        public string Name { get; set; }
    }
}