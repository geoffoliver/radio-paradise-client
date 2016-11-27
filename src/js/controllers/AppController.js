app.controller('AppController', function($scope, $uibModal, $http, ngAudio, ngAudioGlobals){
	
	var controller = this;

	var urlBase = 'https://beta.radioparadise.com';

	var player = false;

	ngAudioGlobals.unlock = false;
	
	// user info
	$scope.user = {};
	$scope.isLoggedIn = false;

	// slideshow
	$scope.isSlideshowActive = false;
	$scope.slideshowBackgroundImage = urlBase+'/graphics/tv_img/11612.jpg';
	
	// music
	$scope.playlist = [];
	$scope.currentlyPlaying = {};

	// player state
	$scope.state = {
		loading: false,
		paused: false
	};

	this.toggleSlideshow = function(){
		$scope.isSlideshowActive = !$scope.isSlideshowActive;
	};

	var login = function(credentials){
		$http.get(urlBase + '/ajax_login.php', {params: credentials}).then(function(resp){
			if(resp.data.indexOf('invalid login') === 0){
				alert('invalid login!');
				return;
			}

			var userParts = resp.data.split('|');

			$scope.user = {
				id: userParts[2],
				username: userParts[0],
				hash: userParts[1],
			}

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
		$http.get(urlBase + '/papi_playlist', {offset: 0, num: 15}).then(function(resp){
			if(resp.status === 200 && angular.isArray(resp.data)){
				$scope.playlist = $scope.playlist.concat(resp.data).splice(-30);

				if($scope.playlist.length > 0){
					controller.play();
				}
			}
		});
	}

	this.pause = function(){
		player.pause();
	};

	this.play = function(){
		if($scope.playlist.length === 0){
			controller.getPlaylist();
			return;
		}

		if(player && player.paused){
			player.play();
			return;
		}

		if(angular.equals($scope.currentlyPlaying, {})){
			$scope.currentlyPlaying = $scope.playlist[0];
		}
		
		// load the song
		player = ngAudio.load($scope.currentlyPlaying.url, $scope);

		player.complete(function(){
			controller.next(true);
		});

		player.play();

		$scope.$watch(function(){ return player.paused }, function(newVal, oldVal){
			$scope.state.paused = newVal;
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

		$scope.currentlyPlaying = $scope.playlist[index];

		if(index >= 14){
			this.getPlaylist();
		}

		player.stop();
		player = null;
		controller.play();
	};

	this.rate = function(){

	};

	this.playSomethingDifferent = function(){

	};


});
