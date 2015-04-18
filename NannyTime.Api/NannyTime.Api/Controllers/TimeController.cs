using System.Net;
using System.Net.Http;
using System.Web.Http;
using NannyTime.Api.DAL;
using NannyTime.Api.Models;

namespace NannyTime.Api.Controllers
{
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
    }
}
