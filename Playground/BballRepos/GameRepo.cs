using MongoDB.Bson;
using MongoDB.Driver;
using Playground.BballModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Playground.BballRepos
{
	public class GameRepo
	{
		private MongoCollection<Game> GetCollection()
		{
			var connectionString = "mongodb://appharbor_77102733-6119-4072-ac3b-1d135e07e4d4:cot255s5hgh1dkg5e5lulmtfn7@ds027308.mongolab.com:27308/appharbor_77102733-6119-4072-ac3b-1d135e07e4d4";
			var url = new MongoUrl(connectionString);
			var client = new MongoClient(url);
			var server = client.GetServer();
			var database = server.GetDatabase(url.DatabaseName);
			return database.GetCollection<Game>("games");
		}

		public ObjectId Insert(Game game)
		{
			var collection = GetCollection();
			collection.Insert(game);
			return game.Id;
		}

		public MongoCursor<Game> GetAll()
		{
			return GetCollection().FindAll();
		}
	}
}