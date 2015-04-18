using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Xml.Linq;
using NannyTime.Api.Models;

namespace NannyTime.Api.DAL
{
    public class NannyTimeDAL
    {
        public XDocument GetData()
        {
            return XDocument.Load(GetPath());
        }

        public void SaveTime(Time timeData)
        {
            XDocument document = GetData();
            if (document == null || document.Root == null)
            {
                throw new NullReferenceException("Data is invalid");
            }

            document.Root.Add(
                new XElement("time", 
                    new XElement("date", timeData.Date),
                    new XElement("start", timeData.StartTime),
                    new XElement("end", timeData.StopTime),
                    new XElement("comment", timeData.Comment)));

            document.Save(GetPath());
        }

        public IEnumerable<Time> GetAllData()
        {
            XDocument document = GetData();
            if (document == null || document.Root == null)
            {
                throw new NullReferenceException("Data is invalid");
            }

            return document.Root
                .Descendants("time")
                .Select(t => new Time
                {
                    Comment = (string) t.Element("comment"),
                    Date = (DateTime)t.Element("date"),
                    StartTime = (int)t.Element("start"),
                    StopTime = (int)t.Element("end")
                });
        }

        private static string GetPath()
        {
            string path = HttpContext.Current.Server.MapPath("~/App_Data/data.xml");
            if (File.Exists(path))
            {
                return path;
            }

           CreateEmptyFile(path);
            return path;
        }

        private static void CreateEmptyFile(string filePath)
        {
            XDocument doc = XDocument.Parse("<data></data>");
            doc.Save(filePath);
        }
    }
}