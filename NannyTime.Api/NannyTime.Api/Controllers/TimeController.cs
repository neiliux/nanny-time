using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Web.Http;
using System.Web.Http.Cors;
using NannyTime.Api.DAL;
using NannyTime.Api.Models;

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
            _nannyTimeDAL.SaveTime(timeData);
            return new HttpResponseMessage(HttpStatusCode.OK);
        }

        [HttpGet]
        public HttpResponseMessage GetAllData()
        {
            IEnumerable<Time> timeValues = _nannyTimeDAL.GetAllData();
            return Request.CreateResponse(HttpStatusCode.OK, timeValues, new JsonMediaTypeFormatter());
        }
    }
}
