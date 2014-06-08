using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Playground.BballModels
{
	public class Player
	{
		public ObjectId Id { get; set; }
		public int Number { get; set; }
		public string Name { get; set; }
		public int FieldGoalAttempts { get; set; }
		public int TwoPointersMade { get; set; }
		public int ThreePointersMade { get; set; }
		public int FreeThrowAttempts { get; set; }
		public int FreeThrowsMade { get; set; }
		public int DefensiveRebounds { get; set; }
		public int OffensiveRebounds { get; set; }
		public int CommittedFouls { get; set; }
		public int FourcedFouls { get; set; }
		public int PassTurnover { get; set; }
		public int StealTurnover { get; set; }
	}
}