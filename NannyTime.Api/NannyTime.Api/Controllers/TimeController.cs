using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Web.Http;
using System.Web.Http.Cors;
using NannyTime.Api.DAL;
using NannyTime.Api.Models;
using System;
using System.Web;
using System.Configuration;
using System.Text;

namespace NannyTime.Api.Controllers
{
    [EnableCors("*", "*", "*")]
    public class TimeController : ApiController
    {
        private readonly NannyTimeDAL _nannyTimeDAL;

        public TimeController()
        {
            _nannyTimeDAL = new NannyTimeDAL();
        }

        [HttpPost]
        public HttpResponseMessage Time(Time timeData)
        {
            try
            {
                _nannyTimeDAL.SaveTime(timeData);
            }
            catch (Exception ex)
            {
                WriteExceptionLog(ex);
            }

            try
            {
                SendEmail(timeData);
            }
            catch (Exception ex)
            {
                WriteExceptionLog(ex);
            }

            return new HttpResponseMessage(HttpStatusCode.OK);
        }

        [HttpGet]
        public HttpResponseMessage GetAllData()
        {
            IEnumerable<Time> timeValues = _nannyTimeDAL.GetAllData();
            return Request.CreateResponse(HttpStatusCode.OK, timeValues, new JsonMediaTypeFormatter());
        }

        private void WriteExceptionLog(Exception ex)
        {
            string path = HttpContext.Current.Server.MapPath(
                    string.Format("~/App_Data/error_data_{0}.txt", Guid.NewGuid().ToString()));

            System.IO.File.WriteAllText(path, ex.ToString());
        }

        private void SendEmail(Time timeData)
        {
            string smtpServer = ConfigurationManager.AppSettings["SMTPServer"];
            int port = int.Parse(ConfigurationManager.AppSettings["Port"]);
            string from = ConfigurationManager.AppSettings["EmailFrom"];
            string emails = ConfigurationManager.AppSettings["To"];
            string username = ConfigurationManager.AppSettings["username"];
            string password = ConfigurationManager.AppSettings["password"];

            foreach (string to in GetToEmails(emails))
            {
                System.Net.Mail.MailMessage message = new System.Net.Mail.MailMessage(from, to);
                message.Subject = "nanny-time: Submission";
                message.IsBodyHtml = true;
                
                StringBuilder sb = new StringBuilder();
                sb.Append("<div>Submission Time</div>");
                sb.AppendFormat("<div>{0}</div>", timeData.SubmittedDate);
                sb.Append("<div>Name</div>");
                sb.AppendFormat("<div>{0}</div>", timeData.Name);
                sb.Append("<div>Start</div>");
                sb.AppendFormat("<div>{0}</div>", timeData.StartTime);
                sb.Append("<div>End</div>");
                sb.AppendFormat("<div>{0}</div>", timeData.StopTime);

                message.Body = sb.ToString();

                System.Net.Mail.SmtpClient smtpClient = new System.Net.Mail.SmtpClient(smtpServer, port);
                smtpClient.EnableSsl = true;
                smtpClient.Credentials = new System.Net.NetworkCredential(username, password);
                smtpClient.Send(message);
            }
        }

        private List<string> GetToEmails(string emails)
        {
            List<string> emailList = new List<string>();

            if (emails.Contains(","))
            {
                emailList = new List<string>(emails.Split(','));
            }
            else
            {
                emailList.Add(emails);
            }

            return emailList;
        }
    }
}
