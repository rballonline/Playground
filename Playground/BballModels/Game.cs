using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Playground.BballModels
{
	public class Game
	{		
		public ObjectId Id { get; set; }
		public DateTime DateOfGame { get; set; }
		public string Name { get; set; }
		public List<ObjectId> PlayerIds { get; set; }
		public List<Play> Plays { get; set; }
	}
}