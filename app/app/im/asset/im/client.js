(function () {
	var d = document;


    window.CHAT = {
		msgObj: d.getElementById("message"),
		username: null,
		userid: null,
		socket: null,

		//退出，本例只是一个简单的刷新
		logout:function(){
			//this.socket.disconnect();
			location.reload();
		},

        // 提交聊天消息内容
		submit: function(content){
			if(content != ''){
				var obj = {
					userid: this.userid,
					username: this.username,
					content: content
				};
				this.socket.emit('message', obj);
			}
			return false;
		},
        sendObject: function(obj){
            if (obj) {
                this.socket.emit('message', obj);
            }
            return false;
        },
        genUid:function(){
			return new Date().getTime()+""+Math.floor(Math.random()*899+100);
		},

        //更新系统消息，本例中在用户加入、退出的时候调用
		updateSysMsg:function(o, action){
			//当前在线用户列表
			var onlineUsers = o.onlineUsers;
			//当前在线人数
			var onlineCount = o.onlineCount;
			//新加入用户的信息
			var user = o.user;

			//更新在线人数
			var userhtml = '';
			var separator = '';
			for(key in onlineUsers) {
		        if(onlineUsers.hasOwnProperty(key)){
					userhtml += separator+onlineUsers[key];
					separator = '、';
				}
		    }
            console.log('当前共有 '+onlineCount+' 人在线，在线列表：'+userhtml)

			// 添加系统消息
            var msg = user.username + ((action == 'login') ? ' 加入了聊天室' : ' 退出了聊天室');
            eim.systemMessage('1', 'group', msg);
		},

        init:function(username) {
            // 客户端根据时间和随机数生成uid
			this.userid = this.genUid();
			this.username = username;

			// 连接websocket后端服务器
			this.socket = io.connect('ws://im.yun.com');

			// 告诉服务器端有用户登录
			this.socket.emit('login', {userid:this.userid, username:this.username});

			// 监听新用户登录
			this.socket.on('login', function(o){
				CHAT.updateSysMsg(o, 'login');
			});

			// 监听用户退出
			this.socket.on('logout', function(o){
				CHAT.updateSysMsg(o, 'logout');
			});

			// 监听消息发送
			this.socket.on('message', function(obj){
				var isme = (obj.from_id == CHAT.userid) ? true : false;

                console.log('消息', obj);
				if(isme){
				} else {
                    console.log('消息')
                    console.log(obj.content);
                    eim.addMessage('1', 'group', obj);
				}
			});

            this.socket.on('debug', function(obj){
                console.log('调试', obj);
            });

		}
	};

})();
