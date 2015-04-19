using System.Web.Http;

namespace NannyTime.Api
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            config.EnableCors();
            config.MapHttpAttributeRoutes();
            
            //config.Routes.MapHttpRoute(
            //    name: "DefaultApi",
            //    routeTemplate: "api/{controller}/{id}",
            //    defaults: new { id = RouteParameter.Optional }
            //);

            config.Routes.MapHttpRoute("GetAllData", "get", new {controller = "Time", action = "GetAllData"});
            config.Routes.MapHttpRoute("SubmitTime", "submit", new { controller = "Time", action = "Time" });
        }
    }
}
