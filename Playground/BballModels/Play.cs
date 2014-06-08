using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Playground.BballModels
{
	public class Play
	{
		public ObjectId Id { get; set; }
		public DateTime Time { get; set; }
		public int Period { get; set; }
		public Player Player { get; set; }
		public string Action { get; set; }
	}
}