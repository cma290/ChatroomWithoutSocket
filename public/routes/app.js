var app = angular.module("app", ['ngRoute']);

app.config(function($routeProvider) {

	$routeProvider
	.when('/login', {
		templateUrl: '/views/login.html',
		controller: 'LoginController'
	})
	.when('/home', {
		templateUrl: '/views/home.html',
		controller: 'HomeController'
	})
	.otherwise({
		redirectTo: '/login'
	});
});

//page 'home' needs user to be logged in
app.run(function($location, $rootScope, SessionService){
	$rootScope.$on('$routeChangeStart', function(event, next, current){
		if ($location.path()=="/home" && !SessionService.get('nickname')){
			$location.path('/login');
		}
	});
});

app.controller("LoginController", function($scope, $location, $rootScope, SessionService){
	$scope.nicknameError = false;
	$scope.login = function (){
		if (!$scope.nickname || $scope.nickname.length < 2){
			// alert("Please enter at least two characters");
			$scope.nicknameError = true;
		} else {
			SessionService.set('nickname', $scope.nickname);
			SessionService.set('id', new Date().getTime());
			$location.path('/home');
			//$rootScope.$emit("nickname-set", $scope.nickname);
		}
	}
})

app.controller("HomeController", function($compile, $timeout, $http, $scope, $location, $rootScope, SessionService){
	$scope.id = SessionService.get('id');
	$scope.nickname = SessionService.get('nickname');

	//load recent 10 msgs
	var init = function(){
		console.log('init');
		$http.get('/api/history').then(function(response){
			for (var i=0; i < response.data.length; ++i) {
				var e = response.data[i];
				appendmsg(e.nickname, e.message, new Date(e.time), e.id);
			}
		});
	}
	init();

	//keep polling the server
	var interval = 1000;
	var retrieveMsgs = function () {
		$http.post('/api/msgs-since-last', {
			time: new Date().getTime(),
			interval:interval
		}).then(function (response) {
			console.log(response.data);
			for (var i = response.data.length - 1; i >=0; --i){
				var e = response.data[i];
				if(e.id !== $scope.id) {
					appendmsg(e.nickname, e.message, new Date(e.time), e.id);
				}
			}
			$timeout(retrieveMsgs, interval);
		});
	};
	retrieveMsgs();

	//append message to end of ul
	var appendmsg = function(name, msg, time, id){
		var ul = angular.element(document.querySelector('#messages'));	
		// var info = {name:name,msg:msg,time:time,id:id};
		// var templateString = "<message name='"+name+"' time='"+time+"' msg='"+msg+"'></message>";
		// var templateString = "<message info='"+info+"'></message>";
		// compile the custom directive before we use it.
		//ul.append($compile(templateString)($scope));
		var str = time.toString();
		time = str.slice(16, 24) +" " + str.slice(0, 10);
		ul.append("<div class='msg-wrapper'>"
				   	+"<img class='msg-avatar' src='http://api.adorable.io/avatar/50/"+id+"'>"
				   	+ "<h3 class='msg-name'> "+name+" </h3>"
				   	+ "<span class='msg-time'> @ "+time+"</span>"
				 	+ "<p class='msg-text'>"+msg+"</p>"
				 + "</div>"
				 );
	}

	//send a message to chat room
	$scope.sendMsg = function(){
		$scope.postTime = new Date();
		
		if($scope.msgToSend && $scope.msgToSend!=='') {
			appendmsg($scope.nickname, $scope.msgToSend, $scope.postTime, $scope.id);
			$http.post('/api/upload-newmsg', {
				nickname:$scope.nickname,
				id:$scope.id,
				message:$scope.msgToSend,
				time: $scope.postTime.getTime()
			});
			$scope.msgToSend = '';
			//scroll to bottom
		}

	}

	//logout
	
	$scope.logout = function(){
		SessionService.unset('nickname');
		SessionService.unset('id');
		$location.path("/login");
	}
})

app.factory("SessionService", function() {
	return {
		get: function(key) {
			return sessionStorage.getItem(key);
		},
		set: function(key, val) {
			return sessionStorage.setItem(key, val);
		},
		unset: function(key) {
			return sessionStorage.removeItem(key);
		}
	}
});

//message directive, not finished
app.directive('message', function() {
	return {
		templateUrl : '/views/message.html',
		scope:{
			//dirName:'=name',
			dirInfo:'=info'
			//dirMsg:'=msg'
		}
	};
});