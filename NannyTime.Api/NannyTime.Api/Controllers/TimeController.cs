using System.Net;
using System.Net.Http;
using System.Web.Http;
using NannyTime.Api.DAL;
using NannyTime.Api.Models;

namespace NannyTime.Api.Controllers
{
    public class TimeController : ApiController
    {
        private readonly NannyTimeDAL _nannyTimeDal;

        public TimeController()
        {
            _nannyTimeDal = new NannyTimeDAL();
        }

        [HttpPost]
        public HttpResponseMessage Time(Time timeData)
        {
            _nannyTimeDal.SaveTime(timeData);
            return new HttpResponseMessage(HttpStatusCode.OK);
        }
    }
}
