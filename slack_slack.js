var config = require('./config.json');
var http = require('http');
var Uri = require('jsuri');
var request = require('request');

const port = 3000;

http.createServer(function (req, res) {
req.setEncoding('utf8');
req.on('data', function(data){
	var uri = new Uri();
	uri.setQuery(data);
	var input = {token: uri.getQueryParamValue('token'),
                     text: uri.getQueryParamValue('text')
                          };
    	if(input.token !== config.slack_token) {
    		res.writeHead(500, {'Content-Type': 'text/plain'});
  		res.end('incorrect token');
	}
	var reply = (input.text + ": ").split(":");
	var gh_response = "We didn't do anything!";
	request({
	"url":"https://api.github.com/repos/" + config.gh_user + "/" + config.gh_repo + "/issues",
	"method":"POST",
  	"headers": {"Authorization": "token " + config.gh_token, "User-Agent": config.gh_user},
	"body": JSON.stringify({title: reply[0], body: reply[1]})
	}, function(err, response, body) {
		if (err){
		       	console.log(err);
		}
		else if (response == undefined){
			gh_response = "Error: Please check the format of your request";
		}
		else if(response.statusCode !== 201){
			gh_response = "Issue not created: " + response.statusCode + ": " + body;
		}
		else{
			gh_response = "New issue successfully created";
		}
	
  res.writeHead(200, {"Content-Type": "application/json"});
  var reply = {response_type : "in_channel", text : gh_response};
  var json = JSON.stringify(reply);
  res.end(json);
	});
  });
}).listen(port);
console.log('Listening in on port ' + port);  
