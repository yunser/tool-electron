var http = require('http');

var nodegit = require('nodegit');
console.log(nodegit);
function myNode(request, response){
  response.writeHead(200, {'Content-type':'text/plain'});
  response.write('hello world'); //hello world
  response.end();
}
http.createServer(myNode).listen(2222); //监听2222端口
console.log('Server has started'); //在控制台提示服务启动