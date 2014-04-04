using Nancy;
using Nancy.Conventions;

namespace Playground.Helpers
{
	public class Bootstrapper : DefaultNancyBootstrapper
	{
		protected override void ConfigureConventions(NancyConventions conventions)
		{
			base.ConfigureConventions(conventions);

			conventions.StaticContentsConventions.Add(StaticContentConventionBuilder.AddDirectory("scripts", @"scripts"));
			conventions.StaticContentsConventions.Add(StaticContentConventionBuilder.AddDirectory("fonts", @"fonts"));
		}
	}
}