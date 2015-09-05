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

            XElement existingEntry = GetExistingTimeEntry(document, timeData);
            if (existingEntry != null)
            {
                UpdateExistingEntry(existingEntry, timeData);
            }
            else
            {
                document.Root.Add(
                    new XElement("time",
                        new XElement("date", timeData.Date),
                        new XElement("start", timeData.StartTime),
                        new XElement("end", timeData.StopTime),
                        new XElement("comment", timeData.Comment),
                        new XElement("name", timeData.Name)));
            }

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
                    StopTime = (int)t.Element("end"),
                    Name = (string)t.Element("name")
                });
        }

        private static void UpdateExistingEntry(XElement timeNode, Time time)
        {
            var archiveNode = timeNode.Element("archive");
            if (archiveNode == null)
            {
                archiveNode = new XElement("archive");
                timeNode.Add(archiveNode);
            }

            archiveNode.Add(new XElement("archiveTime",
                    new XElement("comment", (string)timeNode.Element("comment")),
                    new XElement("start", (string)timeNode.Element("start")),
                    new XElement("end", (string)timeNode.Element("end"))));

            timeNode.SetElementValue("comment", time.Comment);
            timeNode.SetElementValue("start", time.StartTime);
            timeNode.SetElementValue("end", time.StopTime);
        }

        private static XElement GetExistingTimeEntry(XDocument document, Time time)
        {
            if (document == null || document.Root == null)
            {
                throw new NullReferenceException("document");
            }

            return document.Root.Descendants("time")
                .FirstOrDefault(e =>
                {
                    var date = (DateTime) e.Element("date");
                    return time.Date.Day == date.Day &&
                           time.Date.Month == date.Month &&
                           time.Date.Year == date.Year;
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