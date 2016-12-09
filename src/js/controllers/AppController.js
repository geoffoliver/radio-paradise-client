app.controller('AppController', function($scope, $uibModal, $http, $interval, $timeout, $cookies, ngAudio, ngAudioGlobals){

	var controller = this;

	var proxyScript = '/rp-proxy.php';
	var rpUrlBase = 'https://beta.radioparadise.com/';

	var progressCheck = null;

	ngAudioGlobals.unlock = false;

	$scope.ratingSong = false;
	
	// user info
	$scope.user = {
		id: $cookies.get('C_user_id'),
		username: $cookies.get('C_username'),
		hash: $cookies.get('C_passwd')
	};

	$scope.isLoggedIn = (
		$scope.user.id && 
		$scope.user.username && 
		$scope.user.hash
	);

	// slideshow
	$scope.isSlideshowActive = false;
	$scope.slideshowBackgroundImage = rpUrlBase+'/graphics/tv_img/11612.jpg';
	
	// music
	$scope.player = false;
	$scope.playlist = [];
	$scope.currentlyPlaying = {};

	// player state
	$scope.state = {
		loading: false,
		paused: false,
		progress: 0
	};

	progressCheck = $interval(function(){
		if($scope.player){
			$scope.state.progress = ($scope.player.progress * 100).toFixed(2);
		}
	}, 500);

	$scope.stopCheckingProgress = function(){
		$interval.cancel(progressCheck);
	};

	$scope.$on('destroy', function(){
		$scope.stopCheckingProgress();
	});

	this.toggleSlideshow = function(){
		$scope.isSlideshowActive = !$scope.isSlideshowActive;
	};

	var makeProxyData = function(action, data){
		var url = rpUrlBase + action;

		if(!angular.isUndefined(data)){
			if(angular.isObject(data)){
				url+='?';
				angular.forEach(data, function(key, val){
					url+='&'+val+'='+key;
				});
			}
		}

		return {
			params: {
				url: url,
				send_cookies: '1',
				mode: 'native'
			}
		};
	}

	var login = function(credentials){
		var data = makeProxyData('ajax_login.php', credentials);

		$http.get(proxyScript, data).then(function(resp){
			if(resp.data.indexOf('invalid login') === 0){
				alert('invalid login!');
				return;
			}

			var userParts = resp.data.trim().split('|');
			console.log(userParts);
			$scope.user = {
				id: userParts[2],
				username: userParts[0],
				hash: userParts[1],
			};

			$cookies.put('C_username', $scope.user.username);
			$cookies.put('C_passwd', $scope.user.hash);
			$cookies.put('C_user_id', $scope.user.id);
			$cookies.put('C_bitrate', '1');

			$scope.isLoggedIn = true;

			controller.getPlaylist();
		});
	};

	this.showLogin = function(){
		var loginModal = $uibModal.open({
			templateUrl: _templateBase + '/login.html',
			controllerAs: 'controller',
			controller: function($scope, $uibModalInstance){
				$scope.credentials = {
					username: '',
					passwd: ''
				};

				this.login = function(){
					if($scope.credentials.username && $scope.credentials.passwd){
						$uibModalInstance.close($scope.credentials);
					}
				};

				this.cancel = function(){
					$uibModalInstance.dismiss('cancel');
				};
			}
		});

		loginModal.result.then(function(creds){
			login(creds);
		});
	};
	
	this.getPlaylist = function(){
		var data = makeProxyData('papi_playlist', {
			offset: 0,
			num: 15
		});
		$http.get(proxyScript, data).then(function(resp){
			if(resp.status === 200 && angular.isArray(resp.data)){
				$scope.playlist = $scope.playlist.concat(resp.data).splice(-30);

				if($scope.playlist.length > 0){
					controller.play();
				}
			}
		});
	}

	this.pause = function(){
		$scope.player.pause();
	};

	this.play = function(){
		if($scope.playlist.length === 0){
			controller.getPlaylist();
			return;
		}

		if($scope.player && $scope.player.paused){
			$scope.player.play();
			return;
		}

		if(angular.equals($scope.currentlyPlaying, {})){
			$scope.currentlyPlaying = angular.copy($scope.playlist[0]);
		}
		
		if($scope.currentlyPlaying.url.indexOf('http') !== 0){
			controller.next();
			return;
		}

		// load the song
		$scope.player = ngAudio.load($scope.currentlyPlaying.url, $scope);

		$scope.player.complete(function(){
			controller.next(true);
		});

		$scope.player.play();

		$scope.$watch(function(){ return $scope.player.paused }, function(newVal, oldVal){
			$scope.state.paused = newVal;
		});

		$scope.$watch(function(){ return $scope.player.canPlay }, function(newVal, oldVal){
			if(newVal){
				$scope.state.loading = false;
				if($scope.currentlyPlaying.cue > 0){
					$scope.player.setCurrentTime($scope.currentlyPlaying.cue / 1000);
				}
			}else{
				$scope.state.loading = true;
			}
		});
	};

	this.next = function(force){
		if($scope.playlist.length == 0 ||
			(!force && $scope.currentlyPlaying.type == 'V')
		){
			return;
		}

		var index = 0;

		angular.forEach($scope.playlist, function(item, idx){
			if(item.url == $scope.currentlyPlaying.url){
				index = idx+1;
			};
		});

		$scope.currentlyPlaying = angular.copy($scope.playlist[index]);

		if(index >= 14){
			this.getPlaylist();
		}

		if($scope.player){
			$scope.player.stop();
			$scope.player = null;
		}

		controller.play();
	};

	this.rateSong = function(rating){
		$scope.ratingSong = false;
		$scope.currentlyPlaying.rating = rating;

		var data = makeProxyData('ajax_rp3_rating.php', {
			song_id: $scope.currentlyPlaying.song_id,
			rating: rating
		});
		
		$http.get(proxyScript, data).then(function(resp){
			if(resp.status !== 200){
				$scope.currentlyPlaying.rating = 0;
			}
		});
	};

	this.playSomethingDifferent = function(){

	};

	if($scope.isLoggedIn){
		this.getPlaylist();
	}

});
