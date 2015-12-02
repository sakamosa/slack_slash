/**********************************************************************
 Create a new GitHub issue through a custom Slack slash command
 Sakamoto 12/1/2015
***********************************************************************/

//include the necessary modules and files
var config = require('./config.json');
var http = require('http');
var Uri = require('jsuri');
var request = require('request');

//assign the port you will be listening in on
const port = 3000;

//get the server up and running
http.createServer(function (req, res) {
req.setEncoding('utf8');

//sit and wait until some data comes by
req.on('data', function(data){
	var uri = new Uri();
	//parse the url encoded data
	uri.setQuery(data);
	//grab the parts we need
	var input = {token: uri.getQueryParamValue('token'),
                     text: uri.getQueryParamValue('text')
                          };
	//check that the data was sent from our channel
    	if(input.token !== config.slack_token) {
    		res.writeHead(500, {'Content-Type': 'text/plain'});
  		res.end('incorrect token');
	}
	var gh_response = "We didn't do anything!";
	//parse the data text to extract the title and body of our github issue
	var reply = (input.text + ": ").split(":");
	//send our POST to GitHub 
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
  //relay the proper respoinse back to Slack, in-channel means everyone can see it
  var reply = {response_type : "in_channel", text : gh_response};
  var json = JSON.stringify(reply);
  res.end(json);
	});
  });
}).listen(port);
console.log('Listening in on port ' + port);  
