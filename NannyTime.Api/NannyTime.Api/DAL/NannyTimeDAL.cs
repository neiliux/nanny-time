using System;
using System.IO;
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
            XDocument data = GetData();
            if (data == null || data.Root == null)
            {
                throw new NullReferenceException("Data is invalid");
            }

            data.Root.Add(
                new XElement("time", 
                    new XElement("date", timeData.Date),
                    new XElement("start", timeData.StartTime),
                    new XElement("end", timeData.StopTime),
                    new XElement("comment", timeData.Comment)));

            data.Save(GetPath());
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